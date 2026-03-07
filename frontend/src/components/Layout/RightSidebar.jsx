import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, ShieldAlert, Zap, Info,
    BarChart3, PieChart, ChevronRight, Menu
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
        <div className="absolute top-[96px] right-6 bottom-6 z-1000 flex items-start justify-end pointer-events-none overflow-hidden" style={{ width: open ? 'auto' : '100px' }}>

            {/* Toggle Button for when sidebar is hidden */}
            {!open && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOpen(true)}
                    className="absolute right-0 top-0 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl flex items-center justify-center text-slate-800 dark:text-white pointer-events-auto z-10"
                >
                    <Activity size={20} />
                </motion.button>
            )}

            <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: open ? 0 : 400, opacity: open ? 1 : 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="pointer-events-auto h-full w-[340px]"
            >
                {/* Sidebar Container */}
                <div className="w-full h-full glass-card rounded-[32px] p-6 shadow-2xl flex flex-col gap-6 overflow-y-auto no-scrollbar relative border border-slate-200/50 dark:border-white/10 dark:bg-slate-900/90 bg-white/90">

                    {/* Header & Close Button */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-emerald-400 shadow-inner">
                                <Activity size={18} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 leading-none mb-1">Analytics</h4>
                                <h2 className="text-sm font-black text-slate-900 dark:text-white leading-none">Console Data</h2>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Zone Analysis */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Distribution</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950/50 shadow-inner border border-slate-100 dark:border-white/5">
                                <p className="text-[9px] font-black text-rose-500 uppercase mb-2">High Danger</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                    {blackspots.filter(b => b.risk > 30).length}
                                    <span className="text-xs ml-1 opacity-40 font-bold tracking-wider">NODES</span>
                                </p>
                            </div>
                            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950/50 shadow-inner border border-slate-100 dark:border-white/5">
                                <p className="text-[9px] font-black text-amber-500 uppercase mb-2">Warning</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                    {blackspots.filter(b => b.risk <= 30).length}
                                    <span className="text-xs ml-1 opacity-40 font-bold tracking-wider">NODES</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Console */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <PieChart size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Legend</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {LEGEND.map(l => (
                                <div key={l.label} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5 group bg-white/50 dark:bg-transparent">
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
                    <div className="space-y-4 mt-auto">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safety Protocol</span>
                        </div>
                        <div className="p-5 rounded-[24px] bg-slate-950 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 blur-[80px] opacity-20" />
                            <ShieldAlert className="text-emerald-400 mb-4" size={24} />
                            <p className="text-sm font-black leading-tight mb-2">Algorithm Recommendation</p>
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                                Currently monitoring continuous active zones in Pune. Our Safest route algorithm reduces accident exposure likelihood by up to 84%.
                            </p>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default RightSidebar;
