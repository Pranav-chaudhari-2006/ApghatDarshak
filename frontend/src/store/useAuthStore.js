import { create } from 'zustand';

/**
 * Auth Store — NO localStorage persistence for the user object.
 *
 * Security rationale:
 *   Supabase already persists its own JWT session in localStorage under
 *   'sb-<project>-auth-token'. Our store only holds a derived in-memory
 *   snapshot of the logged-in user.
 *
 *   By NOT persisting user here we guarantee:
 *     • Back-button cannot bypass auth — on every cold load the store
 *       starts with user=null and isInitialized=false. App.jsx calls
 *       supabase.auth.getSession() which verifies the real session server-side.
 *     • A stale/tampered localStorage value can never grant dashboard access.
 *     • Logout is immediate — clearing the store is sufficient.
 */
const useAuthStore = create((set, get) => ({
    user: null,
    isLoading: false,
    isInitialized: false,

    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    setInitialized: (isInitialized) => set({ isInitialized }),

    logout: () => set({ user: null, isInitialized: true }),

    isLoggedIn: () => get().user !== null,
}));

export default useAuthStore;
