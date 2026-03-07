import { create } from 'zustand';

/**
 * Route Store — Global state for routing
 *
 * source / destination: { displayName, lat, lng } | null
 * mode: 'shortest' | 'safest' | 'balanced'
 * routeResult: { geometry: [[lat,lng],...], distanceKm, durationMin } | null
 * blackspots: [{ lat, lng, risk }]
 * isComputing: boolean
 * error: string | null
 */
const useRouteStore = create((set) => ({
    source: null,
    destination: null,
    mode: 'safest',
    routeResult: null,
    blackspots: [],
    isComputing: false,
    error: null,

    setSource: (source) => set({ source, error: null }),
    setDestination: (destination) => set({ destination, error: null }),
    setMode: (mode) => set({ mode }),
    setRouteResult: (routeResult) => set({ routeResult }),
    setBlackspots: (blackspots) => set({ blackspots }),
    setIsComputing: (isComputing) => set({ isComputing }),
    setError: (error) => set({ error }),

    reset: () => set({
        source: null,
        destination: null,
        routeResult: null,
        blackspots: [],
        error: null,
        isComputing: false,
    }),
}));

export default useRouteStore;
