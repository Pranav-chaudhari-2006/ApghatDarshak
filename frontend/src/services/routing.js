/**
 * ApghatDarshak — Route API Service
 *
 * Calls the backend A* routing engine instead of ORS.
 * One single call returns all 3 route variants + blackspots.
 */

import { API_BASE_URL } from '../config/api';

/**
 * Compute A* routes from backend for all 3 modes simultaneously.
 *
 * @param {{ lat, lng }} source
 * @param {{ lat, lng }} destination
 * @param {string} vehicle  'car' | 'bike' | 'walk'
 * @param {string} mode     'shortest' | 'safest' | 'balanced'
 *
 * @returns {{ routes: {safest,shortest,balanced}, blackspots, totalRisk, snapped, algorithm }}
 */
export async function computeAstarRoutes(source, destination, vehicle = 'car', mode = 'safest') {
    const response = await fetch(`${API_BASE_URL}/route`, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({
            sourceLat : source.lat,
            sourceLng : source.lng,
            destLat   : destination.lat,
            destLng   : destination.lng,
            mode,
            vehicle,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`A* routing failed: ${response.status} — ${err}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Routing engine returned no route');
    }

    console.log(`🚀 A* result: algorithm=${data.algorithm}, mode=${data.mode}`);
    console.log(`   Snapped source → "${data.snapped?.source?.name}"`);
    console.log(`   Snapped dest   → "${data.snapped?.destination?.name}"`);
    console.log(`   Routes found   : ${Object.keys(data.routes).join(', ')}`);
    console.log(`   Blackspots     : ${data.blackspots?.length}`);

    return data;
}

/**
 * Fetch global blackspots for Pune city.
 */
export async function fetchBlackspots() {
    try {
        const response = await fetch(`${API_BASE_URL}/blackspots`);
        if (!response.ok) return [];
        return await response.json();
    } catch (err) {
        console.error('Failed to fetch blackspots:', err);
        return [];
    }
}
