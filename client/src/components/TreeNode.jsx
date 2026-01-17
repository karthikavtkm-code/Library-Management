import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2, Folder, FileText, Settings, Book, Layers, Archive, Monitor, Database, Users, CreditCard, BookOpen, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap = {
    'Library': Book,
    'Section': Layers,
    'Shelf': Archive,
    'Category': Folder,
    'Book Format': FileText,
    'Reference Unit': Database,
    'Periodicals Unit': Monitor,
    'Digital Resources': Monitor,
    'Library Operations': Settings,
    'Issue & Return Desk': BookOpen,
    'Membership Management': Users,
    'Fine Management': CreditCard,
    'Inventory Control': Archive,
    'User Services': Users,
    'Reading Rooms': BookOpen,
    'Reservation System': Settings,
    'Help Desk': HelpCircle
};

const TreeNode = ({ node, onAddChild, onEdit, onDelete, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(true);
    const Icon = iconMap[node.type] || Folder;

    const hasChildren = node.children && node.children.length > 0;

    // Check if adding child is allowed based on hierarchy
    const allowedTypes = {
        'Library': ['Section', 'Library Operations', 'User Services'],
        'Section': ['Shelf', 'Reference Unit', 'Periodicals Unit', 'Digital Resources'],
        'Shelf': ['Category', 'Book Format'],
    };

    const canAddChild = !!allowedTypes[node.type];

    return (
        <div className="ml-2">
            <div
                className={`flex items-center group px-2 py-1.5 rounded-lg cursor-pointer transition-all hover:bg-primary-50 ${level === 0 ? 'font-semibold text-primary-800' : 'text-slate-600'}`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                <div onClick={() => setIsOpen(!isOpen)} className="flex items-center flex-1">
                    {hasChildren ? (
                        isOpen ? <ChevronDown size={14} className="mr-1 text-slate-400" /> : <ChevronRight size={14} className="mr-1 text-slate-400" />
                    ) : (
                        <span className="w-4.5" />
                    )}
                    <Icon size={16} className={`mr-2 ${level === 0 ? 'text-primary-600' : 'text-primary-400'}`} />
                    <span className="truncate">{node.name}</span>
                </div>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {canAddChild && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddChild(node); }}
                            className="p-1 hover:text-primary-600 rounded"
                            title="Add Child"
                        >
                            <Plus size={14} />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(node); }}
                        className="p-1 hover:text-amber-600 rounded"
                        title="Edit"
                    >
                        <Edit size={14} />
                    </button>
                    {node.type !== 'Library' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                            className="p-1 hover:text-rose-600 rounded"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {node.children.map(child => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                onAddChild={onAddChild}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                level={level + 1}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TreeNode;
