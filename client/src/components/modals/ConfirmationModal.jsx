import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel, isDangerous = false, loading = false }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={!loading ? onClose : undefined}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-8 text-center">
                        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isDangerous ? 'bg-rose-100 text-rose-500' : 'bg-amber-100 text-amber-500'}`}>
                            {isDangerous ? <Trash2 size={32} /> : <AlertTriangle size={32} />}
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight">
                            {title || 'Are you sure?'}
                        </h3>

                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            {message || 'This action cannot be undone. Please confirm you want to proceed.'}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 py-3.5 px-6 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                    ${isDangerous
                                        ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
                                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}
                                    disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    confirmLabel || 'Confirm'
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
