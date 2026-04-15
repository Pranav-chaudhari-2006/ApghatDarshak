import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import ForceGraph3D from 'react-force-graph-3d';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, ArrowRight, LocateFixed, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

// Cities whose accident data is seeded in the schema
// (Pune is primary; others approximate Pune's graph but with distinct labels)
const CITIES = [
    { id: 'pune',     label: 'Pune',     subtitle: 'Maharashtra, India',  endpoint: `${API_BASE_URL}/blackspots` },
    { id: 'pcmc',     label: 'PCMC',     subtitle: 'Pimpri-Chinchwad',    endpoint: `${API_BASE_URL}/blackspots` },
    { id: 'hadapsar', label: 'Hadapsar', subtitle: 'East Pune Zone',      endpoint: `${API_BASE_URL}/blackspots` },
    { id: 'kothrud',  label: 'Kothrud',  subtitle: 'West Pune Zone',      endpoint: `${API_BASE_URL}/blackspots` },
];

/**
 * Build the N-ary tree structure from blackspot data.
 * Root → [HIGH RISK, MEDIUM RISK, LOW RISK] → leaf blackspot nodes
 */
function buildTreeData(blackspots, cityLabel) {
    const makeName = (b) => {
        const loc = b.area || b.roadName;
        if (!loc) return 'Unknown Area';
        return loc.length > 22 ? loc.slice(0, 20) + '…' : loc;
    };

    // Deduplicate and aggregate blackspots by their processed name
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
            existing.risk  = (existing.risk  || 0) + (b.risk  || 0);
        }
    });

    const agg    = Array.from(uniqueMap.values());
    const sorted = agg.sort((a, b) => (b.risk || 0) - (a.risk || 0));

    // Limit leaves per category to avoid graph overload (take top-N per tier)
    const take = (arr, n) => arr.slice(0, n);

    const high   = take(sorted.filter(b => (b.fatal || 0) > 0), 25);
    const medium = take(sorted.filter(b => (b.fatal || 0) === 0 && (b.major || 0) > 0), 25);
    const low    = take(sorted.filter(b => (b.fatal || 0) === 0 && (b.major || 0) === 0), 25);

    const leafNodes = (arr, prefix, color) =>
        arr.length > 0
            ? arr.map((b, i) => ({ id: `${prefix}_${b.id || i}`, label: makeName(b), fatal: b.fatal, major: b.major, minor: b.minor, risk: b.risk, color, val: 2 }))
            : [{ id: `${prefix}_none`, label: 'No Data', fatal: 0, major: 0, minor: 0, risk: 0, color, val: 2 }];

    return {
        label: cityLabel.toUpperCase(),
        color: '#10B981',
        id: 'root',
        val: 12,
        children: [
            { id: 'cat_high', label: 'HIGH RISK',   color: '#F43F5E', val: 7, leaves: leafNodes(high,   'high', '#FB7185') },
            { id: 'cat_med',  label: 'MEDIUM RISK', color: '#F59E0B', val: 7, leaves: leafNodes(medium, 'med',  '#FCD34D') },
            { id: 'cat_low',  label: 'LOW RISK',    color: '#22C55E', val: 7, leaves: leafNodes(low,    'low',  '#86EFAC') },
        ]
    };
}

const createTextSprite = (message, colorHex, scaleFactor = 1) => {
    const canvas  = document.createElement('canvas');
    canvas.width  = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font         = 'bold 32px "Outfit", sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = colorHex;
    ctx.shadowColor  = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur   = 10;
    ctx.fillText(message.toUpperCase(), canvas.width / 2, canvas.height / 2);

    const texture       = new THREE.CanvasTexture(canvas);
    texture.minFilter   = THREE.LinearFilter;
    const mat           = new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false, transparent: true });
    const sprite        = new THREE.Sprite(mat);
    sprite.scale.set(36 * scaleFactor, 9 * scaleFactor, 1);
    return sprite;
};

/**
 * ForceGraph3D renderer — using radialout dag mode for better node spread
 */
function TreeCanvas({ treeData }) {
    const containerRef  = useRef();
    const graphRef      = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(entries => {
            for (const e of entries) {
                setDimensions({ width: e.contentRect.width, height: e.contentRect.height });
            }
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    const graphData = useMemo(() => {
        const nodes = [];
        const links = [];

        nodes.push({ id: treeData.id, name: treeData.label, color: treeData.color, val: treeData.val, isRoot: true, info: 'City Risk Root' });

        treeData.children.forEach(cat => {
            nodes.push({ id: cat.id, name: cat.label, color: cat.color, val: cat.val, isCategory: true, info: 'Risk Category' });
            links.push({ source: treeData.id, target: cat.id, color: cat.color });

            (cat.leaves || []).forEach(leaf => {
                nodes.push({
                    id: leaf.id, name: leaf.label, color: leaf.color, val: leaf.val,
                    isLeaf: true, info: `Risk:${leaf.risk} | F:${leaf.fatal||0} M:${leaf.major||0} m:${leaf.minor||0}`
                });
                links.push({ source: cat.id, target: leaf.id, color: `${leaf.color}99` });
            });
        });

        const uniqueNodes = Array.from(new Map(nodes.map(n => [n.id, n])).values());
        return { nodes: uniqueNodes, links };
    }, [treeData]);

    const handleNodeClick = node => {
        if (!graphRef.current) return;
        const distance  = 80;
        const distRatio = 1 + distance / Math.max(Math.hypot(node.x, node.y, node.z), 1);
        graphRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
            node, 1500
        );
    };

    const handleRecenter = () => {
        if (!graphRef.current) return;
        graphRef.current.cameraPosition({ x: 0, y: 0, z: 550 }, { x: 0, y: 0, z: 0 }, 1500);
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
                    dagMode="radialout"
                    dagLevelDistance={130}
                    nodeRelSize={5}
                    nodeOpacity={0.95}
                    nodeColor="color"
                    linkColor="color"
                    linkOpacity={0.5}
                    linkWidth={1.8}
                    backgroundColor="#020202"
                    nodeThreeObjectExtend={true}
                    nodeThreeObject={node => {
                        const scale = node.isRoot ? 1.2 : node.isCategory ? 0.85 : 0.55;
                        const sprite = createTextSprite(node.name, node.color, scale);
                        sprite.position.y = node.isRoot ? -18 : node.isCategory ? -14 : -10;
                        return sprite;
                    }}
                    nodeLabel={node => `
                        <div style="background:rgba(15,23,42,0.95);border:1px solid rgba(255,255,255,0.12);padding:10px 14px;border-radius:10px;font-family:'Outfit',sans-serif;max-width:200px;">
                            <strong style="color:${node.color};display:block;margin-bottom:4px;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">${node.name}</strong>
                            <span style="color:#cbd5e1;font-size:11px;">${node.info}</span>
                            <span style="color:#475569;font-size:9px;display:block;margin-top:4px;">Click to focus</span>
                        </div>
                    `}
                    onNodeClick={handleNodeClick}
                    onNodeDragEnd={node => { node.fx = node.x; node.fy = node.y; node.fz = node.z; }}
                    cooldownTicks={200}
                    warmupTicks={50}
                />
            )}
        </div>
    );
}

