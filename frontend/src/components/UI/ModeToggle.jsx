import React from 'react';
import { cn } from '../../lib/utils';

const ModeToggle = ({ modes, selected, onSelect, className }) => {
    return (
        <div className={cn("flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/50 dark:border-white/5", className)}>
            {modes.map((mode) => (
                <button
                    key={mode}
                    onClick={() => onSelect(mode)}
                    className={cn(
                        "flex-1 py-1.5 px-3 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-300",
                        selected === mode
                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                    )}
                >
                    {mode}
                </button>
            ))}
        </div>
    );
};

export default ModeToggle;
