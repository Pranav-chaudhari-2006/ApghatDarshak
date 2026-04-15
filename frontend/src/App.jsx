import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import useAuthStore from './store/useAuthStore';
import { supabase } from './lib/supabase';

/** Helper: derive a clean user object from a Supabase user */
const buildUser = (u) => ({
    ...u,
    id: u.id,
    name: u.user_metadata?.full_name || u.user_metadata?.name || u.email.split('@')[0],
    email: u.email,
    avatar_url: u.user_metadata?.avatar_url
        || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email)}`,
});

/**
 * ProtectedRoute — blocks unauthenticated access.
 *
 * Security:
 *   • Always waits for `isInitialized` (i.e. getSession() resolved) before
 *     making any routing decision. Shows a full-screen spinner in the interim.
 *   • Uses `replace` so the browser back-button cannot return to a protected
 *     page after the user has been redirected to /auth.
 */
const ProtectedRoute = ({ children }) => {
    const { user, isInitialized } = useAuthStore();
    if (!isInitialized) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-10 h-10 border-t-2 border-emerald-500 rounded-full animate-spin" />
        </div>
    );
    if (!user) return <Navigate to="/auth" replace />;
    return children;
};

/**
 * PublicRoute — blocks authenticated users from auth pages.
 *
 * Uses `replace` so pressing browser back after login will NOT return to /auth.
 */
const PublicRoute = ({ children }) => {
    const { user, isInitialized } = useAuthStore();
    if (!isInitialized) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-10 h-10 border-t-2 border-emerald-500 rounded-full animate-spin" />
        </div>
    );
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
};

function App() {
    const { setUser, setInitialized, isInitialized } = useAuthStore();

    React.useEffect(() => {
        /**
         * STEP 1: Verify the REAL Supabase session immediately on startup.
         *
         * Security note: We never trust our own in-memory store until Supabase
         * has confirmed a valid server-side session. `isInitialized` is false
         * until this resolves, so the Router (and its children) are not rendered
         * at all during the verification window.
         */
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                // Null session → clear any potential stale state
                setUser(session?.user ? buildUser(session.user) : null);
            } catch (e) {
                console.error('Session check failed:', e);
                setUser(null);
            } finally {
                setInitialized(true);
            }
        };

        checkSession();

        /**
         * STEP 2: Subscribe to ALL downstream auth events.
         *
         * This handles:
         *   • Email/password login confirmation
         *   • Google OAuth callback redirect
         *   • Token refresh (keeps long-lived sessions alive)
         *   • SIGNED_OUT — explicitly clears user on logout/expiry
         *   • USER_DELETED — clears user
         */
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`🔐 Auth event: ${event}`);

            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                setUser(null);
            } else if (session?.user) {
                setUser(buildUser(session.user));
            } else {
                // TOKEN_REFRESH_FAILED, PASSWORD_RECOVERY, etc.
                setUser(null);
            }

            setInitialized(true);
        });

        return () => subscription.unsubscribe();
    }, [setUser, setInitialized]);

    /**
     * Block ALL routing until the real auth state is confirmed from Supabase.
     * This is a hard security gate — no route renders until isInitialized=true.
     */
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-emerald-500/20 rounded-full animate-ping absolute" />
                    <div className="w-20 h-20 border-t-4 border-emerald-500 rounded-full animate-spin" />
                </div>
                <div className="text-center">
                    <h1 className="text-white font-black uppercase tracking-[0.4em] text-sm animate-pulse">
                        ApghatDarshak
                    </h1>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-2 font-bold">
                        Verifying Session…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Landing — always accessible */}
                <Route path="/" element={<Landing />} />

                {/* Auth — only for unauthenticated users */}
                <Route path="/auth" element={
                    <PublicRoute>
                        <Auth />
                    </PublicRoute>
                } />

                {/* Dashboard — only for authenticated users */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                {/* Settings — only for authenticated users */}
                <Route path="/settings" element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                } />

                {/* Catch-all → send to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
