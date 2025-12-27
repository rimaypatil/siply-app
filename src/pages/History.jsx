import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { getRecentIntake } from '../services/storage';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { useUser } from '../context/UserContext';
import { BarChart3 } from 'lucide-react';
import { clsx } from "clsx";

export default function History() {
    const { preferences } = useUser();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const logs = await getRecentIntake(7);
                // Process logs into daily totals
                const last7Days = Array.from({ length: 7 }).map((_, i) => {
                    const d = subDays(new Date(), 6 - i);
                    return {
                        date: d,
                        dateStr: format(d, 'yyyy-MM-dd'),
                        dayName: format(d, 'EEE'),
                        amount: 0
                    };
                });

                logs.forEach(log => {
                    const day = last7Days.find(d => d.dateStr === log.date);
                    if (day) {
                        day.amount += log.amount;
                    }
                });

                setData(last7Days);
            } catch (e) {
                console.error("Failed to load history", e);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    if (loading) return <div className="p-6">Loading history...</div>;

    const maxAmount = Math.max(...data.map(d => d.amount), preferences.dailyGoal);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-100 rounded-xl text-brand-600">
                    <BarChart3 size={24} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Weekly Progress</h1>
            </div>

            <Card className="flex flex-col gap-6">
                <div className="h-48 flex items-end justify-between gap-2">
                    {data.map((day) => {
                        const heightPercent = Math.min(100, (day.amount / maxAmount) * 100);
                        const isGoalMet = day.amount >= preferences.dailyGoal;
                        const isToday = isSameDay(day.date, new Date());

                        return (
                            <div key={day.dateStr} className="flex flex-col items-center gap-2 flex-1 group">
                                <div className="w-full relative h-full flex items-end justify-center">
                                    <div
                                        style={{ height: `${heightPercent}%` }}
                                        className={clsx(
                                            "w-full rounded-t-md transition-all duration-500",
                                            isGoalMet ? "bg-brand-500" : "bg-brand-200",
                                            isToday && "ring-2 ring-brand-300 ring-offset-1"
                                        )}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                                            {day.amount}ml
                                        </div>
                                    </div>
                                </div>
                                <span className={clsx("text-xs font-medium", isToday ? "text-brand-600" : "text-slate-400")}>
                                    {day.dayName}
                                </span>
                            </div>
                        )
                    })}
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between text-sm text-slate-500">
                    <span>Goal: {preferences.dailyGoal}ml</span>
                    <span>Avg: {Math.round(data.reduce((a, b) => a + b.amount, 0) / 7)}ml</span>
                </div>
            </Card>

            <div className="space-y-4">
                <h2 className="font-semibold text-slate-900">Recent Logs</h2>
                {/* This could be a list of individual drink logs, but leaving it as weekly summary for now per req "Simple bar or line chart" */}
                <div className="text-slate-500 text-sm">
                    Your detailed logs are stored locally.
                </div>
            </div>
        </div>
    );
}
