import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import ForceGraph3D from 'react-force-graph-3d';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, ArrowRight, LocateFixed } from 'lucide-react';

// Supported cities (expandable later)
const CITIES = [
    { id: 'pune', label: 'Pune', subtitle: 'Maharashtra, India' }
];

/**
 * Build the N-ary tree structure from blackspot data.
 * Root → [HIGH RISK, MEDIUM RISK, LOW RISK] → leaf blackspot nodes
 */
function buildTreeData(blackspots, cityLabel) {
    const makeName = (b) => {
        const loc = b.area || b.roadName;
        if (!loc) return 'Unknown Area';
        return loc.length > 20 ? loc.slice(0, 18) + '…' : loc;
    };

    // Deduplicate and aggregate blackspots by their processed name to prevent repeated UI nodes
    const uniqueMap = new Map();
    (blackspots || []).forEach(b => {
        const name = makeName(b);
        if (!uniqueMap.has(name)) {
            uniqueMap.set(name, { ...b, originalId: b.id });
        } else {
            const existing = uniqueMap.get(name);
            existing.fatal = (existing.fatal || 0) + (b.fatal || 0);
            existing.major = (existing.major || 0) + (b.major || 0);
            existing.minor = (existing.minor || 0) + (b.minor || 0);
            existing.risk = (existing.risk || 0) + (b.risk || 0);
        }
    });

    const aggregatedBlackspots = Array.from(uniqueMap.values());
    const sorted = aggregatedBlackspots.sort((a, b) => (b.risk || 0) - (a.risk || 0));

    // Categorise by severity
    const high   = sorted.filter(b => b.fatal > 0);
    const medium = sorted.filter(b => b.fatal === 0 && b.major > 0);
    const low    = sorted.filter(b => b.fatal === 0 && b.major === 0);

    return {
        label: cityLabel.toUpperCase(),
        color: '#10B981',
        id: 'root',
        val: 9,
        children: [
            {
                id: 'cat_high',
                label: 'HIGH RISK',
                color: '#F43F5E',
                val: 6,
                leaves: high.length > 0
                    ? high.map((b, i) => ({ id: `high_${b.id || i}`, label: makeName(b), fatal: b.fatal, major: b.major, minor: b.minor, risk: b.risk, color: '#FB7185', val: 3 }))
                    : [{ id: 'high_none', label: 'No Fatal Zones', fatal: 0, major: 0, minor: 0, risk: 0, color: '#FB7185', val: 3 }]
            },
            {
                id: 'cat_med',
                label: 'MEDIUM RISK',
                color: '#F59E0B',
                val: 6,
                leaves: medium.length > 0
                    ? medium.map((b, i) => ({ id: `med_${b.id || i}`, label: makeName(b), fatal: b.fatal, major: b.major, minor: b.minor, risk: b.risk, color: '#FCD34D', val: 3 }))
                    : [{ id: 'med_none', label: 'No Major Alerts', fatal: 0, major: 0, minor: 0, risk: 0, color: '#FCD34D', val: 3 }]
            },
            {
                id: 'cat_low',
                label: 'LOW RISK',
                color: '#22C55E',
                val: 6,
                leaves: low.length > 0
                    ? low.map((b, i) => ({ id: `low_${b.id || i}`, label: makeName(b), fatal: b.fatal, major: b.major, minor: b.minor, risk: b.risk, color: '#86EFAC', val: 3 }))
                    : [{ id: 'low_none', label: 'No Minor Risks', fatal: 0, major: 0, minor: 0, risk: 0, color: '#86EFAC', val: 3 }]
            }
        ]
    };
}

const createTextSprite = (message, colorHex, scaleFactor = 1) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '900 38px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colorHex;
    
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText(message.toUpperCase(), canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(40 * scaleFactor, 10 * scaleFactor, 1);
    return sprite;
};

/**
 * ForceGraph3D renderer wrapped in a responsive container
 */
