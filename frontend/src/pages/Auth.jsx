import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import useAuthStore from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="relative inline-block w-full" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1 bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap z-50 pointer-events-none shadow-2xl"
                    >
                        {text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Auth = () => {
    const navigate = useNavigate();
    const globeEl = useRef(null);
    const { setUser, setLoading, isLoading } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [dimensions, setDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800
    });
    const [isForgot, setIsForgot] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!globeEl.current) return;
        const globe = globeEl.current;
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.8;
        globe.controls().enableZoom = false;
        globe.pointOfView({ altitude: 4.0 }, 0);

        const scene = globe.scene();
        
        // Lighting
        // Lighting - High intensity to make planets pop
        const sunLight = new THREE.PointLight(0xffffff, 3.5, 0, 0);
        sunLight.position.set(0, 0, 0);
        scene.add(sunLight);
        
        const secondaryLight = new THREE.PointLight(0x4488ff, 2, 0, 0);
        secondaryLight.position.set(500, 200, 500);
        scene.add(secondaryLight);

        scene.add(new THREE.AmbientLight(0x404040, 0.8));

        // Create secondary planets and drifting asteroids
        const group = new THREE.Group();
        const loader = new THREE.TextureLoader();
        
        const planetConfigs = [
            { map: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg', color: 0xffffff, roughness: 0.9, metalness: 0.0, emissive: 0x000000 },
            { map: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mars_1k_color.jpg', color: 0xffaa88, roughness: 0.8, metalness: 0.2, emissive: 0x000000 },
            { map: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/jupiter.jpg', color: 0xffffff, roughness: 0.4, metalness: 0.1, emissive: 0x000000 },
            { map: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/venus_surface_2048.jpg', color: 0xffddaa, roughness: 0.6, metalness: 0.1, emissive: 0x000000 },
            { map: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg', color: 0xffffff, roughness: 0.6, metalness: 0.3, emissive: 0x000000 },
            { map: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg', color: 0x88ffaa, roughness: 0.9, metalness: 0.4, emissive: 0x002200 },
            { map: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/jupiter.jpg', color: 0x88ccff, roughness: 0.2, metalness: 0.5, emissive: 0x001133 },
            { map: '//unpkg.com/three-globe/example/img/earth-dark.jpg', color: 0xff5522, roughness: 0.8, metalness: 0.3, emissive: 0x330000 },
        ];

        const objects = planetConfigs.map((cfg, i) => {
            const r = 8 + Math.random() * 12; // Much larger planets
            const dist = 120 + (i * 35) + Math.random() * 20; // Brought slightly closer
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(r, 64, 64),
                new THREE.MeshStandardMaterial({ 
                    map: loader.load(cfg.map), 
                    color: cfg.color,
                    roughness: cfg.roughness,
                    metalness: cfg.metalness,
                    emissive: cfg.emissive,
                    emissiveIntensity: 0.5
                })
            );
            
            const pivot = new THREE.Group();
            pivot.rotation.x = (Math.random() - 0.5) * 0.5;
            pivot.rotation.z = (Math.random() - 0.5) * 0.5;
            
            mesh.position.x = dist;
            pivot.add(mesh);
            group.add(pivot);
            
            return { 
                pivot, 
                mesh,
                speed: 0.001 + Math.random() * 0.003, 
                angle: Math.random() * Math.PI * 2 
            };
        });

        // Add drifting asteroid rocks with heat glow
        for (let i = 0; i < 40; i++) {
            const rockRadius = Math.random() * 2 + 0.8;
            const rock = new THREE.Mesh(
                new THREE.IcosahedronGeometry(rockRadius, 1),
                new THREE.MeshStandardMaterial({ 
                    color: 0x332211, 
                    roughness: 0.9, 
                    flatShading: true,
                    emissive: 0xff3300,
                    emissiveIntensity: Math.random() * 0.4
                })
            );
            rock.position.set(
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 1000
            );
            rock.userData = { 
                rot: new THREE.Vector3(Math.random()*0.02, Math.random()*0.02, Math.random()*0.02),
                drift: new THREE.Vector3((Math.random()-0.5)*0.15, (Math.random()-0.5)*0.15, (Math.random()-0.5)*0.15)
            };
            group.add(rock);
        }

        scene.add(group);

        let reqId;
        const animate = () => {
            objects.forEach(o => {
                o.angle += o.speed;
                o.pivot.rotation.y = o.angle;
                o.mesh.rotation.y += 0.01;
            });
            group.children.forEach(c => {
                if (c.userData.rot) {
                    c.rotation.x += c.userData.rot.x;
                    c.rotation.y += c.userData.rot.y;
                    c.position.add(c.userData.drift);
                    // Wrap asteroids
                    if (Math.abs(c.position.x) > 500) c.position.x *= -0.99;
                    if (Math.abs(c.position.y) > 500) c.position.y *= -0.99;
                    if (Math.abs(c.position.z) > 500) c.position.z *= -0.99;
                }
            });
            reqId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            if (reqId) cancelAnimationFrame(reqId);
            scene.remove(group);
            scene.remove(sunLight);
        };
    }, []);

    // Listen for auth state changes (handles both email login and OAuth redirect)
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const user = session.user;
                setUser({
                    ...user,
                    id: user.id,
                    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
                    email: user.email,
                    avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
                });
                navigate('/dashboard', { replace: true });
            }
        });
        return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/auth',
                    queryParams: {
                        prompt: 'select_account',
                        access_type: 'offline'
                    }
                }
            });
            if (error) throw error;
        } catch (err) {
            console.error('Google login error:', err);
            setError('Failed to initialize Google login. Please try again.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isForgot) {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
                    redirectTo: window.location.origin + '/settings',
                });
                if (resetError) throw resetError;
                setError({ text: 'Recovery link sent! Check your inbox.', type: 'success' });
                return;
            }

            if (isLogin) {
                const { error: loginError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (loginError) throw loginError;
            } else {
                const { error: signupError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.name,
                        }
                    }
                });
                if (signupError) throw signupError;
                setError({ text: 'Access granted! Verification email dispatched.', type: 'success' });
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden font-['Inter',sans-serif]">
            
            {/* 3D Space Background */}
            <div className="absolute inset-0 z-0">
                <Globe
                    ref={globeEl}
                    width={dimensions.width}
                    height={dimensions.height}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                    backgroundColor="rgba(0,0,0,1)"
                    animateIn={false}
                    showAtmosphere={true}
                    atmosphereColor="#3b82f6"
                    atmosphereAltitude={0.15}
                />
            </div>

            {/* Minimal Overlay for high visibility */}
            <div className="absolute inset-0 z-1 bg-black/30" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md bg-slate-950/80 backdrop-blur-2xl border border-white/5 rounded-[40px] p-8 lg:p-10 relative z-10 shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
            >
                <div className="flex flex-col items-center mb-6 lg:mb-8 text-center">
                    <div className="w-14 h-14 bg-linear-to-tr from-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-4 border border-white/10">
                        <Shield className="text-white" size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase font-outfit">
                        {isForgot ? 'Reset Password' : isLogin ? 'Sign In' : 'Create Account'}
                    </h2>
                    <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-bold">
                        {isForgot ? 'Update your security' : isLogin ? 'Welcome back to ApghatDarshak' : 'Set up your safety profile'}
                    </p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`${error.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'} p-3.5 rounded-2xl flex items-center gap-3 mb-5 border`}
                    >
                        <AlertCircle size={16} />
                        <p className="text-[10px] font-bold uppercase tracking-wide">{typeof error === 'string' ? error : error.text}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {!isLogin && !isForgot && (
                            <motion.div 
                                key="signup-field"
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="space-y-1.5 overflow-hidden"
                            >
                                <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-widest leading-none mb-1 block">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Full Name"
                                        className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 transition-all font-outfit text-sm"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-widest leading-none mb-1 block">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input 
                                type="email" 
                                required
                                placeholder="name@example.com"
                                className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-outfit"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    {!isForgot && (
                        <div className="space-y-1">
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-widest leading-none block">Password</label>
                                {isLogin && (
                                    <button 
                                        type="button"
                                        onClick={() => setIsForgot(true)}
                                        className="text-[10px] text-blue-500 hover:text-blue-400 font-bold uppercase tracking-wider transition-colors"
                                    >
                                        Forgot?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <input 
                                    type="password" 
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-outfit"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    <Tooltip text={isForgot ? 'Reset' : isLogin ? 'Login' : 'Create'}>
                        <button 
                            disabled={isLoading}
                            className="w-full bg-linear-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3 group transition-all duration-300 disabled:opacity-50 mt-4 uppercase tracking-widest text-xs font-outfit"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    {isForgot ? 'Send Link' : isLogin ? 'Enter App' : 'Create Account'}
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </Tooltip>
                    
                    {isForgot && (
                        <button 
                            type="button"
                            onClick={() => setIsForgot(false)}
                            className="w-full text-[10px] text-slate-500 hover:text-white font-black uppercase tracking-[0.2em] transition-colors py-2"
                        >
                            Cancel
                        </button>
                    )}
                </form>

                <div className="relative my-7">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-[#020617] px-4 text-slate-600 font-bold tracking-[0.2em]">Alternatively</span>
                    </div>
                </div>

                <div className="w-full">
                    <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-950 py-4 rounded-2xl transition-all font-black shadow-2xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 uppercase tracking-widest text-[11px] font-outfit"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue via Data Sync
                    </button>
                </div>

                <p className="text-center text-slate-500 text-[11px] mt-6 font-bold uppercase tracking-widest">
                    {isLogin ? "No Access?" : "Existing operative?"}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setIsForgot(false); }}
                        className="ml-2 text-blue-500 hover:text-blue-400 font-black"
                    >
                        {isLogin ? 'Initialize' : 'Authorize'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default Auth;
