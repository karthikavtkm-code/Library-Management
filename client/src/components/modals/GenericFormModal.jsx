import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GenericFormModal = ({ isOpen, onClose, title, fields, onSubmit, loading, error, initialValues }) => {
    const [formData, setFormData] = useState({});

    // Reset form when opening/changing fields
    useEffect(() => {
        if (isOpen && fields) {
            const data = {};
            fields.forEach(field => {
                // If initialValues exists and has this field, use it. Otherwise use defaultValue or empty string.
                if (initialValues && initialValues[field.name] !== undefined) {
                    data[field.name] = initialValues[field.name];
                } else {
                    data[field.name] = field.defaultValue || '';
                }
            });
            setFormData(data);
        }
    }, [isOpen, fields, initialValues]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
                />

                {/* Modal Window */}
                <motion.div
                    initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: "100%", opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative bg-white w-full sm:max-w-lg sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Form Content */}
                    <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                        {error && (
                            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-2 border border-rose-100">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <form id="generic-form" onSubmit={handleSubmit} className="space-y-5">
                            {fields.map((field) => (
                                <div key={field.name} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                                    </label>

                                    {field.type === 'select' ? (
                                        <div className="relative">
                                            <select
                                                required={field.required}
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleChange(field.name, e.target.value)}
                                                className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border-2 border-slate-100 focus:border-primary-500 rounded-2xl py-3 px-4 outline-none transition-all font-semibold text-slate-700 appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select {field.label}</option>
                                                {field.options.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            required={field.required}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            rows={3}
                                            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border-2 border-slate-100 focus:border-primary-500 rounded-2xl py-3 px-4 outline-none transition-all font-semibold text-slate-700 resize-none"
                                        />
                                    ) : (
                                        <input
                                            type={field.type || 'text'}
                                            required={field.required}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border-2 border-slate-100 focus:border-primary-500 rounded-2xl py-3 px-4 outline-none transition-all font-semibold text-slate-700"
                                        />
                                    )}
                                </div>
                            ))}
                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 z-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-200/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="generic-form"
                            disabled={loading}
                            className="flex-[2] py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Save & Create</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GenericFormModal;
