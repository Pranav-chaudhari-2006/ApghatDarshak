import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, ShieldAlert, Zap, Info,
    BarChart3, PieChart, ChevronRight, Menu, MapPin, MapPinOff,
    History, Trash2, Clock, Navigation, Shield
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
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'history'
    const { 
        blackspots, showBlackspots, setShowBlackspots, 
        routeHistory, clearHistory, setSource, setDestination 
    } = useRouteStore();

    const loadHistoryRoute = (item) => {
        setSource(item.source);
        setDestination(item.destination);
    };

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
                <div className="w-full h-full glass-card rounded-[32px] p-6 shadow-2xl flex flex-col overflow-hidden relative border border-slate-200/50 dark:border-white/10">

                    {/* Header & Tabs */}
                    <div className="flex flex-col gap-4 pb-4 border-b border-slate-100 dark:border-white/5 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-emerald-400 shadow-inner">
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 leading-none mb-1">System</h4>
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

                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-950/50 rounded-2xl">
                            <button 
                                onClick={() => setActiveTab('analytics')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'analytics' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                            >
                                <BarChart3 size={14} />
                                Analytics
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                            >
                                <History size={14} />
                                History
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-8">
                        {activeTab === 'analytics' ? (
                            <>
                                {/* Risk Distribution */}
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

                                {/* Area Safety Rating (Zone Table Integration) */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Area Safety Rating</span>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'Shivajinagar', risk: 'Low', color: 'emerald' },
                                            { name: 'Kothrud', risk: 'Low', color: 'emerald' },
                                            { name: 'Hadapsar', risk: 'High', color: 'rose' },
                                            { name: 'Pimpri', risk: 'Medium', color: 'amber' }
                                        ].map(zone => (
                                            <div key={zone.name} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5">
                                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{zone.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full bg-${zone.color}-500 shadow-sm shadow-${zone.color}-500/50`} />
                                                    <span className={`text-[9px] font-black uppercase tracking-tighter text-${zone.color}-500`}>{zone.risk} Risk</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* System Legend */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <PieChart size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Legend</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {LEGEND.map(l => (
                                            <div key={l.label} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5 group">
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

                                {/* Visibility Toggle */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Map Visibility</span>
                                    </div>
                                    <button
                                        onClick={() => setShowBlackspots(!showBlackspots)}
                                        className={`w-full flex items-center justify-between p-4 rounded-[24px] border transition-all ${
                                            showBlackspots 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                                            : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-500'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {showBlackspots ? <MapPin size={18} /> : <MapPinOff size={18} />}
                                            <div className="text-left cursor-pointer">
                                                <p className="text-xs font-black leading-none">{showBlackspots ? 'Blackspots Visible' : 'Blackspots Hidden'}</p>
                                                <p className="text-[9px] font-bold mt-1 opacity-70 uppercase tracking-wider">
                                                    {showBlackspots ? 'Showing on map' : 'Markers disabled'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${showBlackspots ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                            <motion.div 
                                                className="w-4 h-4 bg-white rounded-full shadow-sm"
                                                animate={{ x: showBlackspots ? 16 : 0 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        </div>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <History size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Past Computations</span>
                                    </div>
                                    {routeHistory.length > 0 && (
                                        <button 
                                            onClick={clearHistory}
                                            className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-tighter"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                {routeHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
                                            <Clock size={32} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No routes saved yet.</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Compute a route and save it to see it here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {routeHistory.map((item) => (
                                            <motion.button
                                                key={item.id}
                                                whileHover={{ y: -2 }}
                                                onClick={() => loadHistoryRoute(item)}
                                                className="w-full text-left p-4 rounded-[24px] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 hover:border-blue-500/30 transition-all group"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter ${
                                                        item.mode === 'safest' ? 'bg-emerald-500 text-white' : 
                                                        item.mode === 'shortest' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                                                    }`}>
                                                        {item.mode}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {new Date(item.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-start gap-3">
                                                    <div className="flex flex-col items-center gap-1 mt-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        <div className="w-0.5 h-3 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-[11px] font-black text-slate-800 dark:text-white truncate leading-none mb-2">{item.source?.displayName}</p>
                                                        <p className="text-[11px] font-black text-slate-800 dark:text-white truncate leading-none">{item.destination?.displayName}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <div className="flex items-center gap-1">
                                                        <Navigation size={10} className="text-slate-400" />
                                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">{item.distanceKm}km</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Zap size={10} className="text-amber-500" />
                                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">Risk: {item.riskScore}</span>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Safety Protocol (Fixed bottom) */}
                    <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                         <div className="flex items-center gap-2">
                            <Zap size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safety Protocol</span>
                        </div>
                        <div className="p-5 rounded-[24px] bg-slate-950 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 blur-[80px] opacity-20" />
                            <ShieldAlert className="text-emerald-400 mb-4" size={24} />
                            <p className="text-sm font-black leading-tight mb-2">Algorithm Ready</p>
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                                Our A* Safest route engine is now fully synced with Supabase. Monitoring 235 active nodes for live risk mitigation.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RightSidebar;
