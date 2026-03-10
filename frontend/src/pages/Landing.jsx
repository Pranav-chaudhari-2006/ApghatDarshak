import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

const Landing = () => {
    const navigate = useNavigate();
    const globeEl = useRef(null);
    const [dimensions, setDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800
    });
    const [blackout, setBlackout] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!globeEl.current) return;

        const globe = globeEl.current;
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 1.0;
        globe.controls().enableZoom = false;

        // Pull the camera back so we can see the planets and the incoming asteroid
        globe.pointOfView({ altitude: 4.5 }, 0);

        const scene = globe.scene();

        // 0. Add Lighting for realism
        const sunLight = new THREE.PointLight(0xffffff, 2, 0, 0);
        sunLight.position.set(0, 0, 0); // Sun is at center (virtual)
        scene.add(sunLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // soft white light
        scene.add(ambientLight);

        // 1. Create Planets
        const planetsGroup = new THREE.Group();
        const loader = new THREE.TextureLoader();

        // 45 Procedurally generated planets with various sizes, distances, and orbital tilts
        const planetData = [];
        const textures = [
            '//unpkg.com/three-globe/example/img/earth-topology.png',
            '//unpkg.com/three-globe/example/img/earth-clouds.png',
            '//unpkg.com/three-globe/example/img/earth-day.jpg',
            '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
            '//unpkg.com/three-globe/example/img/earth-dark.jpg'
        ];
        const colors = [0x9e9e9e, 0xf4a460, 0xcd5c5c, 0xdeb887, 0xf5f5f5, 0xdaa520, 0x87ceeb, 0x4682b4, 0xbc8f8f, 0xaaffaa, 0x9370db, 0xff69b4];
        
        for (let i = 0; i < 8; i++) {
            planetData.push({
                name: `P${i}`,
                r: 4.5 + Math.random() * 5.0, // Much larger planets
                dist: 180 + Math.random() * 600, // Kept relatively close but spread out
                speed: 0.004 + Math.random() * 0.008, // Smooth planetary drift
                color: colors[Math.floor(Math.random() * colors.length)],
                tex: textures[Math.floor(Math.random() * textures.length)],
                hasRings: Math.random() > 0.7,
                orbitTiltX: (Math.random() - 0.5) * 0.4, // Slight tilt for proper 3D without chaos
                orbitTiltZ: (Math.random() - 0.5) * 0.4,
            });
        }

        const planetMeshes = planetData.map(p => {
            const geo = new THREE.SphereGeometry(p.r, 32, 32);
            const mat = new THREE.MeshStandardMaterial({
                color: p.color,
                map: loader.load(p.tex),
                roughness: 0.2,
                metalness: 0.2,
                flatShading: false
            });

            const mesh = new THREE.Mesh(geo, mat);

            if (p.hasRings) {
                const ringGeo = new THREE.RingGeometry(p.r * 1.5, p.r * 2.8, 64);
                const ringMat = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.2
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.rotation.x = Math.PI / 2.5;
                mesh.add(ring);
            }

            // Pivot for tilted orbits
            const pivot = new THREE.Group();
            pivot.rotation.x = p.orbitTiltX;
            pivot.rotation.z = p.orbitTiltZ;
            
            mesh.position.x = p.dist;
            pivot.add(mesh);
            planetsGroup.add(pivot);

            return { pivot, mesh, ...p, angle: Math.random() * Math.PI * 2 };
        });

        scene.add(planetsGroup);

        // 2. Create Realistic Stone (Asteroid)
        const asteroidRadius = 12; // Smaller, dense rock
        const asteroidGeo = new THREE.IcosahedronGeometry(asteroidRadius, 3);
        const posAttr = asteroidGeo.attributes.position;
        const vertex = new THREE.Vector3();
        for (let i = 0; i < posAttr.count; i++) {
            vertex.fromBufferAttribute(posAttr, i);
            vertex.multiplyScalar(0.7 + Math.random() * 0.6);
            posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        asteroidGeo.computeVertexNormals();

        const asteroidMat = new THREE.MeshStandardMaterial({
            color: 0x332211,
            roughness: 0.9,
            metalness: 0.2,
            flatShading: true,
            emissive: 0xff3300, // Subtle red glow from heat
            emissiveIntensity: 0.2
        });
        const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
        scene.add(asteroid);

        // Core Fire Light casting from Asteroid
        const asteroidLight = new THREE.PointLight(0xff4400, 600000, 3000);
        asteroid.add(asteroidLight);

        // Dramatic Fast Trail Effect
        const trailGroup = new THREE.Group();
        scene.add(trailGroup);
        const trailParticles = [];
        const TRAIL_COUNT = 80; // Denser fire trail
        for (let i = 0; i < TRAIL_COUNT; i++) {
            const partGeo = new THREE.SphereGeometry(Math.random() * 4 + 1.5, 6, 6);
            // Ultra-hot gradient: white/yellow -> bright orange -> deep crimson
            const partColor = i < 15 ? 0xffffff : (i < 40 ? 0xffaa00 : (i < 65 ? 0xff4400 : 0xaa0000));
            const pMat = new THREE.MeshBasicMaterial({
                color: partColor,
                transparent: true,
                opacity: Math.random() * 0.5 + 0.5,
                blending: THREE.AdditiveBlending, // Intense glowing fire mode
                depthWrite: false
            });
            const part = new THREE.Mesh(partGeo, pMat);
            trailGroup.add(part);
            trailParticles.push(part);
        }

        let reqId;
        const startTime = Date.now();
        const ASTEROID_DELAY = 3500; // 3.5s delay
        const ASTEROID_IMPACT_TIME = 7000; // Realistically slower diagonal sweep
        const START_POS = new THREE.Vector3(-1800, 1800, 600); // High top-left
        const END_POS = new THREE.Vector3(0, 0, 0); // Origin (Earth)

        // Position completely out of view initially
        asteroid.position.copy(START_POS);

        const animate = () => {
            const now = Date.now();
            const totalElapsed = now - startTime;

            planetMeshes.forEach(p => {
                p.angle += p.speed;
                // Pure rotational orbit via pivot group
                p.pivot.rotation.y = p.angle;
                // Local spin of the planet body
                p.mesh.rotation.y += 0.02;
                p.mesh.rotation.x += 0.01;
            });

            if (totalElapsed < ASTEROID_DELAY) {
                reqId = requestAnimationFrame(animate);
                return;
            }

            const elapsed = totalElapsed - ASTEROID_DELAY;

            if (elapsed < ASTEROID_IMPACT_TIME) {
                const progress = elapsed / ASTEROID_IMPACT_TIME;
                const currentPos = new THREE.Vector3().lerpVectors(START_POS, END_POS, progress);
                asteroid.position.copy(currentPos);
                asteroid.rotation.x += 0.08;
                asteroid.rotation.y += 0.1;

                // Dramatic Turbulent Trail
                trailParticles.forEach((p, idx) => {
                    const delay = idx * 0.0008;
                    const tProgress = Math.max(0, progress - delay);
                    const pPos = new THREE.Vector3().lerpVectors(START_POS, END_POS, tProgress);

                    // Jitter for heat turbulence effect scaling by tail position
                    const jitter = (1 - tProgress) * 25;
                    pPos.x += (Math.random() - 0.5) * jitter;
                    pPos.y += (Math.random() - 0.5) * jitter;
                    pPos.z += (Math.random() - 0.5) * jitter;

                    p.position.copy(pPos);
                    const scaleFactor = (1 - (idx / TRAIL_COUNT));
                    p.scale.setScalar(scaleFactor);
                    p.material.opacity = scaleFactor * 0.9;
                });

                reqId = requestAnimationFrame(animate);
            } else {
                setBlackout(true);
                setTimeout(() => navigate('/dashboard'), 800);
            }
        };

        animate();

        return () => {
            if (reqId) cancelAnimationFrame(reqId);
            scene.remove(planetsGroup);
            scene.remove(asteroid);
            scene.remove(trailGroup); // Cleanup trail
            scene.remove(sunLight);
            scene.remove(ambientLight);

            // Dispose geometries and materials
            planetMeshes.forEach(p => {
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                p.mesh.children.forEach(c => {
                    if (c.geometry) c.geometry.dispose();
                    if (c.material) c.material.dispose();
                });
            });
            asteroidGeo.dispose();
            asteroidMat.dispose();
            trailParticles.forEach(p => {
                p.geometry.dispose();
                p.material.dispose();
            });
        };
    }, [navigate]);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center font-sans">

            {/* Background Layer with opacity switch on blackout */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${blackout ? 'opacity-0' : 'opacity-100'}`}>
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

            {/* UI Overlay */}
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent pointer-events-none transition-opacity duration-300 ${blackout ? 'opacity-0' : 'opacity-100'}`}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="flex flex-col items-center pointer-events-auto mt-20"
                >
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] mb-4 text-center">
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 [text-shadow:0_4px_30px_rgba(59,130,246,0.3)]">
                            Apghat Darshak
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-blue-100/70 font-light tracking-wide max-w-lg mx-auto mb-12 drop-shadow-md text-center">
                        Mapping Danger, Ensuring Safety
                    </p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2, duration: 1 }}
                        className="text-red-500 animate-pulse tracking-widest text-sm font-black border border-red-500/50 bg-red-500/10 px-6 py-2 rounded-full uppercase"
                    >
                        Incoming Impact Detected
                    </motion.div>
                </motion.div>
            </div>

            {/* Impact Flash & Blackout Sequence */}
            <AnimatePresence>
                {blackout && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="absolute inset-0 z-100 bg-black flex items-center justify-center pointer-events-none"
                    >
                        {/* Huge white flash that expands and fades out */}
                        <motion.div
                            initial={{ opacity: 1, scale: 0.5 }}
                            animate={{ opacity: 0, scale: 5 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="bg-white rounded-full w-96 h-96 blur-3xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Landing;
