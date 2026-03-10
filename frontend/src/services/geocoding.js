// Nominatim (OpenStreetMap) Geocoding Service
// 100% Free — No API key needed
// Docs: https://nominatim.org/release-docs/latest/api/Search/

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Common Pune-specific spelling corrections map
 * Handles typical typing mistakes for well-known areas
 */
const PUNE_SPELLING_MAP = {
    'shivajingr': 'shivajinagar', 'shivajingaar': 'shivajinagar', 'shivajinagr': 'shivajinagar',
    'decen': 'deccan', 'decan': 'deccan', 'daccan': 'deccan',
    'kotrood': 'kothrud', 'kathrood': 'kothrud', 'kotrud': 'kothrud',
    'katraj': 'katraj', 'katras': 'katraj',
    'hadapsar': 'hadapsar', 'hadapser': 'hadapsar', 'hadaapsar': 'hadapsar',
    'magarpata': 'magarpatta', 'magarpataa': 'magarpatta',
    'viman': 'viman nagar', 'vimannagar': 'viman nagar',
    'hinjwadi': 'hinjewadi', 'hinjuadi': 'hinjewadi', 'hinjvadi': 'hinjewadi',
    'wakd': 'wakad', 'waked': 'wakad',
    'baner': 'baner', 'baaner': 'baner',
    'aundh': 'aundh', 'aund': 'aundh',
    'pimpri': 'pimpri', 'pimpari': 'pimpri',
    'chinchvad': 'chinchwad', 'chinchwad': 'chinchwad',
    'swarget': 'swargate', 'swargat': 'swargate',
    'kowdhwa': 'kondhwa', 'kondhwa': 'kondhwa', 'kondwa': 'kondhwa',
    'yerawada': 'yerwada', 'yerwada': 'yerwada',
    'kharadi': 'kharadi', 'kharidy': 'kharadi',
    'wadgaon': 'wadgaon sheri', 'wagholi': 'wagholi',
    'nigdi': 'nigdi', 'nigdee': 'nigdi',
    'pune station': 'pune railway station', 'pune railwy': 'pune railway station',
};

/**
 * Try to correct common spelling mistakes in the query
 */
function correctSpelling(query) {
    const lower = query.toLowerCase().trim();
    // Direct match
    if (PUNE_SPELLING_MAP[lower]) return PUNE_SPELLING_MAP[lower];
    // Partial match — fix the misspelled word
    const words = lower.split(/\s+/);
    const corrected = words.map(w => PUNE_SPELLING_MAP[w] || w);
    return corrected.join(' ');
}

/**
 * Core Nominatim fetch helper
 */
async function fetchNominatim(queryStr, extraParams = {}) {
    const params = new URLSearchParams({
        q: queryStr,
        format: 'json',
        addressdetails: 1,
        limit: 6,
        countrycodes: 'in',
        ...extraParams,
    });

    const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
        headers: {
            'Accept-Language': 'en',
            'User-Agent': 'ApghatDarshak-SafeRouting/1.0',
        },
    });

    if (!response.ok) throw new Error('Nominatim search failed');
    return response.json();
}

/**
 * Search for locations by text query — with typo tolerance & fuzzy fallback
 * Returns array of suggestions with display name + coordinates
 */
export async function searchLocations(query) {
    if (!query || query.trim().length < 3) return [];

    const formatResults = (data) =>
        data.map((item) => ({
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            placeId: item.place_id,
        }));

    // Pass 1: Try exact query as typed
    let data = await fetchNominatim(query);
    if (data.length > 0) return formatResults(data);

    // Pass 2: Try spelling-corrected query
    const corrected = correctSpelling(query);
    if (corrected !== query.toLowerCase().trim()) {
        data = await fetchNominatim(corrected);
        if (data.length > 0) return formatResults(data);
    }

    // Pass 3: Append "Pune" to anchor the search geographically
    const withCity = `${query} Pune`;
    data = await fetchNominatim(withCity);
    if (data.length > 0) return formatResults(data);

    // Pass 4: Corrected + city fallback
    if (corrected !== query.toLowerCase().trim()) {
        data = await fetchNominatim(`${corrected} Pune`);
        if (data.length > 0) return formatResults(data);
    }

    return [];
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
            'User-Agent': 'ApghatDarshak-SafeRouting/1.0',
        },
    });

    if (!response.ok) throw new Error('Reverse geocode failed');

    const data = await response.json();
    return data.display_name || `${lat}, ${lng}`;
}
