import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MarkerTooltip,
    MapRoute,
    MapControls,
    useMap
} from './Map';
import { motion, AnimatePresence } from 'framer-motion';
import useRouteStore from '../../store/useRouteStore';

const PUNE_CENTER = [73.8567, 18.5204]; // [lng, lat] for MapLibre

const ROUTE_STYLES = {
    shortest: { label: 'Shortest Route', dashArray: [2, 2] },
    safest:   { label: 'Safest Route',   dashArray: null },
    balanced: { label: 'Balanced Route', dashArray: [1, 1] },
};

const PRIMARY_COLOR   = '#10B981'; // Emerald Green
const SECONDARY_COLOR = '#FDBA74'; // Light Orange

/**
 * Determine blackspot color based on dominant accident severity.
 */
function getBlackspotStyle(spot) {
    const fatal = spot.fatal || 0;
    const major = spot.major || 0;

    if (fatal > 0) return {
        ring: 'bg-red-500', dot: 'bg-red-600', glow: '#ef4444',
        label: '🔴 Fatal Zone', labelColor: 'text-red-600', riskColor: 'text-red-700',
    };
    if (major > 0) return {
        ring: 'bg-orange-500', dot: 'bg-orange-600', glow: '#f97316',
        label: '🟠 Major Risk', labelColor: 'text-orange-600', riskColor: 'text-orange-700',
    };
    return {
        ring: 'bg-yellow-400', dot: 'bg-yellow-500', glow: '#eab308',
        label: '🟡 Minor Risk', labelColor: 'text-yellow-600', riskColor: 'text-yellow-700',
    };
}

/**
 * FitBounds — auto-pans the map to fit the computed route.
 * geometry is an array of [lat, lng] pairs (backend format).
 */
const FitBounds = ({ geometry }) => {
    const { map, isLoaded } = useMap();
    const lastGeomRef = useRef(null);

    useEffect(() => {
        if (!isLoaded || !map || !geometry || geometry.length < 2) return;
        // Only re-fit if the geometry has genuinely changed
        if (lastGeomRef.current === geometry) return;
        lastGeomRef.current = geometry;

        // geometry[i] = [lat, lng]. fitBounds needs [[minLng, minLat], [maxLng, maxLat]]
        const lngs = geometry.map(([, lng]) => lng);
        const lats = geometry.map(([lat]) => lat);
        const minLng = lngs.reduce((min, val) => Math.min(min, val), Infinity);
        const maxLng = lngs.reduce((max, val) => Math.max(max, val), -Infinity);
        const minLat = lats.reduce((min, val) => Math.min(min, val), Infinity);
        const maxLat = lats.reduce((max, val) => Math.max(max, val), -Infinity);

        const bounds = [
            [minLng, minLat],
            [maxLng, maxLat],
        ];
        map.fitBounds(bounds, { padding: 80, duration: 1200, maxZoom: 16 });
    }, [geometry, map, isLoaded]);

    return null;
};

