import React, { useEffect, useMemo, useState } from 'react';
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
    safest: { label: 'Safest Route', dashArray: null },
    balanced: { label: 'Balanced Route', dashArray: [1, 1] },
};

const PRIMARY_COLOR = '#10B981'; // Emerald Green
const SECONDARY_COLOR = '#FDBA74'; // Light Orange

/**
 * Determine blackspot color based on dominant accident severity:
 *   🔴 RED    → fatal_count > 0
 *   🟠 ORANGE → major_count > 0 (no fatals)
 *   🟡 YELLOW → minor only
 */
function getBlackspotStyle(spot) {
    const fatal = spot.fatal || 0;
    const major = spot.major || 0;

    if (fatal > 0) {
        return {
            ring: 'bg-red-500',
            dot: 'bg-red-600',
            glow: '#ef4444',
            label: '🔴 Fatal Zone',
            labelColor: 'text-red-600',
            riskColor: 'text-red-700',
        };
    }
    if (major > 0) {
        return {
            ring: 'bg-orange-500',
            dot: 'bg-orange-600',
            glow: '#f97316',
            label: '🟠 Major Risk',
            labelColor: 'text-orange-600',
            riskColor: 'text-orange-700',
        };
    }
    return {
        ring: 'bg-yellow-400',
        dot: 'bg-yellow-500',
        glow: '#eab308',
        label: '🟡 Minor Risk',
        labelColor: 'text-yellow-600',
        riskColor: 'text-yellow-700',
    };
}

// Helper — fit map bounds to the computed route
// geometry is an array of [lat, lng] pairs (as returned by the backend)
const FitBounds = ({ geometry }) => {
    const { map, isLoaded } = useMap();

    useEffect(() => {
        if (isLoaded && map && geometry?.length > 1) {
            // geometry[i] = [lat, lng]
            // MapLibre fitBounds expects [[minLng, minLat], [maxLng, maxLat]]
            const bounds = geometry.reduce(
                (acc, [lat, lng]) => [
                    [Math.min(acc[0][0], lng), Math.min(acc[0][1], lat)],
                    [Math.max(acc[1][0], lng), Math.max(acc[1][1], lat)],
                ],
                [[geometry[0][1], geometry[0][0]], [geometry[0][1], geometry[0][0]]]
            );
            map.fitBounds(bounds, { padding: 80, duration: 1000 });
        }
    }, [geometry, map, isLoaded]);

    return null;
};

