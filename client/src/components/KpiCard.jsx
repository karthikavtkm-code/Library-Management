import React from 'react';
import { motion } from 'framer-motion';

const KpiCard = ({ title, value, icon: Icon, trend, color = "bg-blue-500" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="group relative bg-white p-3 rounded-xl shadow-sm border border-slate-100/50 hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-default"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color} text-white shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                    <Icon size={16} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate leading-tight">{title}</p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">{value}</h3>
                        {trend && (
                            <span className={`text-[9px] font-bold ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {trend > 0 ? '↑' : '↓'}{Math.abs(trend)}%
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default KpiCard;
