import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddNodeModal = ({ isOpen, onClose, onSave, parentNode }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');

    const allowedTypes = {
        'Library': ['Section', 'Library Operations', 'User Services'],
        'Section': ['Shelf', 'Reference Unit', 'Periodicals Unit', 'Digital Resources'],
        'Shelf': ['Category', 'Book Format'],
        'Library Operations': ['Issue & Return Desk', 'Membership Management', 'Fine Management', 'Inventory Control'],
        'User Services': ['Reading Rooms', 'Reservation System', 'Help Desk']
    };

    const options = parentNode ? (allowedTypes[parentNode.type] || []) : ['Library'];

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, type, parent_id: parentNode?.id });
        setName('');
        setType('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
                >
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800">Add New Node</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {parentNode && (
                            <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100">
                                <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1">Parent Node</p>
                                <p className="text-primary-800 font-semibold">{parentNode.name} ({parentNode.type})</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Node Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter node name..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Node Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium appearance-none"
                                required
                            >
                                <option value="">Select Type</option>
                                {options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            <span>Save Node</span>
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddNodeModal;
