import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, X, Search } from 'lucide-react';
import { searchLocations } from '../../services/geocoding';

const LocationInput = ({ placeholder, icon: Icon, onSelect, value: controlledValue }) => {
    const [query, setQuery] = useState(controlledValue || '');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setQuery(controlledValue || '');
    }, [controlledValue]);

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.trim().length < 3) {
            setSuggestions([]);
            setOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await searchLocations(val);
                setSuggestions(results);
                setOpen(results.length > 0);
            } catch {
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 400);
    };

    const handleSelect = (loc) => {
        setQuery(loc.displayName.split(',')[0]);
        setSuggestions([]);
        setOpen(false);
        onSelect?.(loc);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <motion.div
                whileFocus={{ scale: 1.005 }}
                className="relative group"
            >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 group-focus-within:text-emerald-500 transition-colors">
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : Icon ? (
                        <Icon className="w-4 h-4" strokeWidth={2.5} />
                    ) : (
                        <Search className="w-4 h-4" strokeWidth={2.5} />
                    )}
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-4 text-sm rounded-2xl border border-slate-200 dark:border-slate-800/60 
                               bg-white/40 dark:bg-slate-900/40 backdrop-blur-md
                               text-slate-800 dark:text-slate-100 placeholder-slate-400
                               focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30
                               transition-all shadow-sm font-outfit tracking-wide"
                />
            </motion.div>

            <AnimatePresence>
                {open && suggestions.length > 0 && (
                    <motion.ul
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        className="absolute z-2000 mt-3 w-full bg-white dark:bg-slate-900 glass-card border border-slate-200/50 dark:border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden max-h-72 overflow-y-auto"
                    >
                        {suggestions.map((loc, idx) => (
                            <motion.li
                                key={loc.placeId || idx}
                                whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                onClick={() => handleSelect(loc)}
                                className="flex items-start gap-3.5 px-5 py-4 cursor-pointer border-b border-slate-100 dark:border-white/5 last:border-none hover:bg-emerald-50/50 transition-colors"
                            >
                                <div className="mt-1 p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-outfit">
                                        {loc.displayName.split(',')[0]}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[260px] font-outfit tracking-tight">
                                        {loc.displayName.split(',').slice(1).join(',')}
                                    </span>
                                </div>
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LocationInput;

