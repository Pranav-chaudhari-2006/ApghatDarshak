// Nominatim (OpenStreetMap) Geocoding Service
// 100% Free — No API key needed
// Docs: https://nominatim.org/release-docs/latest/api/Search/

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Search for locations by text query
 * Returns array of suggestions with display name + coordinates
 */
export async function searchLocations(query) {
    if (!query || query.trim().length < 3) return [];

    const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
        countrycodes: 'in', // Restrict to India — remove if needed globally
    });

    const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
        headers: {
            'Accept-Language': 'en',
            'User-Agent': 'GuardianRoute-AccidentDetection/1.0',
        },
    });

    if (!response.ok) throw new Error('Nominatim search failed');

    const data = await response.json();

    return data.map((item) => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        placeId: item.place_id,
    }));
}

/**
 * Reverse geocode a lat/lng to a display name
 */
export async function reverseGeocode(lat, lng) {
    const params = new URLSearchParams({
        lat,
        lon: lng,
        format: 'json',
    });

    const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
        headers: {
            'Accept-Language': 'en',
            'User-Agent': 'GuardianRoute-AccidentDetection/1.0',
        },
    });

    if (!response.ok) throw new Error('Reverse geocode failed');

    const data = await response.json();
    return data.display_name || `${lat}, ${lng}`;
}