const MapView = () => {
    const { source, destination, mode, routeResult, allRoutes, blackspots, showBlackspots, setMode, isApproximate, approxMessage, setApproxInfo } = useRouteStore();
    const routeStyle = ROUTE_STYLES[mode] || ROUTE_STYLES.safest;
    const [hoveredRoute, setHoveredRoute] = useState(null);

    // Route is only "active" when we have computed geometry
    const hasRoute = !!(routeResult?.geometry?.length > 1);

    // Debug log
    console.log(`🗺️ MapView render: ${blackspots.length} blackspots, showBlackspots=${showBlackspots}, hasRoute=${hasRoute}`);

    // Convert geometry from store [lat,lng] → MapLibre [lng,lat]
    // Memoized to avoid creating a new array reference on every render
    const mapRouteCoords = useMemo(
        () => routeResult?.geometry?.map(([lat, lng]) => [lng, lat]) ?? [],
        [routeResult]
    );
    
    // Extract alternative routes (memoized for the same reason)
    const secondaryRoutes = useMemo(
        () =>
            ['safest', 'shortest', 'balanced']
                .filter(m => m !== mode && allRoutes[m]?.geometry?.length > 1)
                .map((m) => ({
                    id: m,
                    style: ROUTE_STYLES[m] || ROUTE_STYLES.safest,
                    coords: allRoutes[m].geometry.map(([lat, lng]) => [lng, lat])
                })),
        [mode, allRoutes]
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
            
            {/* ── Approximate Route Consent Popup on Map ── */}
            <AnimatePresence>
                {isApproximate && hasRoute && (
                    <motion.div
                        key="approx-map-notice"
                        initial={{ opacity: 0, y: -20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.96 }}
                        className="absolute top-6 left-1/2 -translate-x-1/2 z-1000 max-w-[420px] rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl px-5 py-4 flex items-start gap-3 shadow-[0_8px_32px_rgba(245,158,11,0.15)]"
                    >
                        <div className="mt-0.5 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                            <span className="text-amber-400 text-[12px] font-black">!</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-amber-400 mb-1.5">Approximated Connection</p>
                            <p className="text-[12px] text-amber-100/90 leading-relaxed font-outfit">{approxMessage || 'An approximate route was computed as no direct road connection was found.'}</p>
                        </div>
                        <button
                            onClick={() => setApproxInfo({ isApproximate: false })}
                            className="w-6 h-6 rounded-full bg-amber-500/20 hover:bg-amber-500/40 flex items-center justify-center text-amber-300 hover:text-white transition-colors shrink-0 mt-0.5 ml-2"
                            title="Dismiss"
                        >
                            <span className="text-[10px] font-black leading-none">✕</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <Map center={PUNE_CENTER} zoom={12} className="w-full h-full">
                <MapControls position="bottom-right" showZoom showLocate showFullscreen showGlobe show3D />

                {/* Auto-fit to route */}
                {hasRoute && <FitBounds geometry={routeResult.geometry} />}

                {/* ── Secondary Routes ── */}
                {secondaryRoutes.map(route => (
                    <MapRoute
                        key={`secondary-${route.id}`}
                        id={`secondary-${route.id}`}
                        coordinates={route.coords}
                        color={SECONDARY_COLOR}
                        width={5}
                        opacity={0.35}
                        dashArray={route.style.dashArray}
                        interactive={true}
                        onClick={() => setMode(route.id)}
                        onMouseEnter={(e) => {
                            if (e && e.lngLat) {
                                setHoveredRoute({
                                    lng: e.lngLat.lng,
                                    lat: e.lngLat.lat,
                                    label: `Alternative: ${route.style.label}`,
                                    color: SECONDARY_COLOR
                                });
                            }
                        }}
                        onMouseLeave={() => setHoveredRoute(null)}
                    />
                ))}

                {/* ── Main Route Line ── */}
                {hasRoute && (
                    <>
                        {/* Soft glow underlay */}
                        <MapRoute
                            id="main-glow"
                            coordinates={mapRouteCoords}
                            color={PRIMARY_COLOR}
                            width={14}
                            opacity={0.2}
                        />
                        {/* Solid route */}
                        <MapRoute
                            id="main-route"
                            coordinates={mapRouteCoords}
                            color={PRIMARY_COLOR}
                            width={8}
                            opacity={0.95}
                            interactive={true}
                            onMouseEnter={(e) => {
                                if (e && e.lngLat) {
                                    setHoveredRoute({
                                        lng: e.lngLat.lng,
                                        lat: e.lngLat.lat,
                                        label: `Primary: ${routeStyle.label}`,
                                        color: PRIMARY_COLOR
                                    });
                                }
                            }}
                            onMouseLeave={() => setHoveredRoute(null)}
                        />
                    </>
                )}

                {/* Hover Tag */}
                {hoveredRoute && (
                    <MapMarker longitude={hoveredRoute.lng} latitude={hoveredRoute.lat}>
                        <MarkerContent>
                            <div 
                                className="px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold font-outfit text-white whitespace-nowrap -translate-y-8"
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
                                <p className="text-xs">{source.displayName.split(',')[0]}</p>
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
                                <p className="text-xs">{destination.displayName.split(',')[0]}</p>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                )}

                {/* ── Blackspots — Visible during selection and after route computation ── */}
                {showBlackspots && blackspots.map((spot, i) => {
                    const s = getBlackspotStyle(spot);
                    return (
                        <MapMarker key={`bs-${i}`} longitude={spot.lng} latitude={spot.lat}>
                            <MarkerContent>
                                {/* Explicit w-8 h-8 container so absolute children have a positioned parent with size */}
                                <div className="relative w-8 h-8 flex items-center justify-center cursor-pointer group">
                                    {/* Outer pulsing ring — fills the 32px container */}
                                    <div
                                        className={`absolute inset-0 ${s.ring} rounded-full opacity-50 animate-ping`}
                                    />
                                    {/* Secondary softer ring */}
                                    <div
                                        className={`absolute inset-1 ${s.ring} rounded-full opacity-30`}
                                    />
                                    {/* Core dot — centered inside */}
                                    <div
                                        className={`relative z-10 w-4 h-4 ${s.dot} rounded-full border-2 border-white shadow-lg blackspot-sparkle transition-transform group-hover:scale-125`}
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