function TreeCanvas({ treeData }) {
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const graphRef = useRef();

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Flatten treeData into nodes and links for ForceGraph
    const graphData = useMemo(() => {
        const nodes = [];
        const links = [];

        // 1. Add Root
        nodes.push({
            id: treeData.id,
            name: treeData.label,
            color: treeData.color,
            val: treeData.val,
            isRoot: true,
            info: 'Central Divisional Node'
        });

        // 2. Add Categories and Leaves
        treeData.children.forEach(cat => {
            nodes.push({
                id: cat.id,
                name: cat.label,
                color: cat.color,
                val: cat.val,
                isCategory: true,
                info: `Category Node`
            });
            links.push({
                source: treeData.id,
                target: cat.id,
                color: cat.color
            });

            if (cat.leaves && Array.isArray(cat.leaves)) {
                cat.leaves.forEach(leaf => {
                    nodes.push({
                        id: leaf.id,
                        name: leaf.label,
                        color: leaf.color,
                        val: leaf.val,
                        isLeaf: true,
                        info: `Risk Score: ${leaf.risk} | F:${leaf.fatal} M:${leaf.major} m:${leaf.minor}`
                    });
                    links.push({
                        source: cat.id,
                        target: leaf.id,
                        color: leaf.color
                    });
                });
            }
        });

        // Ensure unique nodes by ID to prevent ForceGraph crash
        const uniqueNodesConfig = Array.from(new Map(nodes.map(n => [n.id, n])).values());
        
        return { nodes: uniqueNodesConfig, links };
    }, [treeData]);

    const handleNodeClick = (node) => {
        if (!graphRef.current) return;
        const distance = 80;
        const distRatio = 1 + distance / Math.max(Math.hypot(node.x, node.y, node.z), 1);

        graphRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
            node, 
            2000 // ms transition duration
        );
    };

    const handleRecenter = () => {
        if (!graphRef.current) return;
        graphRef.current.cameraPosition(
            { x: 0, y: 0, z: 400 }, 
            { x: 0, y: 0, z: 0 }, 
            2000
        );
    };

    return (
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing font-outfit relative">
            <button 
                onClick={handleRecenter}
                className="absolute bottom-6 right-6 z-50 bg-slate-900/80 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 text-white p-3 rounded-xl shadow-xl backdrop-blur-md transition-all group"
                title="Recenter Tree"
            >
                <LocateFixed size={20} className="text-slate-400 group-hover:text-emerald-400" />
            </button>
            {dimensions.width > 0 && (
                <ForceGraph3D
                    ref={graphRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    dagMode="td"
                    dagLevelDistance={80}
                    nodeRelSize={4}
                    nodeColor="color"
                    linkColor="color"
                    linkOpacity={0.4}
                    linkWidth={1.5}
                    backgroundColor="#020202"
                    nodeThreeObjectExtend={true}
                    nodeThreeObject={node => {
                        const sprite = createTextSprite(node.name, node.color, 0.4);
                        sprite.position.y = -6; // offset slightly below
                        return sprite;
                    }}
                    nodeLabel={node => `
                        <div style="background: rgba(15,23,42,0.9); border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 8px; font-family: 'Outfit', sans-serif;">
                            <strong style="color: ${node.color}; display: block; margin-bottom: 4px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">${node.name}</strong>
                            <span style="color: #fff; font-size: 11px;">${node.info}</span>
                            <span style="color: #64748b; font-size: 9px; display: block; margin-top: 4px;">Click to focus</span>
                        </div>
                    `}
                    onNodeClick={handleNodeClick}
                    onNodeDragEnd={node => {
                        node.fx = node.x;
                        node.fy = node.y;
                        node.fz = node.z;
                    }}
                />
            )}
        </div>
    );
}

/**
 * Main ZoneTree3D component.
 * Shows city selection first, then renders the 3D N-ary tree.
 */
