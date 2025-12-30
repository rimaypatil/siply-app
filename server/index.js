import express from 'express';
import webpush from 'web-push';
import cron from 'node-cron';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Database Setup ---

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    console.warn("MONGODB_URI is not set. Persistence will fail.");
} else {
    mongoose.connect(mongoUri)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
}

const userSchema = new mongoose.Schema({
    endpoint: { type: String, unique: true, required: true },
    subscription: Object,
    preferences: {
        interval: Number,
        wakeTime: String,
        sleepTime: String,
        dailyGoal: Number
    },
    lastNotified: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// --- Web Push Setup ---

// VAPID Keys (Generated)
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (!publicVapidKey || !privateVapidKey) {
    console.error("VAPID Keys are missing! Check .env file.");
}

webpush.setVapidDetails(
    'mailto:test@test.com',
    publicVapidKey,
    privateVapidKey
);

// --- API Endpoints ---

app.get('/api/vapid-key', (req, res) => {
    res.json({ publicKey: publicVapidKey });
});

// Subscribe Route
app.post('/api/subscribe', async (req, res) => {
    const { subscription, preferences } = req.body;

    try {
        await User.findOneAndUpdate(
            { endpoint: subscription.endpoint },
            {
                subscription,
                preferences: preferences || { interval: 60, startTime: '08:00', endTime: '22:00', dailyGoal: 2000 },
                // Don't reset lastNotified if exists, otherwise keep default
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.status(201).json({ message: 'Subscribed successfully!' });
    } catch (err) {
        console.error("Error saving subscription:", err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Unsubscribe Route
app.post('/api/unsubscribe', async (req, res) => {
    const { endpoint } = req.body;
    try {
        await User.deleteOne({ endpoint });
        res.status(200).json({ message: 'Unsubscribed' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// --- Scheduler ---

// Run every minute
cron.schedule('* * * * *', async () => {
    console.log(`Running Check at ${new Date().toISOString()}`);
    const now = Date.now();
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    try {
        // Find users who might need a notification
        // We fetch all for now, in a massive app we'd query by `lastNotified` but intervals vary per user
        const users = await User.find({});

        for (const user of users) {
            // In case preferences are missing
            if (!user.preferences) continue;

            const { interval, wakeTime, sleepTime } = user.preferences;

            // Parse wake/sleep times (assuming HH:mm format)
            const [wakeH, wakeM] = (wakeTime || '08:00').split(':').map(Number);
            const [sleepH, sleepM] = (sleepTime || '22:00').split(':').map(Number);
            const wakeMinutes = wakeH * 60 + wakeM;
            const sleepMinutes = sleepH * 60 + sleepM;

            // Check if within active hours
            if (currentTimeMinutes < wakeMinutes || currentTimeMinutes > sleepMinutes) {
                continue; // Sleeping
            }

            const lastNotified = user.lastNotified || 0;
            const elapsedMinutes = (now - lastNotified) / (1000 * 60);

            if (elapsedMinutes >= interval) {
                const payload = JSON.stringify({
                    title: 'Time to drink water! 💧',
                    body: `It's been ${interval} minutes. Stay hydrated!`,
                    icon: '/cute-cat-water.png',
                });

                webpush.sendNotification(user.subscription, payload)
                    .then(async () => {
                        console.log(`Notification sent to user ${user._id}`);
                        user.lastNotified = now;
                        await user.save();
                    })
                    .catch(async (err) => {
                        console.error(`Error sending to ${user._id}:`, err.statusCode);
                        if (err.statusCode === 410 || err.statusCode === 404) {
                            // Subscription expired or invalid
                            await User.deleteOne({ _id: user._id });
                        }
                    });
            }
        }
    } catch (err) {
        console.error("Scheduler error:", err);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
