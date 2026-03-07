import React from 'react';
import { cn } from '../../lib/utils';

const RiskBadge = ({ riskLevel, className }) => {
    const variants = {
        low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
        medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
        high: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800',
    };

    const labels = {
        low: 'Safe Route',
        medium: 'Moderate Risk',
        high: 'High Risk',
    };

    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            variants[riskLevel] || variants.low,
            className
        )}>
            {labels[riskLevel] || 'Unknown'}
        </span>
    );
};

export default RiskBadge;
