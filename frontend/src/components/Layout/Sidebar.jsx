import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Navigation, MapPin, Loader2, AlertTriangle,
    ShieldCheck, Shield, TrendingDown, Scale,
    Clock, Ruler, ChevronRight, Car, Bike, Footprints, Bookmark,
    BarChart2, Zap, CheckCircle2
} from 'lucide-react';
import LocationInput from '../UI/LocationInput';
import DinoLoader from '../UI/DinoLoader';
import useRouteStore from '../../store/useRouteStore';
import { computeAstarRoutes } from '../../services/routing';

const Tooltip = ({ text, children, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className={`relative ${className}`} onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: -5, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1 bg-slate-800 border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap z-50 pointer-events-none"
                    >
                        {text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MODES = [
    {
        id: 'shortest',
        label: 'Shortest',
        icon: TrendingDown,
        color: '#3B82F6',
        bg: 'rgba(59,130,246,0.12)',
        border: 'rgba(59,130,246,0.3)',
        desc: 'Fastest arrival time',
        highlight: 'Best for speed',
        highlightColor: '#3B82F6',
    },
    {
        id: 'safest',
        label: 'Safest',
        icon: ShieldCheck,
        color: '#10B981',
        bg: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.3)',
        desc: 'Zero blackspot path',
        highlight: 'Best for safety',
        highlightColor: '#10B981',
    },
    {
        id: 'balanced',
        label: 'Balanced',
        icon: Scale,
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.3)',
        desc: 'Safety + distance',
        highlight: 'Best compromise',
        highlightColor: '#F59E0B',
    },
];

const VEHICLES = [
    { id: 'car',  label: 'Car',  icon: Car },
    { id: 'bike', label: 'Bike', icon: Bike },
    { id: 'walk', label: 'Walk', icon: Footprints },
];

const gradeInfo = (km) => {
    const d = parseFloat(km) || 0;
    if (d === 0) return { grade: '-', color: '#94A3B8', label: 'N/A' };
    if (d < 5)  return { grade: 'A+', color: '#10B981', label: 'Maximum Safety' };
    if (d < 15) return { grade: 'A',  color: '#059669', label: 'High Safety' };
    if (d < 30) return { grade: 'B',  color: '#3B82F6', label: 'Moderate' };
    return { grade: 'C', color: '#F59E0B', label: 'Caution Advised' };
};

/**
 * ModeComparisonPanel - shows all 3 route modes side-by-side before the user
 * commits to one. This helps decide quickly based on distance, time, and risk.
 */
const ModeComparisonPanel = ({ allRoutes, currentMode, onSelect }) => {
    const modes = MODES.map(m => ({
        ...m,
        route: allRoutes[m.id],
    })).filter(m => m.route);

    if (modes.length === 0) return null;

    // Determine best per metric
    const bestDist = Math.min(...modes.map(m => parseFloat(m.route.distanceKm) || Infinity));
    const bestTime = Math.min(...modes.map(m => parseFloat(m.route.durationMin) || Infinity));
    const bestRisk = Math.min(...modes.map(m => m.route.totalRisk ?? Infinity));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="glass-card flex-none rounded-[32px] p-5 shadow-2xl"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <BarChart2 size={16} className="text-blue-400" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pre-Selection</p>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-none">Mode Comparison</h3>
                </div>
                <span className="ml-auto text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                    All 3 Routes Ready
                </span>
            </div>

            {/* Comparison table */}
            <div className="space-y-2.5">
                {modes.map((m) => {
                    const Icon = m.icon;
                    const dist = parseFloat(m.route.distanceKm) || 0;
                    const time = parseFloat(m.route.durationMin) || 0;
                    const risk = m.route.totalRisk ?? 0;
                    const isActive = currentMode === m.id;

                    const isBestDist = dist === bestDist;
                    const isBestTime = time === bestTime;
                    const isBestRisk = risk === bestRisk;

                    return (
                        <motion.button
                            key={m.id}
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => onSelect(m.id)}
                            className={`w-full text-left p-4 rounded-[22px] border transition-all relative overflow-hidden ${
                                isActive
                                    ? 'border-opacity-60 shadow-lg'
                                    : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'
                            }`}
                            style={isActive ? {
                                background: m.bg,
                                borderColor: m.border,
                                boxShadow: `0 4px 20px ${m.color}25`,
                            } : {
                                background: 'rgba(255,255,255,0.03)',
                            }}
                        >
                            {/* Ambient glow for active */}
                            {isActive && (
                                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
                                    style={{ background: m.color }} />
                            )}

                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: `${m.color}20` }}>
                                    <Icon size={16} style={{ color: m.color }} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-wider"
                                        style={{ color: m.color }}>{m.label}</p>
                                    <p className="text-[9px] text-slate-400 font-bold">{m.desc}</p>
                                </div>
                                {isActive && (
                                    <CheckCircle2 size={16} className="ml-auto" style={{ color: m.color }} />
                                )}
                            </div>

                            {/* Metrics row */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isBestDist ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-black/10 border border-white/5'}`}>
                                    <Ruler size={10} className={isBestDist ? 'text-emerald-400' : 'text-slate-500'} />
                                    <p className={`text-sm font-black font-outfit mt-0.5 ${isBestDist ? 'text-emerald-400' : 'text-slate-700 dark:text-white'}`}>
                                        {dist.toFixed(1)}<span className="text-[8px] font-bold text-slate-500 ml-0.5">km</span>
                                    </p>
                                    {isBestDist && <p className="text-[7px] font-black text-emerald-500 uppercase">Best</p>}
                                </div>

                                <div className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isBestTime ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-black/10 border border-white/5'}`}>
                                    <Clock size={10} className={isBestTime ? 'text-blue-400' : 'text-slate-500'} />
                                    <p className={`text-sm font-black font-outfit mt-0.5 ${isBestTime ? 'text-blue-400' : 'text-slate-700 dark:text-white'}`}>
                                        {Math.round(time)}<span className="text-[8px] font-bold text-slate-500 ml-0.5">min</span>
                                    </p>
                                    {isBestTime && <p className="text-[7px] font-black text-blue-500 uppercase">Fastest</p>}
                                </div>

                                <div className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isBestRisk ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-black/10 border border-white/5'}`}>
                                    <Zap size={10} className={isBestRisk ? 'text-rose-400' : 'text-slate-500'} />
                                    <p className={`text-sm font-black font-outfit mt-0.5 ${isBestRisk ? 'text-rose-400' : 'text-slate-700 dark:text-white'}`}>
                                        {risk}<span className="text-[8px] font-bold text-slate-500 ml-0.5">pts</span>
                                    </p>
                                    {isBestRisk && <p className="text-[7px] font-black text-rose-500 uppercase">Safest</p>}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <p className="text-[9px] text-slate-400 font-bold text-center mt-3 uppercase tracking-widest">
                Tap a mode above to select it · Green = best in class
            </p>
        </motion.div>
    );
};

const Sidebar = () => {
    const {
        source, destination, mode, vehicle,
        routeResult, allRoutes, isComputing, error,
        setSource, setDestination, setMode, setVehicle,
        setRouteResult, setAllRoutes, setBlackspots, setIsComputing, setError, setApproxInfo
    } = useRouteStore();

    const lastFetchRef = React.useRef({ source: null, destination: null, vehicle: null });

    const handleCompute = React.useCallback(async () => {
        if (!source || !destination) return;
        setIsComputing(true);
        setError(null);

        try {
            const hasParamsChanged =
                lastFetchRef.current.source      !== source ||
                lastFetchRef.current.destination !== destination ||
                lastFetchRef.current.vehicle     !== vehicle;

            let cachedRoutes = useRouteStore.getState().allRoutes;
            const hasCachedRoutes = cachedRoutes && Object.keys(cachedRoutes).length > 0;

            if (hasParamsChanged || !hasCachedRoutes) {
                setRouteResult(null);
                setAllRoutes({});
                setBlackspots([]);

                const result = await computeAstarRoutes(source, destination, vehicle, mode);
                const { routes, blackspots, snapped, isApproximate, approxMessage } = result;

                setApproxInfo({
                    isApproximate: isApproximate || false,
                    approxMessage: approxMessage || null,
                    snappedNodes: snapped || null,
                });

                setAllRoutes(routes);
                setBlackspots(blackspots || []);
                cachedRoutes = routes;
                lastFetchRef.current = { source, destination, vehicle };

                if (snapped) {
                    console.log(`📍 Snapped: ${snapped.source?.name} → ${snapped.destination?.name}${isApproximate ? ' [approx]' : ''}`);
                }
            }

            const mainRoute = cachedRoutes[mode] || Object.values(cachedRoutes)[0];
            if (!mainRoute) throw new Error('No route available for this mode.');

            setRouteResult(mainRoute);
        } catch (err) {
            console.error('A* Route error:', err);
            setError(
                err.message?.includes('No route found')
                    ? 'No route found between these locations in our Pune graph. Try major junctions like Shivajinagar or Hadapsar.'
                    : 'Routing engine error. Please check the backend is running.'
            );
        } finally {
            setIsComputing(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, destination, mode, vehicle, setIsComputing, setError, setRouteResult, setAllRoutes, setBlackspots]);

    // Auto-compute when parameters change
    React.useEffect(() => {
        if (source && destination) handleCompute();
    }, [source, destination, mode, vehicle, handleCompute]);

    // When user selects a mode from the comparison panel, switch routeResult immediately
    const handleModeSelect = (m) => {
        setMode(m);
        const routes = useRouteStore.getState().allRoutes;
        if (routes[m]) setRouteResult(routes[m]);
    };

    const activeMode = MODES.find(m => m.id === mode);
    const grade      = gradeInfo(routeResult?.distanceKm);
    const hasAllRoutes = allRoutes && Object.keys(allRoutes).length > 0;

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-5 left-5 w-[330px] max-h-[calc(100vh-40px)] overflow-y-auto overflow-x-hidden pb-4 z-1000 flex flex-col gap-4 font-outfit [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full pr-1"
        >
            {/* ── Main Planner Card ── */}
            <div className="glass-card flex-none rounded-[32px] p-5 shadow-2xl relative overflow-hidden">
                {/* Branding */}
                <div className="flex items-center gap-4 mb-5">
                    <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="relative w-10 h-10 rounded-[16px] bg-slate-950 flex items-center justify-center border border-white/10 shadow-2xl">
                            <Shield className="text-emerald-400" size={20} strokeWidth={2.2} />
                        </div>
                    </motion.div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight font-outfit">
                            Apaghat<span className="text-emerald-500 font-extrabold ml-0.5">Darshak</span>
                        </h1>
                        <div className="flex items-center gap-2.5 mt-1">
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-[0.12em] hidden sm:block font-outfit">· PUNE DIVISION</span>
                        </div>
                    </div>
                </div>

                {/* Location Inputs */}
                <div className="relative mb-5 px-0.5">
                    <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-100 dark:bg-slate-800/40" />
                    <div className="space-y-3">
                        <LocationInput
                            placeholder="From"
                            icon={MapPin}
                            value={source?.displayName?.split(',')[0]}
                            onSelect={setSource}
                        />
                        <LocationInput
                            placeholder="To"
                            icon={ChevronRight}
                            value={destination?.displayName?.split(',')[0]}
                            onSelect={setDestination}
                        />
                    </div>
                </div>

                {/* Vehicle Selector */}
                <div className="flex bg-slate-100 dark:bg-[#111318]/50 border border-slate-200 dark:border-white/10 p-1 rounded-2xl mb-4 shadow-inner">
                    {VEHICLES.map(v => {
                        const Icon = v.icon;
                        const active = vehicle === v.id;
                        return (
                            <Tooltip key={v.id} text={v.label} className="flex-1">
                                <button
                                    onClick={() => setVehicle(v.id)}
                                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-[12px] transition-all duration-300 text-[11px] font-bold ${
                                        active
                                            ? 'bg-white dark:bg-slate-700/80 text-slate-900 dark:text-emerald-400 shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:shadow-[0_2px_8px_rgba(16,185,129,0.15)]'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={14} className={active ? '' : 'opacity-70'} />
                                    <span>{v.label}</span>
                                </button>
                            </Tooltip>
                        );
                    })}
                </div>

                {/* Mode Selector — compact tabs; comparison is shown in the dedicated panel below */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                    {MODES.map(m => {
                        const Icon = m.icon;
                        const active = mode === m.id;
                        return (
                            <Tooltip key={m.id} text={m.desc} className="w-full">
                                <button
                                    onClick={() => handleModeSelect(m.id)}
                                    className={`w-full flex flex-col items-center gap-1.5 px-1.5 py-2.5 rounded-2xl transition-all duration-300 border ${active
                                        ? 'bg-slate-50 dark:bg-slate-800/40 shadow-inner border-emerald-500/20'
                                        : 'bg-transparent border-transparent opacity-40 grayscale hover:opacity-100 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                                    }`}
                                >
                                    <div
                                        className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
                                        style={{ color: active ? m.color : '#64748B' }}
                                    >
                                        <Icon size={18} strokeWidth={2.5} />
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                        {m.label}
                                    </span>
                                </button>
                            </Tooltip>
                        );
                    })}
                </div>

                {/* Hint text */}
                {hasAllRoutes && !isComputing && (
                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-1 mb-0">
                        ↓ Compare all modes below before deciding
                    </p>
                )}

                <AnimatePresence>
                    {isComputing && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <DinoLoader />
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-5 p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-[20px] border border-rose-200/30 dark:border-rose-800/30 flex items-center gap-3 text-xs text-rose-600 dark:text-rose-400 font-medium font-outfit"
                    >
                        <AlertTriangle className="shrink-0" size={16} /> {error}
                    </motion.div>
                )}
            </div>

            {/* ── Mode Comparison Panel (new!) — appears once all routes computed ── */}
            <AnimatePresence>
                {hasAllRoutes && !isComputing && (
                    <ModeComparisonPanel
                        key="comparison"
                        allRoutes={allRoutes}
                        currentMode={mode}
                        onSelect={handleModeSelect}
                    />
                )}
            </AnimatePresence>

            {/* ── Trip Info Card ── */}
            <AnimatePresence>
                {routeResult && !isComputing && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        className="glass-card flex-none rounded-[32px] p-6 shadow-2xl border-b-4"
                        style={{ borderBottomColor: activeMode?.color ?? '#10B981' }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em]">Trip Info</h3>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <ShieldCheck size={14} style={{ color: grade.color }} />
                                <span className="text-[11px] font-bold font-outfit" style={{ color: grade.color }}>{grade.label}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-[24px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50">
                                <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                    <Ruler size={12} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest font-outfit text-slate-500/80">Distance</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">
                                    {routeResult.distanceKm}
                                    <span className="text-xs ml-1 font-semibold text-slate-400">KM</span>
                                </p>
                            </div>
                            <div className="p-4 rounded-[24px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50">
                                <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                    <Clock size={12} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest font-outfit text-slate-500/80">Estimate</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">
                                    {routeResult.durationMin}
                                    <span className="text-xs ml-1 font-semibold text-slate-400">MIN</span>
                                </p>
                            </div>
                        </div>

                        {/* Risk score */}
                        <div className="mt-3 p-3 rounded-[18px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 flex items-center gap-3">
                            <Zap size={14} className="text-amber-500 shrink-0" />
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Risk Score</p>
                                <p className="text-base font-black text-slate-800 dark:text-white font-outfit">{routeResult.totalRisk ?? 0} pts</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: activeMode?.color }}>
                                    {activeMode?.label} Mode
                                </p>
                                <Navigation size={14} style={{ color: activeMode?.color }} className="ml-auto mt-0.5" />
                            </div>
                        </div>

                        {/* Save Route */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                            <Tooltip text="Save">
                                <button
                                    id="save-route-btn"
                                    onClick={() => {
                                        useRouteStore.getState().saveRoute(routeResult, {
                                            source, destination, mode,
                                            riskScore: routeResult.totalRisk || 0,
                                            blackspotCount: (useRouteStore.getState().blackspots || []).length
                                        });
                                        const btn = document.getElementById('save-route-btn');
                                        if (btn) {
                                            const orig = btn.textContent;
                                            btn.textContent = '✓ Saved!';
                                            btn.classList.add('bg-emerald-500', 'text-white');
                                            setTimeout(() => {
                                                btn.textContent = orig;
                                                btn.classList.remove('bg-emerald-500', 'text-white');
                                            }, 2000);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-3 py-2.5 rounded-[20px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                                >
                                    <Bookmark size={14} />
                                    Save Route
                                </button>
                            </Tooltip>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Sidebar;
