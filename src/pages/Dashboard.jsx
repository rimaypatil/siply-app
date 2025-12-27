import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { ProgressRing } from '../components/features/ProgressRing';
import { Button } from '../components/ui/Button';
import { Plus, Coffee, GlassWater } from 'lucide-react';

// I will not add extra deps if not needed. React-confetti handles partial? 
// Actually for simplicity I will skip 'react-confetti' dependency installation as it wasn't in list. 
// I will use a simple CSS animation or just a message msg.
// Or I can install it? I'll stick to CSS animation for "Goal Completed" to avoid new deps.

import { clsx } from 'clsx';

export default function Dashboard() {
    const { totalToday, preferences, addWater } = useUser();
    const [percent, setPercent] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        // Calculate percentage
        const p = Math.min(100, Math.round((totalToday / preferences.dailyGoal) * 100));
        setPercent(p);

        if (p >= 100) {
            setShowCelebration(true);
        }
    }, [totalToday, preferences.dailyGoal]);

    const handleAdd = async (amount) => {
        await addWater(amount);
    };

    const remaining = Math.max(0, preferences.dailyGoal - totalToday);

    return (
        <div className="flex flex-col items-center h-full p-6 relative">
            <div className="flex-1 flex flex-col justify-center items-center w-full max-w-sm space-y-10">

                <div className="text-center space-y-2">
                    <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">Today's Goal</p>
                    <h2 className="text-3xl font-bold text-slate-800">{totalToday} <span className="text-slate-400 text-xl font-normal">/ {preferences.dailyGoal} ml</span></h2>
                </div>

                <div className="relative">
                    <ProgressRing radius={130} stroke={16} progress={percent} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-brand-600">{percent}%</span>
                        {percent >= 100 && <span className="text-sm font-semibold text-brand-400 mt-2 animate-bounce">Goal Reached! 🎉</span>}
                    </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                    <Button
                        variant="secondary"
                        className="h-20 flex-col gap-2 rounded-2xl"
                        onClick={() => handleAdd(preferences.cupSize)}
                    >
                        <GlassWater className="w-6 h-6 text-brand-500" />
                        <span className="font-semibold">+{preferences.cupSize} ml</span>
                    </Button>

                    <Button
                        variant="secondary"
                        className="h-20 flex-col gap-2 rounded-2xl"
                        onClick={() => handleAdd(1000)}
                    >
                        <GlassWater className="w-6 h-6 text-brand-500" />
                        <span className="font-semibold">+1000 ml</span>
                    </Button>
                </div>

                <div className="pt-2">
                    <p className="text-center text-slate-400 text-sm">
                        {remaining > 0 ? `${remaining} ml more to reach your goal.` : "You are fully hydrated!"}
                    </p>
                </div>

            </div>
        </div>
    );
}
