/**
 * ApghatDarshak — Frontend Environment Config
 *
 * All VITE_ environment variables are read here in one place.
 * Routing is now handled by our backend A* engine — ORS is no longer used.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.DEV && !API_BASE_URL) {
    console.error('❌ VITE_API_BASE_URL is not set. Check your frontend/.env file.');
}

export { API_BASE_URL };
