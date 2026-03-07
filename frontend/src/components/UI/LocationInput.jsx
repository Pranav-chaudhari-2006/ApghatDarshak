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
                whileFocus={{ scale: 1.01 }}
                className="relative group"
            >
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 group-focus-within:text-emerald-500 transition-colors">
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : Icon ? (
                        <Icon className="w-4 h-4" />
                    ) : (
                        <Search className="w-4 h-4" />
                    )}
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-slate-800 
                               bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm
                               text-gray-800 dark:text-gray-100 placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
                               transition-all shadow-sm"
                />
            </motion.div>

            <AnimatePresence>
                {open && suggestions.length > 0 && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-2000 mt-2 w-full bg-white dark:bg-slate-900 glass-card border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                    >
                        {suggestions.map((loc, idx) => (
                            <motion.li
                                key={loc.placeId || idx}
                                whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
                                onClick={() => handleSelect(loc)}
                                className="flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-white/5 last:border-none hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                            >
                                <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                        {loc.displayName.split(',')[0]}
                                    </span>
                                    <span className="text-[10px] text-gray-400 truncate max-w-[280px]">
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

