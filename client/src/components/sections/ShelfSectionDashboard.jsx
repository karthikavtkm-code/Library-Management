import React, { useState } from 'react';
import { Layers, List, Tag, FileText, LayoutGrid } from 'lucide-react';
import ShelfManager from './ShelfManager';
import GenericSectionManager from './GenericSectionManager';

const TabButton = ({ active, label, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${active
                ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/20 scale-105'
                : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-slate-100'
            }`}
    >
        <Icon size={14} strokeWidth={2.5} />
        {label}
    </button>
);

const ShelfSectionDashboard = () => {
    const [activeTab, setActiveTab] = useState('shelves');

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            {/* Tab Navigation */}
            <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100/50 backdrop-blur-sm rounded-2xl w-fit">
                <TabButton
                    active={activeTab === 'shelves'}
                    label="Shelf List"
                    icon={LayoutGrid}
                    onClick={() => setActiveTab('shelves')}
                />
                <TabButton
                    active={activeTab === 'categories'}
                    label="Categories"
                    icon={Tag}
                    onClick={() => setActiveTab('categories')}
                />
                <TabButton
                    active={activeTab === 'formats'}
                    label="Book Formats"
                    icon={FileText}
                    onClick={() => setActiveTab('formats')}
                />
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'shelves' && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <ShelfManager />
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <GenericSectionManager
                            title="Shelf Categories"
                            endpoint="/sections/categories"
                            icon={Tag}
                            columns={[
                                { label: 'Category Name', key: 'name', render: (r) => <span className="font-bold text-slate-800">{r.name}</span> },
                                { label: 'Description', key: 'description' },
                                { label: 'Total Books', key: 'total_books', render: (r) => <span className="px-2 py-1 bg-slate-100 rounded-lg font-bold text-xs">{r.total_books || 0}</span> }
                            ]}
                            onAdd={() => alert('Add Category Logic')}
                        />
                    </div>
                )}

                {activeTab === 'formats' && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <GenericSectionManager
                            title="Book Formats"
                            endpoint="/sections/formats"
                            icon={FileText}
                            columns={[
                                { label: 'Format Name', key: 'format', render: (r) => <span className="capitalize font-bold text-slate-800">{r.format}</span> },
                                { label: 'Book Count', key: 'count', render: (r) => <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs">{r.count}</span> }
                            ]}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShelfSectionDashboard;
