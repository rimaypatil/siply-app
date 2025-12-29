import { useEffect, useRef } from 'react';
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
    const stateRef = useRef({ preferences, todayIntake, totalToday });

    // Keep ref updated so worker callback has latest data without re-binding
    useEffect(() => {
        stateRef.current = { preferences, todayIntake, totalToday };
    }, [preferences, todayIntake, totalToday]);

    useEffect(() => {
        if (!preferences.notificationsEnabled) return;

        // Request permission if not granted
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Silent audio to keep the browser from throttling this tab aggressively
        // This is a known workaround for web apps to stay alive in background
        const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAgZGF0YQQAAAAAAA==');
        audio.loop = true;

        // Try to play audio to keep thread active (requires user interaction first usually)
        // We catch error in case autoplay is blocked, but usually after interaction it works
        audio.play().catch(e => console.log("Background keep-alive audio waiting for interaction"));

        const worker = new Worker(new URL('../../workers/timer.worker.js', import.meta.url), { type: 'module' });

        worker.onmessage = () => {
            const { preferences: prefs, totalToday: currentTotal, todayIntake: logs } = stateRef.current;

            if (Notification.permission !== 'granted') return;
            if (currentTotal >= prefs.dailyGoal) return;

            const now = new Date();
            const wakeDate = parse(prefs.wakeTime, 'HH:mm', now);
            const sleepDate = parse(prefs.sleepTime, 'HH:mm', now);

            // Handle overnight schedules (e.g. 23:00 to 07:00)
            const isOvernight = isBefore(sleepDate, wakeDate);
            const isAwake = isOvernight
                ? (isAfter(now, wakeDate) || isBefore(now, sleepDate))
                : (isAfter(now, wakeDate) && isBefore(now, sleepDate));

            if (!isAwake) return;

            // Find last drink time
            const lastLog = logs.length > 0
                ? logs[logs.length - 1]
                : null;

            const lastTime = lastLog ? new Date(lastLog.timestamp) : wakeDate;
            const minutesSinceDrink = differenceInMinutes(now, lastTime);

            if (minutesSinceDrink >= prefs.interval) {
                // Check last notified time from localStorage to be persistent across reloads
                const lastNotifiedStr = localStorage.getItem('lastNotified');
                const lastNotifiedTime = lastNotifiedStr ? new Date(parseInt(lastNotifiedStr)) : null;

                // Don't notify if we just notified recently (within interval)
                // We use a small buffer (50% of interval) to prevent double notification if worker ticks fast,
                // BUT we must allow re-notification if enough time actually passed.
                // The issue "stops after 2-3 times" implies we might be blocking ourselves or the worker stops.
                // With the worker fix and audio keep-alive, the worker should keep ticking.

                // If we haven't notified yet OR it's been long enough since last notification
                const minutesSinceLastNotification = lastNotifiedTime ? differenceInMinutes(now, lastNotifiedTime) : 9999;

                if (minutesSinceLastNotification >= prefs.interval) {

                    const title = "Time to drink water MiMi😚💧";
                    const options = {
                        body: `stay hydrated babes! You need ${prefs.dailyGoal - currentTotal}ml more today`,
                        icon: '/cute-cat-water.png',
                        tag: 'hydration-reminder',
                        renotify: true,
                        requireInteraction: true, // Keep notification on screen until user clicks
                    };

                    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                        navigator.serviceWorker.ready.then(registration => {
                            registration.showNotification(title, options);
                        });
                    } else {
                        new Notification(title, options);
                    }

                    localStorage.setItem('lastNotified', now.getTime().toString());
                }
            }
        };

        worker.postMessage('start');

        return () => {
            worker.postMessage('stop');
            worker.terminate();
            audio.pause();
        };
    }, [preferences.notificationsEnabled]); // Only restart if on/off toggle changes

    return null;
}
