import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Info, Map, Layout, Boxes, Terminal } from 'lucide-react';

const Sections = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const response = await axios.get('http://localhost:5000/api/nodes', config);
                // Filter only 'Section' type nodes or top-level ones
                setSections(response.data);
            } catch (error) {
                console.error('Error fetching sections:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSections();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'Library': return <Layout size={24} />;
            case 'Section': return <Layers size={24} />;
            case 'Shelf': return <Boxes size={24} />;
            default: return <Terminal size={24} />;
        }
    };

    if (loading) return <div className="flex justify-center p-10 font-bold text-slate-400 animate-pulse uppercase tracking-[0.2em] text-xs">Synchronizing Sectors...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Library Sections</h2>
                    <p className="text-slate-400 text-sm mt-1 font-medium">Visualization of the library's physical and digital architecture.</p>
                </div>
                <div className="w-14 h-14 bg-white border border-slate-200 rounded-[1.25rem] flex items-center justify-center text-primary-600 shadow-sm">
                    <Map size={28} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sections.map((section) => (
                    <div key={section.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-primary-500/5 transition-all group relative overflow-hidden flex flex-col h-full border-b-4 border-b-transparent hover:border-b-primary-500">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>

                        <div className="flex items-start justify-between mb-8 relative z-10">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white group-hover:rotate-12 transition-all duration-500">
                                {getIcon(section.type)}
                            </div>
                            <span className="px-4 py-1.5 bg-slate-100/50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100">
                                {section.type}
                            </span>
                        </div>

                        <div className="relative z-10 flex-1">
                            <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-primary-600 transition-colors">{section.name}</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                                Structured node representing the {section.name.toLowerCase()} infrastructure and its associated metadata.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between relative z-10 mt-auto">
                            <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                <Info size={14} className="text-slate-400" />
                                <span>Reference Only</span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400">
                                ID: {section.id.toString().padStart(3, '0')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {sections.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No configuration nodes detected</p>
                </div>
            )}
        </div>
    );
};

export default Sections;
