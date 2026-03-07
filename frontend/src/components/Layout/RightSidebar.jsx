import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ChevronLeft, Activity, ShieldAlert,
    Route, Zap, Search, Info, Map as MapIcon,
    BarChart3, PieChart
} from 'lucide-react';
import useRouteStore from '../../store/useRouteStore';

const LEGEND = [
    { color: '#10B981', symbol: '──', label: 'Primary Safety', desc: 'Secure corridor' },
    { color: '#3B82F6', symbol: '┄┄', label: 'Express Path', desc: 'Efficiency focus' },
    { color: '#F59E0B', symbol: '──', label: 'Hybrid Route', desc: 'Balanced risk' },
    { color: '#F43F5E', symbol: '●', label: 'Fatality Zone', desc: 'Strict avoidance' },
];

const RightSidebar = () => {
    const [open, setOpen] = useState(true);
    const { blackspots } = useRouteStore();

    return (
        <>
            {/* Toggle Button when closed */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={() => setOpen(true)}
                        className="fixed top-6 right-6 z-1000 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:scale-105 transition-all"
                    >
                        <Activity size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Sidebar Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-6 right-6 bottom-6 w-[360px] z-1000 flex flex-col"
                    >
                        <div className="glass-card rounded-[32px] shadow-2xl h-full flex flex-col overflow-hidden relative">

                            {/* Header Section */}
                            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                        <Activity size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">Analytics</h4>
                                        <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">Intelligence Console</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                                {/* Zone Analysis */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Distribution</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500 blur-2xl opacity-10" />
                                            <p className="text-[9px] font-black text-rose-500 uppercase mb-2">High Danger</p>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                                {blackspots.filter(b => b.risk > 30).length}
                                                <span className="text-[10px] ml-1 opacity-40 font-bold uppercase">Nodes</span>
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500 blur-2xl opacity-10" />
                                            <p className="text-[9px] font-black text-amber-500 uppercase mb-2">Warning</p>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                                {blackspots.filter(b => b.risk <= 30).length}
                                                <span className="text-[10px] ml-1 opacity-40 font-bold uppercase">Nodes</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

                                {/* Comparison Console */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <PieChart size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Legend</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {LEGEND.map(l => (
                                            <div key={l.label} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all border border-slate-100 dark:border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-black min-w-[24px] text-center" style={{ color: l.color }}>{l.symbol}</span>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 dark:text-white leading-none">{l.label}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{l.desc}</p>
                                                    </div>
                                                </div>
                                                <Info size={14} className="text-slate-300 dark:text-slate-600" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

                                {/* System Guidance */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Zap size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safety Protocol</span>
                                    </div>
                                    <div className="p-6 rounded-[24px] bg-slate-950 text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500 blur-[60px] opacity-30 rounded-full" />
                                        <ShieldAlert className="text-emerald-400 mb-4" size={24} />
                                        <p className="text-sm font-black leading-tight mb-2">Algorithm Recommendation</p>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                            Currently monitoring zones in Pune. Our Safest route algorithm reduces accident exposure likelihood by up to 84%.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default RightSidebar;
