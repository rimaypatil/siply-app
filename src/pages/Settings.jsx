import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import * as storage from '../services/storage';
import { Bell, Trash2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { preferences, updatePreferences, resetToday } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        dailyGoal: preferences.dailyGoal,
        wakeTime: preferences.wakeTime,
        sleepTime: preferences.sleepTime,
        interval: preferences.interval,
        cupSize: preferences.cupSize,
        notificationsEnabled: preferences.notificationsEnabled || false
    });

    const [msg, setMsg] = useState('');

    const handleChange = async (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'notificationsEnabled' && checked) {
            if (!("Notification" in window)) {
                alert("This browser does not support desktop notification");
                return;
            }
            if (Notification.permission !== "granted") {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    alert("Permission denied. Please enable notifications in your browser settings.");
                    return;
                }
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };




    const handleSave = () => {
        updatePreferences({
            ...formData,
            dailyGoal: Number(formData.dailyGoal),
            interval: Number(formData.interval),
            cupSize: Number(formData.cupSize)
        });
        setMsg('Settings saved successfully!');
        setTimeout(() => setMsg(''), 3000);
    };

    const handleClearData = async () => {
        if (window.confirm("Are you sure? This will delete all history and reset the app.")) {
            await storage.clearAllData();
            navigate('/');
            window.location.reload();
        }
    };

    const handleResetToday = async () => {
        if (window.confirm("Reset today's water intake?")) {
            await resetToday();
            setMsg("Today's log cleared.");
            setTimeout(() => setMsg(''), 3000);
        }
    }

    return (
        <div className="p-6 space-y-6 pb-24">
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

            <Card className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-800">Goals & Preferences</h2>
                <Input label="Daily Goal (ml)" name="dailyGoal" type="number" value={formData.dailyGoal} onChange={handleChange} />
                <Input label="Cup Size (ml)" name="cupSize" type="number" value={formData.cupSize} onChange={handleChange} />

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Wake Up" name="wakeTime" type="time" value={formData.wakeTime} onChange={handleChange} />
                    <Input label="Sleep Time" name="sleepTime" type="time" value={formData.sleepTime} onChange={handleChange} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 ml-1">Reminder Interval (min)</label>
                    <select name="interval" value={formData.interval} onChange={handleChange} className="w-full flex h-12 rounded-xl border border-slate-200 bg-white px-4">
                        <option value={1}>1 minute</option>
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                        <option value={60}>60 mins</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <input
                        type="checkbox"
                        id="notif"
                        name="notificationsEnabled"
                        checked={formData.notificationsEnabled}
                        onChange={handleChange}
                        className="w-5 h-5 accent-brand-500"
                    />
                    <label htmlFor="notif" className="text-slate-700 font-medium">Enable Notifications</label>
                </div>

                <Button onClick={handleSave} className="w-full mt-2">Save Changes</Button>
                {msg && <p className="text-center text-green-600 text-sm animate-pulse">{msg}</p>}
            </Card>

            <div className="space-y-4 pt-4">
                <h2 className="text-lg font-semibold text-slate-800 px-1">Data Management</h2>

                <Button variant="secondary" onClick={handleResetToday} className="w-full justify-start text-red-600 border-red-100 bg-red-50 hover:bg-red-100 focus:ring-red-200">
                    <Trash2 className="mr-2 w-5 h-5" /> Reset Today's Log
                </Button>

                <Button variant="ghost" onClick={handleClearData} className="w-full justify-start text-slate-500 hover:text-slate-700">
                    <LogOut className="mr-2 w-5 h-5" /> Clear All App Data
                </Button>
            </div>
        </div>
    );
}
