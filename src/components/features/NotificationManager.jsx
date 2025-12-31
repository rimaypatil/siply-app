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
    const { preferences, totalToday } = useUser();
    const hasSubscribed = useRef(false);

    // Helper to convert VAPID key
    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator)) return;
        if (!preferences.notificationsEnabled) return;

        try {
            const registration = await navigator.serviceWorker.ready;

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            // Get Public Key from Server
            const response = await fetch(`${apiUrl}/api/vapid-key`);
            if (!response.ok) throw new Error("Server not running or reachable");
            const { publicKey } = await response.json();

            const convertedVapidKey = urlBase64ToUint8Array(publicKey);

            // Subscribe
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            // Send Subscription to Server
            await fetch(`${apiUrl}/api/subscribe`, {
                method: 'POST',
                body: JSON.stringify({
                    subscription,
                    preferences: {
                        interval: preferences.interval, // in minutes
                        wakeTime: preferences.wakeTime || '08:00',
                        sleepTime: preferences.sleepTime || '22:00',
                        dailyGoal: preferences.dailyGoal,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    }
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Subscribed to Push Notifications!", subscription);
            hasSubscribed.current = true;

        } catch (err) {
            console.error("Failed to subscribe to push", err);
        }
    };

    useEffect(() => {
        if (preferences.notificationsEnabled) {
            // Check permission
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(perm => {
                    if (perm === 'granted') subscribeToPush();
                });
            } else if (Notification.permission === 'granted') {
                subscribeToPush();
            }
        }
    }, [preferences.notificationsEnabled, preferences.interval, preferences.wakeTime, preferences.sleepTime]);

    return null;
}
