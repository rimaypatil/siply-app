import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { ChevronLeft, Sun, Moon, Coffee, Droplets, Clock } from 'lucide-react';
import { clsx } from 'clsx';

function CustomInput({ label, helper, icon: Icon, ...props }) {
    return (
        <div className="space-y-1.5 group">
            <label className="text-sm font-semibold text-slate-600 ml-1 flex items-center gap-2">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400 group-focus-within:text-brand-500 transition-colors">
                    {Icon && <Icon size={18} />}
                </div>
                <input
                    {...props}
                    className="w-full h-12 rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 focus:bg-white transition-all shadow-sm group-hover:shadow-md"
                />
            </div>
            {helper && <p className="text-xs text-slate-400 ml-1 group-focus-within:text-brand-400 transition-colors">{helper}</p>}
        </div>
    );
}

export default function Setup() {
    const navigate = useNavigate();
    const { preferences, updatePreferences } = useUser();
    const [formData, setFormData] = useState({
        dailyGoal: preferences.dailyGoal,
        cupSize: preferences.cupSize,
        wakeTime: preferences.wakeTime,
        sleepTime: preferences.sleepTime,
        interval: preferences.interval
    });
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updatePreferences({
            ...formData,
            dailyGoal: Number(formData.dailyGoal),
            cupSize: Number(formData.cupSize),
            interval: Number(formData.interval),
            isOnboarded: true
        });
        navigate('/dashboard');
    };

    return (
        <div
            className={clsx(
                "h-full flex flex-col relative overflow-hidden transition-opacity duration-700 bg-cover bg-center bg-no-repeat",
                animate ? "opacity-100" : "opacity-0"
            )}
            style={{ backgroundImage: "url('/welcome-bg.png')" }}
        >
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>

            <div className="p-6 flex-1 flex flex-col z-10 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-2 mb-8 animate-in slide-in-from-top-5 duration-500">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full text-slate-400 hover:text-brand-500 hover:bg-white hover:shadow-sm transition-all"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        Personalize Goal <span className="text-xl">🐱</span>
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">

                    <div className="animate-in slide-in-from-bottom-5 duration-500 delay-100">
                        <CustomInput
                            label={<>Daily Goal (ml) <span className="text-brand-400">💧</span></>}
                            name="dailyGoal"
                            type="number"
                            placeholder="2000"
                            value={formData.dailyGoal}
                            onChange={handleChange}
                            required
                            icon={Droplets}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-5 duration-500 delay-200">
                        <CustomInput
                            label={<>PiPi Time (Morning) <span className="text-amber-400 text-lg">🌞</span> <span className="text-xs">🐾</span></>}
                            name="wakeTime"
                            type="time"
                            value={formData.wakeTime}
                            onChange={handleChange}
                            required
                            helper="When your hydration day starts"
                            icon={Sun}
                        />
                        <CustomInput
                            label={<>NiNi Time (Night) <span className="text-indigo-400 text-lg">🌙</span> <span className="text-xs">😴</span></>}
                            name="sleepTime"
                            type="time"
                            value={formData.sleepTime}
                            onChange={handleChange}
                            required
                            helper="When reminders should stop"
                            icon={Moon}
                        />
                    </div>

                    <div className="animate-in slide-in-from-bottom-5 duration-500 delay-300">
                        <CustomInput
                            label={<>Cup Size (ml) <span className="text-slate-400">🥤</span></>}
                            name="cupSize"
                            type="number"
                            placeholder="200"
                            value={formData.cupSize}
                            onChange={handleChange}
                            required
                            icon={Coffee}
                        />
                    </div>

                    <div className="space-y-2 animate-in slide-in-from-bottom-5 duration-500 delay-400 group">
                        <label className="text-sm font-semibold text-slate-600 ml-1 flex items-center gap-2">
                            Remind Me Every <span className="text-rose-400">⏰</span> <span className="text-xs">🐱</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400">
                                <Clock size={18} />
                            </div>
                            <select
                                name="interval"
                                value={formData.interval}
                                onChange={handleChange}
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all shadow-sm group-hover:shadow-md cursor-pointer appearance-none"
                            >
                                <option value={1}>1 minute (Testing)</option>
                                <option value={30}>30 minutes</option>
                                <option value={60}>1 hour</option>
                                <option value={90}>1.5 hours</option>
                                <option value={120}>2 hours</option>
                            </select>
                            {/* Custom arrow if needed, but standard select is okay for now */}
                        </div>
                    </div>

                    <div className="mt-8 pb-6 animate-in slide-in-from-bottom-5 duration-500 delay-500">
                        <Button
                            type="submit"
                            className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-brand-500 to-cyan-500 text-white font-bold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all border-none"
                        >
                            Save & Start 💙🐾
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
