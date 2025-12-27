import { useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { differenceInMinutes, parse, isAfter, isBefore } from 'date-fns';

export function useNotification() {
    const { preferences, totalToday } = useUser();



    useEffect(() => {
        if (!preferences.notificationsEnabled) return;
        if (totalToday >= preferences.dailyGoal) return; // Goal reached

        const checkReminder = () => {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            // Parse Wake/Sleep times
            const wakeDate = parse(preferences.wakeTime, 'HH:mm', now);
            const sleepDate = parse(preferences.sleepTime, 'HH:mm', now);

            // If outside wake/sleep window, do nothing
            if (isBefore(now, wakeDate) || isAfter(now, sleepDate)) return;

            // Logic: Simple interval check
            // In a real app, we'd store "lastMealTime" or "lastRemindedTime"
            // For this MVP, we can store 'lastReminded' in localStorage or check last log time.
            // Let's check last log time from DB or context? 
            // Context has `todayIntake`.

            // We can access `todayIntake` from context if we include it in deps, but let's be careful about re-renders.
            // Ideally we pass `lastDrinkTime` to this hook.
            // Let's assume the hook is inside Layout where it has access.
        };

        // Setting up an interval to run logic.
        const intervalId = setInterval(() => {
            // We need the latest data. 
            // This is tricky inside useEffect without ref or dependency.
            // We will restructure this logic into a function that we call.
        }, 60000); // Check every minute

        return () => clearInterval(intervalId);
    }, [preferences.notificationsEnabled, preferences.dailyGoal, totalToday]); // Re-run if these change

    // Returning nothing for now, it's a side-effect hook.
}

// Improved version below that actually works with the context data
export function NotificationManager() {
    const { preferences, todayIntake, totalToday } = useUser();

    useEffect(() => {
        if (!preferences.notificationsEnabled) return;
        if (Notification.permission !== 'granted') return;
        if (totalToday >= preferences.dailyGoal) return;

        const interval = setInterval(() => {
            const now = new Date();
            const wakeDate = parse(preferences.wakeTime, 'HH:mm', now);
            const sleepDate = parse(preferences.sleepTime, 'HH:mm', now);

            if (isBefore(now, wakeDate) || isAfter(now, sleepDate)) return;

            // Find last drink time
            const lastLog = todayIntake.length > 0
                ? todayIntake[todayIntake.length - 1]
                : null;

            const lastTime = lastLog ? new Date(lastLog.timestamp) : wakeDate;
            const diff = differenceInMinutes(now, lastTime);

            if (diff >= preferences.interval) {
                // Check if we already notified recently? 
                // We don't want to spam. We need state for "lastNotified".
                // We'll store lastNotified in sessionStorage to avoid persistence across reload if needed, 
                // or just rely on the fact that user should drink.

                const lastNotified = sessionStorage.getItem('lastNotified');
                const lastNotifiedTime = lastNotified ? new Date(parseInt(lastNotified)) : null;

                if (!lastNotifiedTime || differenceInMinutes(now, lastNotifiedTime) >= preferences.interval) {
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.ready.then(registration => {
                            registration.showNotification("Time to drink water MiMi😚💧", {
                                body: `stay hydrated babes! You need ${preferences.dailyGoal - totalToday}ml more today`,
                                icon: '/cute-cat-water.png'
                            });
                        });
                    } else {
                        new Notification("Time to drink water MiMi😚💧", {
                            body: `stay hydrated babes! You need ${preferences.dailyGoal - totalToday}ml more today`,
                            icon: '/cute-cat-water.png'
                        });
                    }
                    sessionStorage.setItem('lastNotified', now.getTime().toString());
                }
            }
        }, 10 * 1000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [preferences, todayIntake, totalToday]);

    return null; // Renderless component
}