const ZoneTree3D = ({ blackspots: initialBlackspots = [] }) => {
    const [step, setStep]       = useState('select'); // 'select' | 'tree'
    const [city, setCity]       = useState(null);
    const [dropOpen, setDropOpen] = useState(false);
    const [allBlackspots, setAllBlackspots] = useState(initialBlackspots);

    useEffect(() => {
        // Fetch ALL blackspots in the city, ensuring the N-ary tree shows everything,
        // rather than just the subset that happen to be along the user's computed route.
        fetch('http://localhost:5000/api/blackspots')
            .then(res => res.json())
            .then(data => {
                // Determine format of blackspots response
                const spots = data.blackspots || data || [];
                if (spots.length > 0) {
                    setAllBlackspots(spots);
                }
            })
            .catch(err => console.error("Failed to fetch full city blackspots", err));
    }, []);

    const selectedCity = city || CITIES[0];
    const treeData = buildTreeData(allBlackspots, selectedCity.label);

    // Legend
    const LEGEND = [
        { color: '#F43F5E', label: 'High Risk', sub: 'Fatal accidents' },
        { color: '#F59E0B', label: 'Medium Risk', sub: 'Major accidents' },
        { color: '#22C55E', label: 'Low Risk', sub: 'Minor accidents' },
    ];

    if (step === 'select') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex flex-col items-center justify-center gap-8 px-12 bg-[#020202]"
            >
                {/* Header */}
                <div className="text-center">
                    <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                        <MapPin size={24} className="text-emerald-400" />
                    </div>
                    <h2 className="text-white font-black uppercase tracking-[0.3em] text-sm mb-2">Select City</h2>
                    <p className="text-white/30 text-[11px] tracking-wide">Choose a city to generate its accident risk tree</p>
                </div>

                {/* City Dropdown */}
                <div className="relative w-full max-w-[260px]">
                    <button
                        onClick={() => setDropOpen(v => !v)}
                        className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 text-white text-sm font-bold transition-all"
                    >
                        <span>{selectedCity.label}</span>
                        <ChevronDown size={16} className={`text-white/40 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                    {dropOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="absolute top-full mt-2 w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl"
                        >
                            {CITIES.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => { setCity(c); setDropOpen(false); }}
                                    className={`w-full flex flex-col px-5 py-3 hover:bg-emerald-500/10 transition-colors text-left ${city?.id === c.id ? 'bg-emerald-500/5' : ''}`}
                                >
                                    <span className="text-white text-sm font-bold">{c.label}</span>
                                    <span className="text-white/30 text-[10px]">{c.subtitle}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                {/* Info row: blackspot count */}
                <div className="flex gap-4">
                    {LEGEND.map(l => (
                        <div key={l.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 border border-white/5">
                            <div className="w-2 h-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 8px ${l.color}60` }} />
                            <div>
                                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">{l.label}</p>
                                <p className="text-[9px] text-white/30">{l.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Generate Button */}
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep('tree')}
                    className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[11px] transition-colors shadow-[0_0_24px_rgba(16,185,129,0.3)]"
                >
                    Generate Tree
                    <ArrowRight size={16} />
                </motion.button>
            </motion.div>
        );
    }

    // Tree view
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col bg-[#020202]"
        >
            {/* Sub-header: city + back */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{selectedCity.label} · Risk Hierarchy</span>
                </div>
                <button
                    onClick={() => setStep('select')}
                    className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                >
                    ← Change City
                </button>
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 w-full relative overflow-hidden">
                <TreeCanvas treeData={treeData} />

                {/* Floating legend overlay */}
                <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                    {LEGEND.map(l => (
                        <div key={l.label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
                            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">{l.label}</span>
                        </div>
                    ))}
                </div>

                {/* Node count */}
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/5">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{(allBlackspots || []).length} Blackspots</span>
                </div>
            </div>
        </motion.div>
    );
};

export default ZoneTree3D;
