import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronUp, ChevronDown, Activity, ShieldAlert,
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

const BottomDrawer = () => {
    const [open, setOpen] = useState(false);
    const { routeResult, blackspots, mode } = useRouteStore();

    return (
        <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[1000]"
        >
            <div className="glass-card rounded-t-[40px] shadow-[0_-20px_80px_rgba(0,0,0,0.15)] border-b-0 overflow-hidden">
                {/* Visual Handle */}
                <div
                    className="h-14 flex items-center justify-between px-10 cursor-pointer group"
                    onClick={() => setOpen(!open)}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <Activity size={16} />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Analytics Intelligence</h4>
                    </div>

                    <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 transition-colors group-hover:bg-emerald-400" />

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">View Data Console</span>
                        <motion.div animate={{ rotate: open ? 180 : 0 }}>
                            <ChevronUp size={16} className="text-slate-400" />
                        </motion.div>
                    </div>
                </div>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="bg-white/50 dark:bg-slate-950/20"
                        >
                            <div className="p-10 pt-0 grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* Zone Analysis */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BarChart3 size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Distribution</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/5">
                                            <p className="text-[9px] font-black text-rose-500 uppercase mb-2">High Danger</p>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                                {blackspots.filter(b => b.risk > 30).length}
                                                <span className="text-xs ml-1 opacity-20">Nodes</span>
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/5">
                                            <p className="text-[9px] font-black text-amber-500 uppercase mb-2">Warning</p>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                                {blackspots.filter(b => b.risk <= 30).length}
                                                <span className="text-xs ml-1 opacity-20">Nodes</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Comparison Console */}
                                <div className="space-y-6 lg:border-x lg:border-slate-100 lg:dark:border-white/5 lg:px-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <PieChart size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Legend</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {LEGEND.map(l => (
                                            <div key={l.label} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5 group">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black" style={{ color: l.color }}>{l.symbol}</span>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-800 dark:text-white leading-none">{l.label}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{l.desc}</p>
                                                    </div>
                                                </div>
                                                <Info size={12} className="text-slate-200 group-hover:text-slate-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* System Guidance */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Zap size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safety Protocol</span>
                                    </div>
                                    <div className="p-6 rounded-[32px] bg-slate-950 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 blur-[80px] opacity-20" />
                                        <ShieldAlert className="text-emerald-400 mb-4" size={24} />
                                        <p className="text-sm font-black leading-tight mb-2">Algorithm Recommendation</p>
                                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                                            Currently monitoring 52 active zones in Pune. Our Safest route algorithm reduces accident exposure likelihood by up to 84%.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default BottomDrawer;
