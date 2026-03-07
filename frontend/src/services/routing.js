// OpenRouteService (ORS) Routing Service
// Docs: https://openrouteservice.org/dev/#/api-docs
// Profile used: driving-car (road network)

const ORS_BASE = 'https://api.openrouteservice.org/v2';
const API_KEY = import.meta.env.VITE_ORS_API_KEY;

/**
 * Get a route from ORS between two coordinates
 *
 * @param {[number, number]} origin - [lng, lat]  ← ORS uses lng,lat order
 * @param {[number, number]} destination - [lng, lat]
 * @param {string} preference - 'recommended' | 'fastest' | 'shortest'
 * @returns route geometry (array of [lat, lng] pairs for Leaflet), distance in km, duration in mins
 */
export async function getRoute(origin, destination, preference = 'recommended') {
    const body = {
        coordinates: [origin, destination],
        preference,
        format: 'geojson', // Request GeoJSON for direct coordinate access
        units: 'km',
        language: 'en',
        geometry: true,
        instructions: false,
    };

    console.log("ORS Request:", body);

    const response = await fetch(`${ORS_BASE}/directions/driving-car/geojson`, {
        method: 'POST',
        headers: {
            'Authorization': API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json, application/geo+json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("ORS Error Response:", err);
        throw new Error(`ORS routing failed: ${response.status} ${err}`);
    }

    const data = await response.json();
    console.log("ORS Response Data:", data);

    // When format is 'geojson', ORS returns a FeatureCollection
    const feature = data.features[0];
    if (!feature) throw new Error("No route found in ORS response");

    const { summary } = feature.properties;

    // ORS returns coordinates as [lng, lat] — flip to [lat, lng] for internal store
    const geometry = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    return {
        geometry,
        distanceKm: (summary.distance).toFixed(2),
        durationMin: (summary.duration / 60).toFixed(1),
    };
}

/**
 * Map our routing mode → ORS preference
 */
export function modeToOrsPreference(mode) {
    switch (mode) {
        case 'shortest': return 'shortest';
        case 'safest': return 'recommended'; // ORS recommended avoids highways = safer
        case 'balanced': return 'fastest';
        default: return 'recommended';
    }
}
