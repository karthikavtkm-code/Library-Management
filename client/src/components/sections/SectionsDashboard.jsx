import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Book, Monitor, Layers, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SectionCard = ({ title, icon: Icon, color, description, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} strokeWidth={2} />
            </div>
            <div className="p-2 rounded-full bg-slate-50 text-slate-300 group-hover:bg-slate-100 group-hover:text-primary-500 transition-colors">
                <ArrowRight size={16} />
            </div>
        </div>

        <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-primary-700 transition-colors uppercase tracking-wider">{title}</h3>
        <p className="text-slate-500 text-[11px] leading-relaxed mb-4 flex-1">{description}</p>

        <div className="w-full bg-slate-50 h-1 mt-auto rounded-full overflow-hidden group-hover:bg-slate-100 transition-colors">
            <div className={`h-full ${color} w-0 group-hover:w-full transition-all duration-700 ease-out`}></div>
        </div>
    </motion.div>
);

const SectionsDashboard = ({ node }) => {
    const navigate = useNavigate();

    // Helper to find child ID if it exists, otherwise we might rely on route names or just standard IDs
    // For this specific requirement, we assume these children EXIST or we direct to a generic handler.
    const getLink = (type) => {
        const child = node.children?.find(c => c.type === type);
        return child ? `/node/${child.id}` : '#';
    };

    const sections = [
        {
            title: 'Shelf Management',
            type: 'Shelf',
            icon: Layers,
            color: 'bg-emerald-500',
            description: 'Organize physical storage, manage shelf capacities, and book format allocations.'
        },
        {
            title: 'Reference Unit',
            type: 'Reference Unit',
            icon: Book,
            color: 'bg-amber-500',
            description: 'manage encyclopedias, dictionaries, and strictly reference-only materials.'
        },
        {
            title: 'Periodicals Unit',
            type: 'Periodicals Unit',
            icon: BookOpen,
            color: 'bg-rose-500',
            description: 'Track daily newspapers, monthly magazines, and academic journals.'
        },
        {
            title: 'Digital Resources',
            type: 'Digital Resources',
            icon: Monitor,
            color: 'bg-blue-500',
            description: 'Manage e-books, audiobooks, subscriptions, and online database access links.'
        }
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-5">
            <div className="flex flex-col md:flex-row justify-between items-end gap-3 pb-2">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Sections Overview</h2>
                    <p className="text-slate-500 text-xs font-semibold">Select a department to manage resources</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sections.map((section) => (
                    <SectionCard
                        key={section.type}
                        {...section}
                        onClick={() => {
                            const link = getLink(section.type);
                            if (link !== '#') navigate(link);
                            else alert(`Section "${section.type}" not found. Create it using the + button above.`);
                        }}
                    />
                ))}
            </div>

            {/* Empty State / Prompt */}
            {!node.children?.length && (
                <div className="bg-slate-50 border border-slate-100 border-dashed rounded-xl p-6 text-center">
                    <p className="text-slate-400 text-xs font-medium">System setup required: Use "Create New" to create these sections.</p>
                </div>
            )}
        </div>
    );
};

export default SectionsDashboard;
