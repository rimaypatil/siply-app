import { openDB } from 'idb';

const DB_NAME = 'water-app-db';
const DB_VERSION = 1;
const STORE_NAME = 'intake';

// --- LocalStorage (Preferences) ---

const PREFS_KEY = 'water-app-prefs';

const DEFAULT_PREFS = {
    dailyGoal: 2000,     // ml
    wakeTime: '07:00',
    sleepTime: '23:00',
    interval: 60,        // minutes
    cupSize: 200,        // ml
    notificationsEnabled: false,
    isOnboarded: false,
};

export const getPreferences = () => {
    const stored = localStorage.getItem(PREFS_KEY);
    return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
};

export const savePreferences = (prefs) => {
    const current = getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    return updated;
};

// --- IndexedDB (Logs) ---

const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('date', 'date');
            store.createIndex('timestamp', 'timestamp');
        }
    },
});

export const addIntake = async (amount) => {
    const db = await dbPromise;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const entry = {
        id: now.getTime(),
        amount,
        date: dateStr,
        timestamp: now.getTime(),
    };

    await db.add(STORE_NAME, entry);
    return entry;
};

export const getTodayIntake = async () => {
    const db = await dbPromise;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const range = IDBKeyRange.only(dateStr);

    const entries = await db.getAllFromIndex(STORE_NAME, 'date', range);
    return entries; // Array of objects
};

export const getIntakeByDate = async (dateStr) => {
    // dateStr format YYYY-MM-DD
    const db = await dbPromise;
    const range = IDBKeyRange.only(dateStr);
    return await db.getAllFromIndex(STORE_NAME, 'date', range);
}

export const clearTodayIntake = async () => {
    const db = await dbPromise;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const range = IDBKeyRange.only(dateStr);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const index = tx.store.index('date');

    // We can't delete by index directly in standard IDB without cursor or getting keys first
    let cursor = await index.openCursor(range);
    while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
    }
    await tx.done;
}

export const getRecentIntake = async (days = 7) => {
    const db = await dbPromise;
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = now.toISOString().split('T')[0];

    const range = IDBKeyRange.bound(startStr, endStr);
    const entries = await db.getAllFromIndex(STORE_NAME, 'date', range);
    return entries;
};

export const clearAllData = async () => {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.store.clear();
    await tx.done;
    localStorage.removeItem(PREFS_KEY); // Or keep basic prefs? Request says "Clear all app data"
    // If we remove prefs, user has to setup again.
};

export const getAllLogs = async () => {
    const db = await dbPromise;
    return await db.getAll(STORE_NAME);
}
