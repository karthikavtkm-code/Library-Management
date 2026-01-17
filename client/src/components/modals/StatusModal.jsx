import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

const StatusModal = ({ isOpen, onClose, type = 'success', title, message, actionLabel }) => {
    // Determine colors/icons based on type
    const isSuccess = type === 'success';
    const Icon = isSuccess ? CheckCircle : AlertTriangle;

    // Theme configs
    const theme = isSuccess ? {
        bg: 'bg-emerald-100',
        text: 'text-emerald-600',
        btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
    } : {
        bg: 'bg-rose-100',
        text: 'text-rose-600',
        btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center"
                >
                    {/* Icon Bubble */}
                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${theme.bg} ${theme.text}`}>
                        <Icon size={40} strokeWidth={2.5} />
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                        {title || (isSuccess ? 'Awesome!' : 'Oops!')}
                    </h3>

                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${theme.btn}`}
                    >
                        {actionLabel || (isSuccess ? 'Continue' : 'Try Again')}
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default StatusModal;
