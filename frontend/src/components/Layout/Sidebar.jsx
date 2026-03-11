import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Navigation, MapPin, RefreshCw, Loader2, AlertTriangle,
    ShieldCheck, Shield, Route, Zap, TrendingDown, Scale,
    Clock, Ruler, Star, ChevronRight, Car, Bike, Footprints, Bookmark
} from 'lucide-react';
import LocationInput from '../UI/LocationInput';
import DinoLoader from '../UI/DinoLoader';
import useRouteStore from '../../store/useRouteStore';
import { computeAstarRoutes } from '../../services/routing';

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

const VEHICLES = [
    { id: 'car', label: 'Car', icon: Car },
    { id: 'bike', label: 'Bike', icon: Bike },
    { id: 'walk', label: 'Walk', icon: Footprints },
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
        source, destination, mode, vehicle,
        routeResult, isComputing, error,
        setSource, setDestination, setMode, setVehicle,
        setRouteResult, setAllRoutes, setBlackspots, setIsComputing, setError,
    } = useRouteStore();

    const lastFetchRef = React.useRef({ source: null, destination: null, vehicle: null });

    const handleCompute = React.useCallback(async () => {
        if (!source || !destination) return;
        setIsComputing(true);
        setError(null);

        try {
            const hasParamsChanged =
                lastFetchRef.current.source      !== source  ||
                lastFetchRef.current.destination !== destination ||
                lastFetchRef.current.vehicle     !== vehicle;

            // Use cached routes if only mode changed
            let cachedRoutes = useRouteStore.getState().allRoutes;
            const hasCachedRoutes = cachedRoutes && Object.keys(cachedRoutes).length > 0;

            if (hasParamsChanged || !hasCachedRoutes) {
                setRouteResult(null);
                setAllRoutes({});
                setBlackspots([]);

                // ── Single A* call — returns ALL 3 routes + blackspots ──
                const result = await computeAstarRoutes(source, destination, vehicle, mode);

                const { routes, blackspots, snapped } = result;

                // Store all routes so mode-switching is instant (no re-fetch)
                setAllRoutes(routes);
                setBlackspots(blackspots || []);

                cachedRoutes = routes;
                lastFetchRef.current = { source, destination, vehicle };

                if (snapped) {
                    console.log(`📍 Snapped: ${snapped.source?.name} → ${snapped.destination?.name}`);
                }
            }

            // Select primary route for the current mode
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
        if (source && destination) {
            handleCompute();
        }
    }, [source, destination, mode, vehicle, handleCompute]);


    const activeMode = MODES.find(m => m.id === mode);
    const grade = gradeInfo(routeResult?.distanceKm);

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-5 left-5 w-[330px] z-1000 flex flex-col gap-4"
        >
            {/* ── Main Planner Card ── */}
            <div className="glass-card rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
                {/* Branding */}
                <div className="flex items-center gap-4 mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="relative group cursor-pointer"
                    >
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

                {/* Vertical Step Connector */}
                <div className="relative mb-8 px-0.5">
                    <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-100 dark:bg-slate-800/40" />
                    <div className="space-y-3">
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

                {/* Vehicle Selector */}
                <div className="flex bg-slate-100 dark:bg-slate-800/40 p-1 rounded-2xl mb-5">
                    {VEHICLES.map(v => {
                        const Icon = v.icon;
                        const active = vehicle === v.id;
                        return (
                            <button
                                key={v.id}
                                onClick={() => setVehicle(v.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 font-outfit text-xs font-bold ${
                                    active
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                <Icon size={14} />
                                {v.label}
                            </button>
                        );
                    })}
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {MODES.map(m => {
                        const Icon = m.icon;
                        const active = mode === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl transition-all duration-300 border ${active
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
                                <span className={`text-[9px] font-bold uppercase tracking-wider font-outfit ${active ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                    {m.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {isComputing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
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

            {/* ── Statistics Overlay ── */}
            <AnimatePresence>
                {routeResult && !isComputing && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        className="glass-card rounded-[40px] p-8 shadow-2xl border-b-4 border-emerald-500/50"
                        style={{ borderBottomColor: activeMode.color }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] font-outfit">Travel Statistics</h3>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <ShieldCheck size={14} style={{ color: grade.color }} />
                                <span className="text-[11px] font-bold font-outfit" style={{ color: grade.color }}>{grade.label}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-[28px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50">
                                <div className="flex items-center gap-2 mb-2 text-slate-400">
                                    <Ruler size={12} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest font-outfit text-slate-500/80">Distance</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">
                                    {routeResult.distanceKm}
                                    <span className="text-xs ml-1 font-semibold text-slate-400">KM</span>
                                </p>
                            </div>
                            <div className="p-5 rounded-[28px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50">
                                <div className="flex items-center gap-2 mb-2 text-slate-400">
                                    <Clock size={12} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest font-outfit text-slate-500/80">Estimates</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">
                                    {routeResult.durationMin}
                                    <span className="text-xs ml-1 font-semibold text-slate-400">MIN</span>
                                </p>
                            </div>
                        </div>

                        {/* Save Route Action */}
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                            <button
                                onClick={() => {
                                    useRouteStore.getState().saveRoute(routeResult, { 
                                        source, 
                                        destination, 
                                        mode,
                                        riskScore: routeResult.riskScore || 0,
                                        blackspotCount: (useRouteStore.getState().blackspots || []).length
                                    });
                                    // Visual feedback
                                    const btn = document.getElementById('save-route-btn');
                                    if (btn) {
                                        const original = btn.innerHTML;
                                        btn.innerHTML = 'Saved Successfully!';
                                        btn.classList.add('bg-emerald-500', 'text-white');
                                        setTimeout(() => {
                                            btn.innerHTML = original;
                                            btn.classList.remove('bg-emerald-500', 'text-white');
                                        }, 2000);
                                    }
                                }}
                                id="save-route-btn"
                                className="w-full flex items-center justify-center gap-3 py-4 rounded-[24px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                            >
                                <Bookmark size={14} />
                                Save to History
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Sidebar;
