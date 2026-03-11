import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Route Store — Global state for routing
 */
const useRouteStore = create(
    persist(
        (set, get) => ({
            source: null,
            destination: null,
            mode: 'safest',
            vehicle: 'car',
            routeResult: null,
            allRoutes: {}, 
            blackspots: [],
            showBlackspots: true,
            isComputing: false,
            error: null,
            routeHistory: [], // Persistent history

            setSource: (source) => set({ 
                source, 
                error: null,
                routeResult: null,
                allRoutes: {},
                blackspots: [],
                isApproximate: false,
                approxMessage: null,
                snappedNodes: null
            }),
            setDestination: (destination) => set({ 
                destination, 
                error: null,
                routeResult: null,
                allRoutes: {},
                blackspots: [],
                isApproximate: false,
                approxMessage: null,
                snappedNodes: null
            }),
            setMode: (mode) => set({ mode }),
            setVehicle: (vehicle) => set({ vehicle }),
            setRouteResult: (routeResult) => set({ routeResult }),
            setAllRoutes: (allRoutes) => set({ allRoutes }),
            setBlackspots: (blackspots) => set({ blackspots }),
            setShowBlackspots: (showBlackspots) => set({ showBlackspots }),
            setIsComputing: (isComputing) => set({ isComputing }),
            setError: (error) => set({ error }),
            
            isApproximate: false,
            approxMessage: null,
            snappedNodes: null,
            setApproxInfo: (info) => set(info),

            saveRoute: (route, meta) => {
                const historyItem = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    source: meta.source,
                    destination: meta.destination,
                    mode: meta.mode,
                    distanceKm: route.distanceKm,
                    durationMin: route.durationMin,
                    riskScore: meta.riskScore || 0,
                    blackspotCount: meta.blackspotCount || 0
                };
                set((state) => ({ 
                    routeHistory: [historyItem, ...state.routeHistory].slice(0, 50) 
                }));
            },

            clearHistory: () => set({ routeHistory: [] }),

            reset: () => set({
                source: null,
                destination: null,
                routeResult: null,
                allRoutes: {},
                blackspots: [],
                error: null,
                isComputing: false,
            }),
        }),
        {
            name: 'apghat-darshak-routes',
            partialize: (state) => ({ routeHistory: state.routeHistory }),
        }
    )
);

export default useRouteStore;
