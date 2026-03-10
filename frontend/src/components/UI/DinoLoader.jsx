import React from 'react';
import { motion } from 'framer-motion';

const DinoLoader = () => {
    return (
        <div className="relative w-full h-24 mt-2 mb-6 overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 flex flex-col justify-end">
            {/* Sky / Clouds */}
            <div className="absolute top-4 w-full h-8 overflow-hidden opacity-20">
                <motion.div 
                    animate={{ x: [-100, 400] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute left-10 text-slate-400"
                >
                    ☁️
                </motion.div>
                <motion.div 
                    animate={{ x: [400, -100] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute right-20 text-slate-400"
                >
                    ☁️
                </motion.div>
            </div>

            {/* Road Metadata Text */}
            <div className="absolute inset-x-0 top-3 text-center">
                <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.2em] animate-pulse">
                    Computing Safe Passage...
                </p>
            </div>

            {/* The Road */}
            <div className="absolute bottom-6 left-0 w-[200%] h-px text-slate-400 road-scrolling" />

            {/* Chasing Dino */}
            <div className="relative h-12 flex items-center px-10 mb-4">
                <div className="dino-running text-2xl filter grayscale dark:invert">
                    🦖
                </div>
                
                {/* Chasing Effect */}
                <div className="ml-2 flex gap-1 items-end mb-1">
                    <div className="w-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-1 h-5 bg-emerald-500/20 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-4 bg-slate-200 dark:bg-slate-800 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
            </div>

            {/* Loading Bar at the bottom */}
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
            </div>
        </div>
    );
};

export default DinoLoader;