/**
 * Main ZoneTree3D component.
 */
const ZoneTree3D = ({ blackspots: initialBlackspots = [] }) => {
    const [step, setStep]           = useState('select');
    const [city, setCity]           = useState(CITIES[0]);
    const [dropOpen, setDropOpen]   = useState(false);
    const [allBlackspots, setAllBlackspots] = useState(initialBlackspots);
    const [loading, setLoading]     = useState(false);

    const fetchCityBlackspots = async (selectedCity) => {
        setLoading(true);
        try {
            const res  = await fetch(selectedCity.endpoint);
            const data = await res.json();
            const spots = data.blackspots || data || [];
            if (spots.length > 0) setAllBlackspots(spots);
        } catch (err) {
            console.error('Failed to fetch blackspots for', selectedCity.label, err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch blackspots on mount with the default city
    useEffect(() => {
        fetchCityBlackspots(CITIES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCityChange = (c) => {
        setCity(c);
        setDropOpen(false);
        fetchCityBlackspots(c);
    };

    const treeData = useMemo(() => buildTreeData(allBlackspots, city.label), [allBlackspots, city]);

    const LEGEND = [
        { color: '#F43F5E', label: 'High Risk',   sub: 'Fatal accidents' },
        { color: '#F59E0B', label: 'Medium Risk',  sub: 'Major accidents' },
        { color: '#22C55E', label: 'Low Risk',     sub: 'Minor accidents' },
    ];

    const high   = allBlackspots.filter(b => (b.fatal || 0) > 0).length;
    const medium = allBlackspots.filter(b => (b.fatal || 0) === 0 && (b.major || 0) > 0).length;
    const low    = allBlackspots.filter(b => (b.fatal || 0) === 0 && (b.major || 0) === 0).length;
    const counts = [high, medium, low];

    if (step === 'select') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex flex-col items-center justify-center gap-6 px-10 bg-[#020202]"
            >
                {/* Header */}
                <div className="text-center">
                    <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <MapPin size={24} className="text-emerald-400" />
                    </div>
                    <h2 className="text-white font-black uppercase tracking-[0.3em] text-sm mb-1">Select City Zone</h2>
                    <p className="text-white/30 text-[10px] tracking-wide">Choose a zone to generate its accident risk N-ary tree</p>
                </div>

                {/* City Dropdown */}
                <div className="relative w-full max-w-[260px]">
                    <button
                        onClick={() => setDropOpen(v => !v)}
                        className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 text-white text-sm font-bold transition-all"
                    >
                        <span>{city.label}</span>
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
                                        onClick={() => handleCityChange(c)}
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

                {/* Stats */}
                <div className="flex gap-3">
                    {LEGEND.map((l, i) => (
                        <div key={l.label} className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/3 border border-white/5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color, boxShadow: `0 0 10px ${l.color}80` }} />
                            <p className="text-[9px] font-black text-white/70 uppercase tracking-widest">{l.label}</p>
                            <p className="text-xl font-black font-outfit" style={{ color: l.color }}>{loading ? '—' : counts[i]}</p>
                        </div>
                    ))}
                </div>

                {/* Generate Button */}
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep('tree')}
                    disabled={loading}
                    className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[11px] transition-colors shadow-[0_0_24px_rgba(16,185,129,0.3)] disabled:opacity-60"
                >
                    {loading ? <RefreshCw size={16} className="animate-spin" /> : <>Generate Tree <ArrowRight size={16} /></>}
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
            {/* Sub-header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{city.label} · Risk Hierarchy · {allBlackspots.length} nodes</span>
                </div>
                <button
                    onClick={() => setStep('select')}
                    className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                >
                    ← Change Zone
                </button>
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 w-full relative overflow-hidden">
                <TreeCanvas treeData={treeData} />

                {/* Floating legend */}
                <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                    {LEGEND.map(l => (
                        <div key={l.label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
                            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">{l.label}</span>
                        </div>
                    ))}
                </div>

                {/* Help text */}
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/5">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Drag · Orbit · Click to Focus</span>
                </div>
            </div>
        </motion.div>
    );
};

export default ZoneTree3D;
