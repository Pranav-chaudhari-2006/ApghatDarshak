import React, { useEffect } from 'react';
import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MapRoute,
    MapControls,
    useMap
} from './Map';
import { motion } from 'framer-motion';
import useRouteStore from '../../store/useRouteStore';

const PUNE_CENTER = [73.8567, 18.5204]; // [lng, lat] for MapLibre

const ROUTE_STYLES = {
    shortest: { color: '#3B82F6', width: 6, dashArray: [2, 2] },
    safest: { color: '#10B981', width: 8, dashArray: null },
    balanced: { color: '#F59E0B', width: 7, dashArray: [1, 1] },
};

// Helper to fit bounds in MapLibre
const FitBounds = ({ geometry }) => {
    const { map, isLoaded } = useMap();

    useEffect(() => {
        if (isLoaded && map && geometry?.length > 1) {
            // geometry is [[lat, lng], ...] from store, map.fitBounds needs [lng, lat]
            const bounds = geometry.reduce(
                (acc, coord) => {
                    return [
                        [Math.min(acc[0][0], coord[1]), Math.min(acc[0][1], coord[0])],
                        [Math.max(acc[1][0], coord[1]), Math.max(acc[1][1], coord[0])]
                    ];
                },
                [[geometry[0][1], geometry[0][0]], [geometry[0][1], geometry[0][0]]]
            );

            map.fitBounds(bounds, { padding: 80, duration: 1000 });
        }
    }, [geometry, map, isLoaded]);

    return null;
};

const MapView = () => {
    const { source, destination, mode, routeResult, blackspots } = useRouteStore();
    const routeStyle = ROUTE_STYLES[mode] || ROUTE_STYLES.safest;

    // Convert route geometry for MapRoute ([lat, lng] -> [lng, lat])
    const mapRouteCoordinates = routeResult?.geometry?.map(([lat, lng]) => [lng, lat]) || [];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
            <Map
                center={PUNE_CENTER}
                zoom={12}
                className="w-full h-full"
            >
                <MapControls position="bottom-right" showZoom showLocate showFullscreen />

                {routeResult?.geometry && <FitBounds geometry={routeResult.geometry} />}

                {/* Route Rendering */}
                {mapRouteCoordinates.length > 1 && (
                    <>
                        {/* Glow effect */}
                        <MapRoute
                            coordinates={mapRouteCoordinates}
                            color={routeStyle.color}
                            width={routeStyle.width + 4}
                            opacity={0.2}
                        />
                        {/* Main route */}
                        <MapRoute
                            coordinates={mapRouteCoordinates}
                            color={routeStyle.color}
                            width={routeStyle.width}
                            opacity={0.9}
                            dashArray={routeStyle.dashArray}
                        />
                    </>
                )}

                {/* Markers */}
                {source && (
                    <MapMarker longitude={source.lng} latitude={source.lat}>
                        <MarkerContent>
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-xl">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
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

                {destination && (
                    <MapMarker longitude={destination.lng} latitude={destination.lat}>
                        <MarkerContent>
                            <div className="flex items-center justify-center w-8 h-8 bg-slate-900 rounded-full border-4 border-white shadow-xl">
                                <div className="w-2 h-2 bg-emerald-400 rounded-sm rotate-45"></div>
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

                {/* Blackspots */}
                {blackspots.map((spot, i) => (
                    <MapMarker key={i} longitude={spot.lng} latitude={spot.lat}>
                        <MarkerContent>
                            <div className="relative flex items-center justify-center">
                                <div className="absolute w-10 h-10 bg-rose-500 rounded-full blackspot-pulse opacity-40 animate-ping"></div>
                                <div className="relative w-4 h-4 bg-rose-600 rounded-full border-2 border-white shadow-lg"></div>
                            </div>
                        </MarkerContent>
                        <MarkerPopup>
                            <div className="p-1 min-w-[150px]">
                                <h3 className="font-bold text-rose-600 mb-1 flex items-center gap-1 text-sm">
                                    ⚠️ Blackspot
                                </h3>
                                <p className="text-xs text-gray-600">Risk Score: <b className="text-rose-700">{spot.risk}</b></p>
                                <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] text-center">
                                    <div className="bg-rose-50 p-1 rounded border border-rose-100 font-medium">Fatal<br />{spot.fatal}</div>
                                    <div className="bg-orange-50 p-1 rounded border border-orange-100 font-medium">Major<br />{spot.major}</div>
                                    <div className="bg-gray-50 p-1 rounded border border-gray-100 font-medium">Minor<br />{spot.minor}</div>
                                </div>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}
            </Map>
        </motion.div>
    );
};

export default React.memo(MapView);
