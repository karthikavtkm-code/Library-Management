import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Library, Layers, BookOpen, Users, Book, Globe, HelpCircle, Folder,
    Settings, Search, Plus, AlertCircle, ArrowRight, Database, ClipboardList,
    Wallet, Armchair, Ticket, BookMarked, Monitor
} from 'lucide-react';
import api from '../api/api';
import AddNodeModal from '../components/AddNodeModal';
import GenericFormModal from '../components/modals/GenericFormModal';
import StatusModal from '../components/modals/StatusModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import SectionsDashboard from '../components/sections/SectionsDashboard';
import ShelfSectionDashboard from '../components/sections/ShelfSectionDashboard';
import UserServicesDashboard from '../components/sections/UserServicesDashboard';
import GenericSectionManager from '../components/sections/GenericSectionManager';

const getNodeMetadata = (type) => {
    switch (type) {
        case 'Library': return { icon: Library, color: 'from-blue-500 to-indigo-600', bg: 'bg-indigo-50', iconBg: 'bg-emerald-500', description: 'Centralized management of the entire library infrastructure and data.' };
        case 'Sections':
        case 'Section': return { icon: Layers, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', iconBg: 'bg-emerald-500', description: 'Organize physical storage, manage shelf capacities, and book format allocations.' };
        case 'Shelf': return { icon: BookOpen, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', iconBg: 'bg-amber-500', description: 'Detailed view of physical shelf organization and categorical distribution.' };
        case 'User Services': return { icon: Users, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', iconBg: 'bg-teal-500', description: 'Monitor active reservations, seating chart, and help desk support' };
        case 'Reference Unit': return { icon: Book, color: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', iconBg: 'bg-orange-500', description: 'Manage encyclopedias, dictionaries, and strictly reference-only materials.' };
        case 'Periodicals Unit': return { icon: BookMarked, color: 'from-fuchsia-500 to-pink-600', bg: 'bg-fuchsia-50', iconBg: 'bg-pink-500', description: 'Track daily newspapers, monthly magazines, and academic journals.' };
        case 'Digital Resources': return { icon: Monitor, color: 'from-cyan-500 to-sky-600', bg: 'bg-cyan-50', iconBg: 'bg-blue-500', description: 'Manage e-books, audiobooks, subscriptions, and online database access links.' };
        case 'Help Desk': return { icon: HelpCircle, color: 'from-red-500 to-rose-600', bg: 'bg-red-50', iconBg: 'bg-rose-500', description: 'Centralized support system for member queries and account issues.' };
        case 'Issue & Return Desk': return { icon: ClipboardList, color: 'from-blue-600 to-indigo-700', bg: 'bg-blue-50', iconBg: 'bg-indigo-600', description: 'Manage daily book issuance, returns, and live tracking of inventory.' };
        case 'Membership Management': return { icon: Users, color: 'from-emerald-600 to-teal-700', bg: 'bg-emerald-50', iconBg: 'bg-emerald-600', description: 'Manage member levels, registrations, and account activity logs.' };
        case 'Fine Management': return { icon: Wallet, color: 'from-rose-500 to-red-600', bg: 'bg-rose-50', iconBg: 'bg-red-500', description: 'Automate fine calculations, track payments, and manage overdue statuses.' };
        case 'Inventory Control': return { icon: Database, color: 'from-slate-600 to-slate-700', bg: 'bg-slate-50', iconBg: 'bg-slate-600', description: 'Centralized cataloging and physical audit management for all items.' };
        default: return { icon: Folder, color: 'from-slate-500 to-slate-600', bg: 'bg-slate-50', iconBg: 'bg-slate-500', description: 'Manage settings and items within this specialized section.' };
    }
};

const NodeDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [node, setNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [stats, setStats] = useState(null);

    const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDangerous: false });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [actionModal, setActionModal] = useState({ isOpen: false, config: null });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchNode = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/nodes/${id}`);
                setNode(response.data);
            } catch (error) {
                console.error('Error fetching node:', error);
                setError(error.response?.status === 404 ? 'Node not found' : 'Error loading section');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNode();
        }
    }, [id, refreshTrigger]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/stats');
                setStats(response.data.stats);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        if (node?.name === 'Library Operations') {
            fetchStats();
        }
    }, [node]);

    const getMetricData = (childName) => {
        if (!stats) return null;
        switch (childName) {
            case 'Issue & Return':
            case 'Issue & Return Desk':
                return { value: stats.issuedToday, label: 'Issued Today', trend: '+4%' };
            case 'Membership Management':
                return { value: stats.activeMembers, label: 'Active Members', trend: '+12%' };
            case 'Fine Management':
                return { value: `$${stats.operations?.totalFines || 0}`, label: 'Pending Fines', trend: '-2%' };
            case 'Inventory Control':
                return { value: stats.totalBooks, label: 'Total Items', trend: '+1%' };
            default: return null;
        }
    };

    const handleActionSubmit = async (data) => {
        if (!actionModal.config) return;

        setActionLoading(true);
        const { endpoint, isEdit, itemId } = actionModal.config;

        try {
            if (isEdit && itemId) {
                await api.put(`${endpoint}/${itemId}`, data);
            } else {
                await api.post(endpoint, data);
            }

            setActionModal({ isOpen: false, config: null });
            setRefreshTrigger(prev => prev + 1);

            setStatusModal({
                isOpen: true,
                type: 'success',
                title: isEdit ? 'Update Successful' : 'Created Successfully',
                message: isEdit ? 'The item has been updated.' : 'New item has been added successfully.'
            });

        } catch (err) {
            console.error(err);
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Action Failed',
                message: err.response?.data?.error || err.message || 'Something went wrong.'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const openActionModal = (config) => {
        setActionModal({ isOpen: true, config });
    };

    const handleEdit = (item, endpoint, fields, title) => {
        openActionModal({
            title: title || 'Edit Item',
            endpoint,
            fields,
            isEdit: true,
            itemId: item.id,
            initialValues: item
        });
    };

    const handleDelete = (item, endpoint) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Item',
            message: `Are you sure you want to delete "${item.name || item.title || item.format || 'this item'}"? This action cannot be undone.`,
            isDangerous: true,
            onConfirm: async () => {
                try {
                    await api.delete(`${endpoint}/${item.id}`);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setRefreshTrigger(prev => prev + 1);
                    setStatusModal({ isOpen: true, type: 'success', title: 'Deleted', message: 'Item has been permanently removed.' });
                } catch (error) {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setStatusModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to delete item.' });
                }
            }
        });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-slate-200 rounded-3xl w-full mb-6"></div>
        </div>
    );

    if (error || !node) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="bg-rose-50 p-6 rounded-full mb-6 relative">
                <AlertCircle className="text-rose-400" size={64} />
                <div className="absolute inset-0 bg-rose-400/20 blur-xl rounded-full"></div>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">{error || 'Section Not Found'}</h2>
            <p className="text-slate-500 max-w-md mb-8">
                The content you are looking for might have been moved or deleted.
                Please select a valid section from the sidebar.
            </p>
            <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
                Back to Overview
            </button>
        </div>
    );

    const { icon: Icon, color } = getNodeMetadata(node.type);

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">

            {/* Premium Hero Section */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${color} text-white shadow-xl shadow-slate-200 transition-all duration-700`}>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white rounded-full blur-3xl opacity-10 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black rounded-full blur-3xl opacity-10"></div>

                <div className="relative p-6 md:p-8 z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10 shadow-lg">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                                {node.type} Dashboard
                            </div>

                            <div className="space-y-1">
                                <h1 className="text-2xl md:text-3xl font-black tracking-tighter drop-shadow-sm leading-tight">
                                    {node.name}
                                </h1>
                                <p className="text-white/80 max-w-xl text-xs font-medium leading-relaxed">
                                    {node.name === 'Library Operations'
                                        ? 'Executive command center for core library logistics, circulation, and member oversight.'
                                        : `Manage all ${node.name.toLowerCase()} resources and configurations from this centralized dashboard.`
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className={`flex items-center bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 transition-all duration-300 ${isSearchOpen ? 'w-64 px-4' : 'w-12 justify-center'}`}>
                                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-3 text-white hover:text-white/80 transition-colors">
                                    <Search size={20} strokeWidth={2.5} />
                                </button>
                                {isSearchOpen && (
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search..."
                                        className="bg-transparent border-none outline-none text-white text-sm font-bold w-full placeholder-white/50"
                                    />
                                )}
                            </div>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm shadow-xl shadow-black/5 hover:-translate-y-px hover:shadow-2xl transition-all flex items-center gap-2 active:scale-95"
                            >
                                <Plus size={20} strokeWidth={3} />
                                <span>Create New</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Specialized Compact Summary Cards for Library Operations */}
            {node.children && node.children.length > 0 && node.name === 'Library Operations' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
                    {node.children.map(child => {
                        const childMeta = getNodeMetadata(child.type);
                        const metric = getMetricData(child.name);
                        const ChildIcon = childMeta.icon;

                        return (
                            <div
                                key={child.id}
                                onClick={() => navigate(`/node/${child.id}`)}
                                className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer flex items-center gap-4 relative overflow-hidden"
                            >
                                <div className={`h-12 w-12 shrink-0 ${childMeta.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:scale-110 transition-transform`}>
                                    <ChildIcon size={24} strokeWidth={2.5} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{child.name}</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{metric?.value || '0'}</h3>
                                        <span className={`text-[9px] font-bold ${metric?.trend?.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {metric?.trend}
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">{metric?.label || 'Total Items'}</p>
                                </div>

                                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <ArrowRight size={14} strokeWidth={3} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Navigation Cards (Picture-Style) - For other overview nodes */}
            {node.children && node.children.length > 0 && ['Library', 'Sections', 'User Services'].includes(node.type) && node.name !== 'Library Operations' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
                    {node.children.map(child => {
                        const childMeta = getNodeMetadata(child.type);
                        const ChildIcon = childMeta.icon;
                        return (
                            <div
                                key={child.id}
                                onClick={() => navigate(`/node/${child.id}`)}
                                className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] hover:border-slate-200 transition-all cursor-pointer flex flex-col items-start relative overflow-hidden"
                            >
                                <div className="w-full flex justify-between items-start mb-6">
                                    <div className={`h-14 w-14 ${childMeta.iconBg} rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                                        <ChildIcon size={28} strokeWidth={2.5} />
                                    </div>
                                    <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <ArrowRight size={20} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">
                                    {child.name}
                                </h3>
                                <p className="text-xs font-medium text-slate-400 leading-relaxed mb-6 line-clamp-2">
                                    {childMeta.description}
                                </p>
                                <div className="mt-auto pt-4 border-t border-slate-50 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Enter Management</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="w-full space-y-6">
                {(node.type === 'Sections' || node.type === 'Section') && <SectionsDashboard node={node} />}
                {node.type === 'Shelf' && <ShelfSectionDashboard />}

                {node.type === 'Category' && (
                    <GenericSectionManager
                        key={refreshTrigger}
                        title="Shelf Categories"
                        endpoint="/sections/categories"
                        icon={Icon}
                        columns={[
                            { label: 'ID', key: 'id' },
                            { label: 'Name', key: 'name', render: (r) => <span className="font-bold text-slate-800">{r.name}</span> },
                            { label: 'Description', key: 'description' },
                            { label: 'Total Books', key: 'total_books', render: (r) => <span className="px-2 py-1 bg-slate-100 rounded-lg font-bold text-xs">{r.total_books || 0}</span> }
                        ]}
                        onAdd={() => openActionModal({
                            title: 'Add Category',
                            endpoint: '/sections/categories',
                            fields: [{ name: 'name', label: 'Category Name', required: true }, { name: 'description', label: 'Description', type: 'textarea' }]
                        })}
                        onEdit={(item) => handleEdit(item, '/sections/categories', [{ name: 'name', label: 'Category Name', required: true }, { name: 'description', label: 'Description', type: 'textarea' }])}
                        onDelete={(item) => handleDelete(item, '/sections/categories')}
                    />
                )}

                {node.type === 'Book Format' && (
                    <GenericSectionManager
                        key={refreshTrigger}
                        title="Book Formats"
                        endpoint="/sections/formats"
                        icon={Icon}
                        columns={[
                            { label: 'Format Name', key: 'format', render: (r) => <span className="capitalize font-bold text-slate-800">{r.format}</span> },
                            { label: 'Count', key: 'count', render: (r) => <span className="px-2 py-1 bg-slate-100 rounded-lg font-bold text-xs">{r.count}</span> }
                        ]}
                        onAdd={() => openActionModal({
                            title: 'Add Format',
                            endpoint: '/sections/formats',
                            fields: [{ name: 'format', label: 'Format Name', required: true }]
                        })}
                        onEdit={(item) => handleEdit(item, '/sections/formats', [{ name: 'format', label: 'Format Name', required: true }])}
                        onDelete={(item) => handleDelete(item, '/sections/formats')}
                    />
                )}

                {node.type === 'Periodicals Unit' && (
                    <GenericSectionManager
                        key={refreshTrigger}
                        title="Periodicals"
                        endpoint="/sections/periodicals"
                        icon={Icon}
                        columns={[
                            { label: 'Name', key: 'name', render: (r) => <span className="font-bold text-slate-800">{r.name}</span> },
                            { label: 'Frequency', key: 'frequency', render: (r) => <span className="capitalize">{r.frequency}</span> },
                            { label: 'Publisher', key: 'publisher' },
                            { label: 'Latest Issue', key: 'issue_date', render: (r) => r.issue_date ? new Date(r.issue_date).toLocaleDateString() : '-' }
                        ]}
                        onAdd={() => openActionModal({
                            title: 'Add Periodical',
                            endpoint: '/sections/periodicals',
                            fields: [{ name: 'name', label: 'Name', required: true }, { name: 'frequency', label: 'Frequency' }, { name: 'publisher', label: 'Publisher' }]
                        })}
                        onEdit={(item) => handleEdit(item, '/sections/periodicals', [{ name: 'name', label: 'Name', required: true }, { name: 'frequency', label: 'Frequency' }, { name: 'publisher', label: 'Publisher' }])}
                        onDelete={(item) => handleDelete(item, '/sections/periodicals')}
                    />
                )}

                {node.type === 'Digital Resources' && (
                    <GenericSectionManager
                        key={refreshTrigger}
                        title="Digital Resources"
                        endpoint="/sections/digital-resources"
                        icon={Icon}
                        columns={[
                            { label: 'Title', key: 'title', render: (r) => <span className="font-bold text-slate-800">{r.title}</span> },
                            { label: 'Type', key: 'type', render: (r) => <span className="uppercase text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded">{r.type}</span> },
                            { label: 'Access', key: 'access_link', render: (r) => <a href={r.access_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">Open Link</a> },
                            { label: 'License', key: 'license' }
                        ]}
                        onAdd={() => openActionModal({
                            title: 'Add Resource',
                            endpoint: '/sections/digital-resources',
                            fields: [
                                { name: 'title', label: 'Title', required: true },
                                { name: 'type', label: 'Type', type: 'select', options: [{ label: 'E-Book', value: 'ebook' }, { label: 'Journal', value: 'journal' }, { label: 'Database', value: 'database' }, { label: 'Video', value: 'video' }], required: true },
                                { name: 'access_link', label: 'Access Link', placeholder: 'https://...' },
                                { name: 'license', label: 'License' }
                            ]
                        })}
                        onEdit={(item) => handleEdit(item, '/sections/digital-resources', [
                            { name: 'title', label: 'Title', required: true },
                            { name: 'type', label: 'Type', type: 'select', options: [{ label: 'E-Book', value: 'ebook' }, { label: 'Journal', value: 'journal' }, { label: 'Database', value: 'database' }, { label: 'Video', value: 'video' }], required: true },
                            { name: 'access_link', label: 'Access Link' },
                            { name: 'license', label: 'License' }
                        ])}
                        onDelete={(item) => handleDelete(item, '/sections/digital-resources')}
                    />
                )}

                {node.type === 'Reference Unit' && (
                    <GenericSectionManager
                        key={refreshTrigger}
                        title="Reference Materials"
                        endpoint="/books"
                        dataFilter={(data) => data.filter(item => item.is_reference || item.reference_type)}
                        icon={Icon}
                        columns={[
                            { label: 'Title', key: 'title', render: r => <span className="font-bold text-slate-800">{r.title}</span> },
                            { label: 'Type', key: 'reference_type' },
                            { label: 'ISBN', key: 'isbn' },
                            { label: 'Status', key: 'status', render: r => <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-bold uppercase">{r.status}</span> }
                        ]}
                        onAdd={() => openActionModal({
                            title: 'Add Reference Item',
                            endpoint: '/books',
                            fields: [
                                { name: 'title', label: 'Title', required: true },
                                { name: 'author', label: 'Author', required: true },
                                { name: 'isbn', label: 'ISBN', required: true },
                                { name: 'reference_type', label: 'Type', type: 'select', options: [{ label: 'Dictionary', value: 'Dictionary' }, { label: 'Encyclopedia', value: 'Encyclopedia' }, { label: 'Atlas', value: 'Atlas' }], required: true },
                                { name: 'is_reference', label: 'Reference Item', type: 'hidden', defaultValue: 1 },
                                { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Available', value: 'available' }, { label: 'Maintenance', value: 'maintenance' }], defaultValue: 'available' }
                            ]
                        })}
                        onEdit={(item) => handleEdit(item, '/books', [
                            { name: 'title', label: 'Title', required: true },
                            { name: 'author', label: 'Author', required: true },
                            { name: 'isbn', label: 'ISBN', required: true },
                            { name: 'reference_type', label: 'Type', type: 'select', options: [{ label: 'Dictionary', value: 'Dictionary' }, { label: 'Encyclopedia', value: 'Encyclopedia' }, { label: 'Atlas', value: 'Atlas' }], required: true },
                            { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Available', value: 'available' }, { label: 'Maintenance', value: 'maintenance' }] }
                        ])}
                        onDelete={(item) => handleDelete(item, '/books')}
                    />
                )}

                {node.type === 'Issue & Return Desk' && (
                    <GenericSectionManager
                        key={refreshTrigger}
                        title="Recent Transactions"
                        endpoint="/transactions"
                        icon={Icon}
                        columns={[
                            { label: 'Member', key: 'member_name', render: r => <span className="font-bold text-slate-700">{r.member_name}</span> },
                            { label: 'Book', key: 'book_title' },
                            { label: 'Issue Date', key: 'issue_date', render: r => new Date(r.issue_date).toLocaleDateString() },
                            { label: 'Due Date', key: 'due_date', render: r => <span className={new Date(r.due_date) < new Date() && r.status === 'issued' ? 'text-rose-500 font-bold' : ''}>{new Date(r.due_date).toLocaleDateString()}</span> },
                            { label: 'Status', key: 'status', render: r => <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'returned' ? 'bg-emerald-100 text-emerald-600' : r.status === 'overdue' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>{r.status}</span> }
                        ]}
                        onAdd={() => openActionModal({
                            title: 'Issue Book',
                            endpoint: '/transactions/issue',
                            fields: [
                                { name: 'member_id', label: 'Member ID', required: true, type: 'number' },
                                { name: 'book_id', label: 'Book ID', required: true, type: 'number' },
                                { name: 'due_date', label: 'Due Date', type: 'date', required: true }
                            ]
                        })}
                    />
                )}

                {node.type === 'Membership Management' && (
                    <GenericSectionManager
                        key={refreshTrigger}
                        title="Member Directory"
                        endpoint="/members"
                        icon={Icon}
                        columns={[
                            { label: 'Name', key: 'name', render: r => <span className="font-bold text-slate-800">{r.name}</span> },
                            { label: 'Email', key: 'email' },
                            { label: 'Type', key: 'membership_type', render: r => <span className="capitalize px-2 py-0.5 bg-slate-100 rounded text-xs font-bold">{r.membership_type}</span> },
                            { label: 'Status', key: 'status', render: r => <span className={`uppercase font-bold text-[10px] ${r.status === 'active' ? 'text-emerald-600' : 'text-rose-500'}`}>{r.status}</span> }
                        ]}
                        onAdd={() => openActionModal({
                            title: 'Add New Member',
                            endpoint: '/members',
                            fields: [
                                { name: 'name', label: 'Full Name', required: true },
                                { name: 'email', label: 'Email Address', type: 'email', required: true },
                                { name: 'phone', label: 'Phone Number' },
                                { name: 'membership_type', label: 'Type', type: 'select', options: [{ label: 'Student', value: 'student' }, { label: 'Faculty', value: 'faculty' }, { label: 'Public', value: 'public' }], required: true }
                            ]
                        })}
                        onEdit={(item) => handleEdit(item, '/members', [
                            { name: 'name', label: 'Full Name', required: true },
                            { name: 'email', label: 'Email Address', type: 'email', required: true },
                            { name: 'phone', label: 'Phone Number' },
                            { name: 'membership_type', label: 'Type', type: 'select', options: [{ label: 'Student', value: 'student' }, { label: 'Faculty', value: 'faculty' }, { label: 'Public', value: 'public' }], required: true },
                            { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
                        ])}
                        onDelete={(item) => handleDelete(item, '/members')}
                    />
                )}

                {node.type === 'Fine Management' && (
                    <GenericSectionManager
                        key={refreshTrigger}
                        title="Active Fines"
                        endpoint="/transactions"
                        dataFilter={(data) => data.filter(t => t.fine_amount > 0 || t.status === 'overdue')}
                        icon={Icon}
                        columns={[
                            { label: 'Member', key: 'member_name', render: r => <span className="font-bold text-slate-700">{r.member_name}</span> },
                            { label: 'Book', key: 'book_title' },
                            { label: 'Due Date', key: 'due_date', render: r => new Date(r.due_date).toLocaleDateString() },
                            { label: 'Fine Amount', key: 'fine_amount', render: r => <span className="text-rose-600 font-bold">${r.fine_amount || '0.00'}</span> },
                            { label: 'Status', key: 'status', render: r => <span className="uppercase text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded">{r.status}</span> }
                        ]}
                    />
                )}

                {node.type === 'Inventory Control' && (
                    <GenericSectionManager
                        key={refreshTrigger}
                        title="Full Catalog"
                        endpoint="/books"
                        icon={Icon}
                        columns={[
                            { label: 'Title', key: 'title', render: r => <span className="font-bold text-slate-800">{r.title}</span> },
                            { label: 'Author', key: 'author' },
                            { label: 'ISBN', key: 'isbn' },
                            { label: 'Format', key: 'format', render: r => <span className="capitalize">{r.format}</span> },
                            { label: 'Status', key: 'status', render: r => <span className={`uppercase font-bold text-[10px] px-2 py-0.5 rounded ${r.status === 'available' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100'}`}>{r.status}</span> }
                        ]}
                        onAdd={() => openActionModal({
                            title: 'Add Inventory Item',
                            endpoint: '/books',
                            fields: [
                                { name: 'title', label: 'Title', required: true },
                                { name: 'author', label: 'Author', required: true },
                                { name: 'isbn', label: 'ISBN', required: true },
                                { name: 'category', label: 'Category' },
                                { name: 'format', label: 'Format', type: 'select', options: [{ label: 'Hardcover', value: 'hardcover' }, { label: 'Paperback', value: 'paperback' }], defaultValue: 'hardcover' }
                            ]
                        })}
                        onEdit={(item) => handleEdit(item, '/books', [
                            { name: 'title', label: 'Title', required: true },
                            { name: 'author', label: 'Author', required: true },
                            { name: 'isbn', label: 'ISBN', required: true },
                            { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Available', value: 'available' }, { label: 'Maintenance', value: 'maintenance' }, { label: 'Lost', value: 'lost' }] }
                        ])}
                        onDelete={(item) => handleDelete(item, '/books')}
                    />
                )}

                {node.type === 'User Services' && <UserServicesDashboard node={node} />}

                {node.type === 'Reading Rooms' && (
                    <GenericSectionManager
                        key={refreshTrigger}
                        title="Reading Rooms"
                        endpoint="/user-services/reading-rooms"
                        icon={Icon}
                        columns={[
                            { label: 'Room Name', key: 'name', render: r => <span className="font-bold text-slate-700">{r.name}</span> },
                            { label: 'Capacity', key: 'capacity' },
                            {
                                label: 'Available', key: 'available_seats', render: r => (
                                    <div className="w-24">
                                        <div className="text-xs font-bold mb-1 flex justify-between"><span>{r.available_seats}</span> <span className="text-slate-300">/ {r.capacity}</span></div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(r.available_seats / r.capacity) * 100}%` }}></div>
                                        </div>
                                    </div>
                                )
                            },
                            { label: 'Timings', key: 'timings' },
                            { label: 'Status', key: 'status', render: r => <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{r.status}</span> }
                        ]}
                        onAdd={() => openActionModal({
                            title: 'Add Reading Room',
                            endpoint: '/user-services/reading-rooms',
                            fields: [
                                { name: 'name', label: 'Room Name', required: true, placeholder: 'e.g. Main Hall' },
                                { name: 'capacity', label: 'Seating Capacity', type: 'number', required: true, placeholder: 'e.g. 50' },
                                { name: 'timings', label: 'Oper. Timings', placeholder: 'e.g. 9AM - 8PM' },
                                { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Open', value: 'open' }, { label: 'Maintenance', value: 'maintenance' }, { label: 'Closed', value: 'closed' }], required: true }
                            ]
                        })}
                        onEdit={(item) => handleEdit(item, '/user-services/reading-rooms', [
                            { name: 'name', label: 'Room Name', required: true },
                            { name: 'capacity', label: 'Seating Capacity', type: 'number', required: true },
                            { name: 'timings', label: 'Oper. Timings' },
                            { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Open', value: 'open' }, { label: 'Maintenance', value: 'maintenance' }, { label: 'Closed', value: 'closed' }], required: true }
                        ])}
                        onDelete={(item) => handleDelete(item, '/user-services/reading-rooms')}
                    />
                )}

                {node.type === 'Reservation System' && (
                    <GenericSectionManager
                        key={refreshTrigger}
                        title="Book Reservations"
                        endpoint="/user-services/reservations"
                        icon={Icon}
                        columns={[
                            { label: 'Book', key: 'book_title', render: r => <span className="font-bold text-slate-800">{r.book_title}</span> },
                            { label: 'Member', key: 'member_name' },
                            { label: 'Reserved On', key: 'reservation_date', render: r => new Date(r.reservation_date).toLocaleDateString() },
                            {
                                label: 'Status', key: 'status', render: r => (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'reserved' ? 'bg-amber-100 text-amber-600' :
                                        r.status === 'collected' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>{r.status}</span>
                                )
                            }
                        ]}
                        onAdd={() => openActionModal({
                            title: 'New Reservation',
                            endpoint: '/user-services/reservations',
                            fields: [
                                { name: 'member_id', label: 'Member ID', required: true, placeholder: 'Enter Member ID' },
                                { name: 'book_title', label: 'Book Title', required: true, placeholder: 'Book to reserve' },
                                { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Reserved', value: 'reserved' }, { label: 'Collected', value: 'collected' }], defaultValue: 'reserved' }
                            ]
                        })}
                        onEdit={(item) => handleEdit(item, '/user-services/reservations', [
                            { name: 'member_id', label: 'Member ID', required: true },
                            { name: 'book_title', label: 'Book Title', required: true },
                            { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Reserved', value: 'reserved' }, { label: 'Collected', value: 'collected' }] }
                        ])}
                        onDelete={(item) => handleDelete(item, '/user-services/reservations')}
                    />
                )}

                {node.type === 'Help Desk' && (
                    <GenericSectionManager
                        key={refreshTrigger}
                        title="Help Desk Tickets"
                        endpoint="/user-services/help-desk"
                        icon={Icon}
                        columns={[
                            { label: 'Type', key: 'query_type', render: r => <span className="capitalize font-bold text-slate-700">{r.query_type.replace('_', ' ')}</span> },
                            { label: 'Description', key: 'description' },
                            { label: 'Submitted By', key: 'submitted_by' },
                            {
                                label: 'Status', key: 'status', render: r => (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'open' ? 'bg-blue-100 text-blue-600' :
                                        r.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>{r.status}</span>
                                )
                            }
                        ]}
                        onAdd={() => openActionModal({
                            title: 'Open Ticket',
                            endpoint: '/user-services/help-desk',
                            fields: [
                                { name: 'member_id', label: 'Member ID', required: true, placeholder: 'Internal ID' },
                                { name: 'query_type', label: 'Category', type: 'select', options: [{ label: 'General', value: 'general' }, { label: 'Fine Dispute', value: 'fine_dispute' }, { label: 'Lost Book', value: 'lost_book' }], required: true },
                                { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the issue...' },
                                { name: 'status', label: 'Initial Status', type: 'select', options: [{ label: 'Open', value: 'open' }, { label: 'Resolved', value: 'resolved' }], defaultValue: 'open' }
                            ]
                        })}
                        onEdit={(item) => handleEdit(item, '/user-services/help-desk', [
                            { name: 'member_id', label: 'Member ID', required: true },
                            { name: 'query_type', label: 'Category', type: 'select', options: [{ label: 'General', value: 'general' }, { label: 'Fine Dispute', value: 'fine_dispute' }, { label: 'Lost Book', value: 'lost_book' }], required: true },
                            { name: 'description', label: 'Description', type: 'textarea', required: true },
                            { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Open', value: 'open' }, { label: 'Resolved', value: 'resolved' }] }
                        ])}
                        onDelete={(item) => handleDelete(item, '/user-services/help-desk')}
                    />
                )}

                {(!node.children || node.children.length === 0) && !['Shelf', 'Category', 'Book Format', 'Periodicals Unit', 'Digital Resources', 'Reference Unit', 'Issue & Return Desk', 'Membership Management', 'Fine Management', 'Inventory Control', 'Reading Rooms', 'Reservation System', 'Help Desk', 'User Services', 'Section', 'Sections'].includes(node.type) && (
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                            <h3 className="font-bold text-slate-800 text-lg">Items in {node.name}</h3>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                            <div className="bg-slate-50 p-6 rounded-full mb-4">
                                <Icon className="text-slate-300" size={48} />
                            </div>
                            <h4 className="text-lg font-bold text-slate-700">No items yet</h4>
                            <button onClick={() => setIsModalOpen(true)} className="mt-6 px-5 py-2.5 bg-primary-50 text-primary-600 rounded-xl font-bold text-sm hover:bg-primary-100 transition-colors">
                                Create First Item
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AddNodeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                parentNode={node}
                onSave={async (newNode) => {
                    try {
                        await api.post('/nodes', newNode);
                        const res = await api.get(`/nodes/${id}`);
                        setNode(res.data);
                        setIsModalOpen(false);
                    } catch (err) {
                        console.error(err);
                        alert('Failed to create node');
                    }
                }}
            />

            <GenericFormModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal({ ...actionModal, isOpen: false })}
                title={actionModal.config?.title || 'Create New'}
                fields={actionModal.config?.fields || []}
                onSubmit={handleActionSubmit}
                loading={actionLoading}
                initialValues={actionModal.config?.initialValues}
            />

            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={confirmModal.isDangerous}
            />
        </div>
    );
};

export default NodeDashboard;
