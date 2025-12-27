import React, { createContext, useContext, useState, useEffect } from 'react';
import * as storage from '../services/storage';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    // Preferences
    const [preferences, setPreferences] = useState(storage.getPreferences());

    // Hydration Data
    const [todayIntake, setTodayIntake] = useState([]);
    const [totalToday, setTotalToday] = useState(0);

    // Loading State
    const [loading, setLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Load preferences (sync but good to be explicit if we move to async)
                const prefs = storage.getPreferences();
                setPreferences(prefs);

                // Load today's logs
                const logs = await storage.getTodayIntake();
                setTodayIntake(logs);
                calculateTotal(logs);
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const calculateTotal = (logs) => {
        const total = logs.reduce((sum, entry) => sum + entry.amount, 0);
        setTotalToday(total);
    };

    const updatePreferences = (newPrefs) => {
        const updated = storage.savePreferences(newPrefs);
        setPreferences(updated);
    };

    const addWater = async (amount) => {
        try {
            const newEntry = await storage.addIntake(amount);
            const updatedLogs = [...todayIntake, newEntry];
            setTodayIntake(updatedLogs);
            calculateTotal(updatedLogs);
            return newEntry;
        } catch (error) {
            console.error("Failed to add water", error);
        }
    };

    const resetToday = async () => {
        try {
            await storage.clearTodayIntake();
            setTodayIntake([]);
            setTotalToday(0);
        } catch (error) {
            console.error("Failed to reset", error);
        }
    };

    // Check for day change on mount/focus ideally, but for now simple check
    // We can add a periodic check or check on visibility change later.

    const value = {
        preferences,
        updatePreferences,
        todayIntake,
        totalToday,
        addWater,
        resetToday,
        loading
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
