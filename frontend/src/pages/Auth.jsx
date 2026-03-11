import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, ArrowRight, Github, Chrome, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import useAuthStore from '../store/useAuthStore';

const Auth = () => {
    const navigate = useNavigate();
    const globeEl = useRef(null);
    const { setUser, setLoading, isLoading } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [dimensions, setDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800
    });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Mocking authentication for now
            // In a real app, you would call your backend here
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const mockUser = {
                id: 1,
                name: formData.name || 'Aarav Sharma',
                email: formData.email,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`
            };

            setUser(mockUser);
            navigate('/dashboard');
        } catch (err) {
            setError('Authentication failed. Please check your credentials.');
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
                />
            </div>

            {/* Minimal Overlay for high visibility */}
            <div className="absolute inset-0 z-1 bg-black/30" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                        <Shield className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Join ApghatDarshak'}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {isLogin ? 'Enter your details to access safe routing' : 'Sign up to start your journey with us'}
                    </p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 mb-6"
                    >
                        <AlertCircle className="text-red-500 shrink-0" size={18} />
                        <p className="text-red-500 text-sm font-medium">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div 
                                key="signup-field"
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="space-y-1.5 overflow-hidden"
                            >
                                <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Enter your name"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-outfit"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="email" 
                                required
                                placeholder="name@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="password" 
                                required
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        disabled={isLoading}
                        className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group transition-all duration-300 disabled:opacity-50 mt-6"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-4 text-slate-500 font-bold tracking-widest">Or continue with</span>
                    </div>
                </div>

                <div className="w-full">
                    <button className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 py-4 rounded-2xl transition-all font-bold shadow-xl hover:scale-[1.02] active:scale-95">
                        <Chrome size={20} />
                        <span className="text-sm">Sign in with Google</span>
                    </button>
                </div>

                <p className="text-center text-slate-400 text-sm mt-8">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-1.5 text-blue-500 font-bold hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default Auth;
