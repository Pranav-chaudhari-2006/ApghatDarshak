import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Moon, Sun, AlertCircle, Cpu, Radio } from 'lucide-react';

const Navbar = () => {
    const [dark, setDark] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        setDark((d) => !d);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 h-20 px-8 flex items-center justify-between z-2000 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-2xl' : 'bg-transparent'
                }`}
        >
            {/* Project Brand */}
            <div className="flex items-center gap-4">
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="relative group cursor-pointer"
                >
                    <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-11 h-11 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/10 shadow-2xl">
                        <Shield className="text-emerald-400" size={22} strokeWidth={2.5} />
                    </div>
                </motion.div>

                <div className="flex flex-col">
                    <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        Apghat<span className="text-emerald-500">Darshak</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Live Monitor</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">· Pune Division</span>
                    </div>
                </div>
            </div>

            {/* Dynamic Status Dashboard */}
            <div className="hidden lg:flex items-center gap-10 px-8 py-2 rounded-[24px] bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                        <Cpu size={14} className="text-blue-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Engine</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">AI v2.4 (Active)</p>
                    </div>
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                        <Radio size={14} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Supabase</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">Syncing Data</p>
                    </div>
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                        <AlertCircle size={14} className="text-rose-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Coverage</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">52 Zones</p>
                    </div>
                </div>
            </div>

            {/* Action Group */}
            <div className="flex items-center gap-3">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTheme}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl text-slate-600 dark:text-slate-400 transition-colors"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={dark ? 'dark' : 'light'}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            {dark ? <Sun size={18} /> : <Moon size={18} />}
                        </motion.div>
                    </AnimatePresence>
                </motion.button>
            </div>
        </motion.nav>
    );
};

export default Navbar;
