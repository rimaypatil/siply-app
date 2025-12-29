/* eslint-disable no-restricted-globals */
import { differenceInMinutes, parse, isAfter, isBefore } from 'date-fns';

// A robust worker to keep the timer running off the main thread

let timerId = null;
let state = {
    preferences: null,
    todayIntake: [],
    totalToday: 0
};
let lastNotifiedTimestamp = 0;

function tick() {
    // Re-schedule first to ensure loop continues even if logic errors
    timerId = setTimeout(tick, 10000); // Check every 10 seconds for precision

    const { preferences, totalToday, todayIntake } = state;
    if (!preferences || !preferences.notificationsEnabled) return;

    // Check Goal
    if (totalToday >= preferences.dailyGoal) return;

    const now = new Date();

    // Parse Wake/Sleep times
    // Note: preferences.wakeTime is "HH:mm" string
    const wakeDate = parse(preferences.wakeTime, 'HH:mm', now);
    const sleepDate = parse(preferences.sleepTime, 'HH:mm', now);

    // Handle overnight schedules (e.g. 23:00 to 07:00)
    const isOvernight = isBefore(sleepDate, wakeDate);
    const isAwake = isOvernight
        ? (isAfter(now, wakeDate) || isBefore(now, sleepDate))
        : (isAfter(now, wakeDate) && isBefore(now, sleepDate));

    if (!isAwake) return;

    // Find last drink time
    const lastLog = todayIntake.length > 0
        ? todayIntake[todayIntake.length - 1]
        : null;

    const lastTime = lastLog ? new Date(lastLog.timestamp) : wakeDate;
    const minutesSinceDrink = differenceInMinutes(now, lastTime);

    if (minutesSinceDrink >= preferences.interval) {
        // Check local lastNotified to prevent double notification
        const minutesSinceLastNotification = lastNotifiedTimestamp > 0
            ? differenceInMinutes(now, new Date(lastNotifiedTimestamp))
            : 9999;

        // Notify if enough time passed since last drink AND since last notification
        if (minutesSinceLastNotification >= preferences.interval) {

            const title = "Time to drink water MiMi😚💧";
            const options = {
                body: `stay hydrated babes! You need ${preferences.dailyGoal - totalToday}ml more today`,
                icon: '/cute-cat-water.png',
                tag: 'hydration-reminder',
                renotify: true,
                requireInteraction: true,
            };

            // Trigger notification directly from worker
            try {
                if (Notification.permission === 'granted') {
                    new Notification(title, options);
                    lastNotifiedTimestamp = now.getTime();
                }
            } catch (err) {
                console.error("Worker notification failed:", err);
            }
        }
    }
}

self.onmessage = (e) => {
    if (e.data === 'start') {
        if (!timerId) {
            tick();
        }
    } else if (e.data === 'stop') {
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
    } else if (e.data.type === 'UPDATE') {
        state = e.data.payload;
    }
};
