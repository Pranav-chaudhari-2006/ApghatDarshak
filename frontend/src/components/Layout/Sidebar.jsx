import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Navigation, MapPin, RefreshCw, Loader2, AlertTriangle,
    ShieldCheck, Shield, Route, Zap, TrendingDown, Scale,
    Clock, Ruler, Star, ChevronRight
} from 'lucide-react';
import LocationInput from '../UI/LocationInput';
import useRouteStore from '../../store/useRouteStore';
import { getRoute, modeToOrsPreference } from '../../services/routing';

const MODES = [
    {
        id: 'shortest',
        label: 'Shortest',
        icon: TrendingDown,
        color: '#3B82F6',
        bg: 'rgba(59,130,246,0.12)',
        border: 'rgba(59,130,246,0.3)',
        desc: 'Fastest arrival time',
    },
    {
        id: 'safest',
        label: 'Safest',
        icon: ShieldCheck,
        color: '#10B981',
        bg: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.3)',
        desc: 'Zero blackspot path',
    },
    {
        id: 'balanced',
        label: 'Balanced',
        icon: Scale,
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.3)',
        desc: 'Safety + distance',
    },
];

const gradeInfo = (km) => {
    const d = parseFloat(km) || 0;
    if (d === 0) return { grade: '-', color: '#94A3B8', label: 'N/A' };
    if (d < 5) return { grade: 'A+', color: '#10B981', label: 'Maximum Safety' };
    if (d < 15) return { grade: 'A', color: '#059669', label: 'High Safety' };
    if (d < 30) return { grade: 'B', color: '#3B82F6', label: 'Moderate' };
    return { grade: 'C', color: '#F59E0B', label: 'Caution Advised' };
};

const Sidebar = () => {
    const {
        source, destination, mode,
        routeResult, isComputing, error,
        setSource, setDestination, setMode,
        setRouteResult, setBlackspots, setIsComputing, setError, reset,
    } = useRouteStore();

    const handleCompute = async () => {
        if (!source || !destination) {
            setError('Please pinpoint your origin and destination.');
            return;
        }
        setIsComputing(true);
        setError(null);
        setRouteResult(null);

        try {
            const preference = modeToOrsPreference(mode);
            const orsResult = await getRoute(
                [source.lng, source.lat],
                [destination.lng, destination.lat],
                preference
            );

            let intel = { totalDistance: orsResult.distanceKm, blackspots: [] };
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/compute-route`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ source, destination, mode })
                });
                if (res.ok) intel = await res.json();
            } catch (e) { console.warn("Backend failover to ORS base."); }

            setRouteResult({
                ...orsResult,
                distanceKm: intel.totalDistance || orsResult.distanceKm,
            });
            setBlackspots(intel.blackspots || []);

        } catch (err) {
            setError('Navigation error. Try common Pune junctions.');
        } finally {
            setIsComputing(false);
        }
    };

    const activeMode = MODES.find(m => m.id === mode);
    const grade = gradeInfo(routeResult?.distanceKm);

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-6 left-6 w-[360px] z-1000 flex flex-col gap-4"
        >
            {/* ── Main Planner Card ── */}
            <div className="glass-card rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
                {/* Branding */}
                <div className="flex items-center gap-4 mb-8">
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
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                            Apaghat<span className="text-emerald-500">Darshak</span>
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

                {/* Vertical Step Connector */}
                <div className="relative mb-8 px-1">
                    <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-100 dark:bg-slate-800/50" />
                    <div className="space-y-4">
                        <LocationInput
                            placeholder="Starting Point"
                            icon={MapPin}
                            value={source?.displayName?.split(',')[0]}
                            onSelect={setSource}
                        />
                        <LocationInput
                            placeholder="Final Destination"
                            icon={ChevronRight}
                            value={destination?.displayName?.split(',')[0]}
                            onSelect={setDestination}
                        />
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-3 gap-2 mb-8">
                    {MODES.map(m => {
                        const Icon = m.icon;
                        const active = mode === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl transition-all border-2 ${active
                                    ? 'bg-white dark:bg-slate-800 shadow-xl border-emerald-500/10'
                                    : 'bg-transparent border-transparent opacity-40 grayscale hover:opacity-100'
                                    }`}
                                style={{ borderColor: active ? m.color : 'transparent' }}
                            >
                                <Icon size={20} style={{ color: active ? m.color : '#64748B' }} />
                                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${active ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>
                                    {m.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Action Button */}
                <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCompute}
                    disabled={isComputing || !source || !destination}
                    className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-emerald-600 text-white font-bold flex items-center justify-center gap-3 shadow-xl transition-all disabled:opacity-30 disabled:grayscale"
                >
                    {isComputing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-white" />}
                    {isComputing ? 'Computing Safest Path...' : 'Plan Secure Route'}
                </motion.button>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-3 text-xs text-rose-600 dark:text-rose-400 font-bold"
                    >
                        <AlertTriangle className="shrink-0" size={16} /> {error}
                    </motion.div>
                )}
            </div>

            {/* ── Statistics Overlay ── */}
            <AnimatePresence>
                {routeResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.9 }}
                        className="glass-card rounded-[32px] p-6 shadow-2xl border-b-4"
                        style={{ borderBottomColor: activeMode.color }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Travel Statistics</h3>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                                <ShieldCheck size={14} style={{ color: grade.color }} />
                                <span className="text-[11px] font-black" style={{ color: grade.color }}>{grade.label}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-2 text-slate-400">
                                    <Ruler size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Distance</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                    {routeResult.distanceKm}
                                    <span className="text-xs ml-1 font-bold text-slate-400">KM</span>
                                </p>
                            </div>
                            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-2 text-slate-400">
                                    <Clock size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Estimates</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                    {routeResult.durationMin}
                                    <span className="text-xs ml-1 font-bold text-slate-400">MIN</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Sidebar;
