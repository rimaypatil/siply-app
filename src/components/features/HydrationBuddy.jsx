import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const BENEFITS = [
    "💧 Keeps your body hydrated and energized",
    "🧠 Improves focus and brain performance",
    "❤️ Supports healthy heart function",
    "🌱 Boosts metabolism and digestion",
    "😌 Reduces fatigue and headaches",
    "✨ Improves skin glow and elasticity",
    "🦴 Lubricates joints and muscles",
    "🌡️ Regulates body temperature",
    "🧂 Flushes out toxins naturally",
    "🏆 Builds healthy daily habits"
];

const CORNERS = [
    { bottom: 110, left: -10, rotate: 10 },   // Bottom Left
    { bottom: 110, right: -10, rotate: -10 }, // Bottom Right
    { top: 20, left: -10, rotate: 170 },      // Top Left (upside down peek)
    { top: 20, right: -10, rotate: -170 },    // Top Right (upside down peek)
];

export default function HydrationBuddy() {
    const [isVisible, setIsVisible] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);
    const [position, setPosition] = useState(CORNERS[0]);

    useEffect(() => {
        const initialTimeout = setTimeout(() => {
            showBuddy();
        }, 5000);

        return () => clearTimeout(initialTimeout);
    }, []);

    const showBuddy = () => {
        // Pick new random position
        const randomPos = CORNERS[Math.floor(Math.random() * CORNERS.length)];
        setPosition(randomPos);

        setIsVisible(true);

        setTimeout(() => {
            setIsVisible(false);
            const nextInterval = Math.random() * (40000 - 20000) + 20000;
            setTimeout(() => {
                setMessageIndex(prev => (prev + 1) % BENEFITS.length);
                showBuddy();
            }, nextInterval);
        }, 6000);
    };

    const isTop = position.top !== undefined;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden max-w-md mx-auto left-0 right-0">
                    <motion.div
                        initial={{ y: isTop ? -200 : 200, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: isTop ? -200 : 200, opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className={`absolute flex ${isTop ? 'items-start' : 'items-end'}`}
                        style={{
                            bottom: position.bottom,
                            top: position.top,
                            left: position.left !== undefined ? 0 : undefined,
                            right: position.right !== undefined ? 0 : undefined,
                            paddingLeft: position.left !== undefined ? 20 : 0,
                            paddingRight: position.right !== undefined ? 20 : 0,
                        }}
                    >
                        {/* Container for Cat + Bubble */}
                        <div className={`
                            flex 
                            ${isTop ? 'items-start' : 'items-end'} 
                            ${position.right !== undefined ? 'flex-row-reverse' : 'flex-row'}
                        `}>

                            {/* Cat Image */}
                            <motion.img
                                src="/cute-cat-water.png"
                                alt="Hydration Buddy"
                                className="w-24 h-24 object-contain drop-shadow-lg"
                                style={{ rotate: position.rotate }}
                                animate={{
                                    y: isTop ? [0, 10, 0] : [0, -10, 0], // Bobbing direction
                                    rotate: [position.rotate, position.rotate + 5, position.rotate]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            {/* Speech Bubble */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0, y: isTop ? -20 : 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className={`
                                    bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-blue-100
                                    max-w-[180px] pointer-events-auto
                                    ${isTop ? 'mt-12' : 'mb-12'} 
                                    ${position.right !== undefined ? 'mr-2 rounded-tr-none' : 'ml-2 rounded-tl-none'}
                                    ${!isTop && (position.right !== undefined ? 'rounded-br-none rounded-tr-2xl' : 'rounded-bl-none rounded-tl-2xl') /* Reset corners based on position */}
                                `}
                            >
                                <p className="text-sm font-medium text-slate-700 leading-snug">
                                    {BENEFITS[messageIndex]}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