const MapView = () => {
    const {
        source, destination, mode, routeResult, allRoutes,
        blackspots, showBlackspots, setMode, isApproximate, approxMessage, setApproxInfo
    } = useRouteStore();

    const routeStyle = ROUTE_STYLES[mode] || ROUTE_STYLES.safest;
    const [hoveredRoute, setHoveredRoute] = useState(null);

    // Route is only "active" when we have computed geometry with at least 2 points
    const hasRoute = !!(routeResult?.geometry?.length >= 2);

    // Convert geometry from backend [lat,lng] → MapLibre [lng,lat]
    // Using JSON-based stable memoization to avoid unnecessary redraws
    const geometryKey = routeResult?.geometry ? JSON.stringify(routeResult.geometry) : null;
    const mapRouteCoords = useMemo(
        () => {
            if (!routeResult?.geometry?.length) return [];
            const safeCoords = routeResult.geometry
                .map(([lat, lng]) => [parseFloat(lng), parseFloat(lat)])
                .filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat));
            return safeCoords.length >= 2 ? safeCoords : [];
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [geometryKey]
    );

    // Secondary routes (the two modes NOT currently selected)
    const secondaryRoutes = useMemo(() => {
        return ['safest', 'shortest', 'balanced']
            .filter(m => m !== mode && allRoutes[m]?.geometry?.length >= 2)
            .map(m => {
                const coords = allRoutes[m].geometry
                    .map(([lat, lng]) => [parseFloat(lng), parseFloat(lat)])
                    .filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat));
                return {
                    id: m,
                    style: ROUTE_STYLES[m] || ROUTE_STYLES.safest,
                    coords: coords.length >= 2 ? coords : [],
                };
            })
            .filter(r => r.coords.length >= 2);
    }, [mode, allRoutes]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">

            {/* ── Approximate route notice ── */}
            <AnimatePresence>
                {isApproximate && hasRoute && (
                    <motion.div
                        key="approx-map-notice"
                        initial={{ opacity: 0, y: -20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.96 }}
                        className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] max-w-[420px] rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl px-5 py-4 flex items-start gap-3 shadow-[0_8px_32px_rgba(245,158,11,0.15)]"
                    >
                        <div className="mt-0.5 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                            <span className="text-amber-400 text-[12px] font-black">!</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-amber-400 mb-1.5">Approximated Connection</p>
                            <p className="text-[12px] text-amber-100/90 leading-relaxed font-outfit">
                                {approxMessage || 'An approximate route was computed as no direct road connection was found.'}
                            </p>
                        </div>
                        <button
                            onClick={() => setApproxInfo({ isApproximate: false })}
                            className="w-6 h-6 rounded-full bg-amber-500/20 hover:bg-amber-500/40 flex items-center justify-center text-amber-300 hover:text-white transition-colors shrink-0 mt-0.5 ml-2"
                        >
                            <span className="text-[10px] font-black leading-none">✕</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <Map center={PUNE_CENTER} zoom={12} className="w-full h-full">
                <MapControls position="bottom-right" showZoom showLocate showFullscreen showGlobe show3D />

                {/* Auto-fit to route whenever geometry changes */}
                {hasRoute && <FitBounds geometry={routeResult.geometry} />}

                {/* ── Secondary Routes (greyed out) ── */}
                {secondaryRoutes.map(route => (
                    <MapRoute
                        key={`secondary-${route.id}`}
                        id={`secondary-${route.id}`}
                        coordinates={route.coords}
                        color={SECONDARY_COLOR}
                        width={5}
                        opacity={0.4}
                        dashArray={route.style.dashArray}
                        interactive={true}
                        onClick={() => setMode(route.id)}
                        onMouseEnter={(e) => {
                            if (e?.lngLat) {
                                setHoveredRoute({
                                    lng: e.lngLat.lng,
                                    lat: e.lngLat.lat,
                                    label: `Switch to ${route.style.label}`,
                                    color: SECONDARY_COLOR,
                                });
                            }
                        }}
                        onMouseLeave={() => setHoveredRoute(null)}
                    />
                ))}

                {/* ── Primary Route ── */}
                {hasRoute && mapRouteCoords.length >= 2 && (
                    <>
                        {/* Glow underlay */}
                        <MapRoute
                            id="main-glow"
                            coordinates={mapRouteCoords}
                            color={PRIMARY_COLOR}
                            width={18}
                            opacity={0.18}
                        />
                        {/* Core solid line */}
                        <MapRoute
                            id="main-route"
                            coordinates={mapRouteCoords}
                            color={PRIMARY_COLOR}
                            width={8}
                            opacity={0.95}
                            dashArray={routeStyle.dashArray}
                            interactive={true}
                            onMouseEnter={(e) => {
                                if (e?.lngLat) {
                                    setHoveredRoute({
                                        lng: e.lngLat.lng,
                                        lat: e.lngLat.lat,
                                        label: `Primary: ${routeStyle.label}`,
                                        color: PRIMARY_COLOR,
                                    });
                                }
                            }}
                            onMouseLeave={() => setHoveredRoute(null)}
                        />
                    </>
                )}

                {/* Route hover label */}
                {hoveredRoute && (
                    <MapMarker longitude={hoveredRoute.lng} latitude={hoveredRoute.lat}>
                        <MarkerContent>
                            <div
                                className="px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold font-outfit text-white whitespace-nowrap -translate-y-8 pointer-events-none"
                                style={{ backgroundColor: hoveredRoute.color }}
                            >
                                {hoveredRoute.label}
                            </div>
                        </MarkerContent>
                    </MapMarker>
                )}

                {/* ── Origin Marker ── */}
                {source && (
                    <MapMarker longitude={source.lng} latitude={source.lat}>
                        <MarkerContent>
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-xl">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <div className="p-1">
                                <p className="font-bold text-blue-600">Origin</p>
                                <p className="text-xs">{source.displayName?.split(',')[0]}</p>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                )}

                {/* ── Destination Marker ── */}
                {destination && (
                    <MapMarker longitude={destination.lng} latitude={destination.lat}>
                        <MarkerContent>
                            <div className="flex items-center justify-center w-8 h-8 bg-slate-900 rounded-full border-4 border-white shadow-xl">
                                <div className="w-2 h-2 bg-emerald-400 rounded-sm rotate-45" />
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <div className="p-1">
                                <p className="font-bold text-slate-800">Destination</p>
                                <p className="text-xs">{destination.displayName?.split(',')[0]}</p>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                )}

                {/* ── Blackspot Markers ── */}
                {showBlackspots && blackspots.map((spot, i) => {
                    const s = getBlackspotStyle(spot);
                    return (
                        <MapMarker key={`bs-${i}`} longitude={spot.lng} latitude={spot.lat}>
                            <MarkerContent>
                                <div className="relative w-8 h-8 flex items-center justify-center cursor-pointer group">
                                    <div className={`absolute inset-0 ${s.ring} rounded-full opacity-50 animate-ping`} />
                                    <div className={`absolute inset-1 ${s.ring} rounded-full opacity-30`} />
                                    <div
                                        className={`relative z-10 w-4 h-4 ${s.dot} rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-125`}
                                        style={{ boxShadow: `0 0 14px 5px ${s.glow}88` }}
                                    />
                                </div>
                            </MarkerContent>
                            <MarkerTooltip className="bg-transparent! border-none! shadow-none! p-0!">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="glass-card rounded-2xl! p-4 min-w-[190px] border border-white/20 shadow-2xl"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`} />
                                        <h3 className={`font-bold ${s.labelColor} text-xs font-outfit uppercase tracking-wider`}>
                                            {s.label}
                                        </h3>
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold px-1">
                                            <span>SEVERITY INDEX</span>
                                            <span className={s.riskColor}>{spot.risk}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="flex flex-col items-center p-2 rounded-xl bg-red-500/5 border border-red-500/10">
                                                <span className="text-[8px] font-black text-red-500/60 uppercase">Fatal</span>
                                                <span className="text-sm font-black text-red-600 font-outfit">{spot.fatal || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                                <span className="text-[8px] font-black text-orange-500/60 uppercase">Major</span>
                                                <span className="text-sm font-black text-orange-600 font-outfit">{spot.major || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                                                <span className="text-[8px] font-black text-yellow-500/60 uppercase">Minor</span>
                                                <span className="text-sm font-black text-yellow-600 font-outfit">{spot.minor || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </MarkerTooltip>
                        </MapMarker>
                    );
                })}
            </Map>
        </motion.div>
    );
};

export default React.memo(MapView);
