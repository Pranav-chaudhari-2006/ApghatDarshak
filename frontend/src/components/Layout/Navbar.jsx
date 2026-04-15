import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Moon, Sun, AlertCircle, Cpu, Radio, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';

const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="relative" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 15, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-slate-800 border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap z-50 pointer-events-none"
                    >
                        {text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut(); // This triggers SIGNED_OUT in App.jsx's onAuthStateChange
            logout();
            navigate('/auth', { replace: true }); // replace removes dashboard from history stack
        } catch (error) {
            console.error('Error signing out:', error);
            logout();
            navigate('/auth', { replace: true });
        }
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 h-20 px-8 flex items-center justify-between z-2000 transition-all duration-500 pointer-events-none ${scrolled ? 'backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-2xl pointer-events-auto' : 'bg-transparent'
                }`}
        >
            {/* Spacer for Sidebar to avoid overlap */}
            <div className="w-[360px] hidden md:block" />

            {/* Dynamic Status Dashboard */}
            <div className="hidden lg:flex items-center gap-10 px-8 py-2 rounded-[24px] bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 pointer-events-auto">
                <Tooltip text="Engine Status">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                            <Cpu size={14} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Engine</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">A* Active</p>
                        </div>
                    </div>
                </Tooltip>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

                <Tooltip text="Database">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                            <Radio size={14} className="text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Supabase</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">Healthy</p>
                        </div>
                    </div>
                </Tooltip>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

                <Tooltip text="Coverage">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                            <AlertCircle size={14} className="text-rose-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">District</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">Pune</p>
                        </div>
                    </div>
                </Tooltip>
            </div>

            {/* Profile Action Group */}
            <div className="flex items-center gap-4 pointer-events-auto relative">
                {user && (
                    <div className="flex items-center gap-3 relative">
                        <button 
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/20 shadow-sm bg-slate-800 flex items-center justify-center">
                                {(user?.user_metadata?.avatar_url || user?.avatar_url) ? (
                                    <img 
                                        src={user.user_metadata?.avatar_url || user.avatar_url} 
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Shield size={14} className="text-blue-500" />
                                )}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                                    {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.name || 'Operative'}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium leading-none mt-1 uppercase tracking-tight">Verified User</p>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute top-14 right-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-2100"
                                >
                                    <button 
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            navigate('/settings');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <Shield size={16} />
                                        </div>
                                        Security Settings
                                    </button>

                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />

                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all font-bold text-xs uppercase tracking-wider"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                                            <LogOut size={16} />
                                        </div>
                                        Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.nav>
    );
};

export default Navbar;
