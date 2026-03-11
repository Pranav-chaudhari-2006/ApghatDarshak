import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth Store — persisted to localStorage so user stays logged in on refresh.
 *
 * user: { id, name, email, phone, avatarUrl } | null
 */
const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            isInitialized: false,

            setUser: (user) => set({ user }),
            setLoading: (isLoading) => set({ isLoading }),
            setInitialized: (isInitialized) => set({ isInitialized }),

            logout: () => set({ user: null }),

            isLoggedIn: () => get().user !== null,
        }),
        {
            name: 'apghat-darshak-auth',
            partialize: (state) => ({ user: state.user }),
        }
    )
);

export default useAuthStore;
