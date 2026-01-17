import React, { useState, useEffect } from 'react';
import { Layers, Plus, Book, Edit, Trash2, X, Search } from 'lucide-react';
import api from '../../api/api';
import GenericFormModal from '../modals/GenericFormModal';
import StatusModal from '../modals/StatusModal';
import ConfirmationModal from '../modals/ConfirmationModal';

const ShelfManager = () => {
    const [shelves, setShelves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingShelf, setEditingShelf] = useState(null);
    const [viewingBooks, setViewingBooks] = useState(null); // Shelf ID or null
    const [shelfBooks, setShelfBooks] = useState([]);

    // For Feedback
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDangerous: false });

    // For Book Actions
    const [actionModal, setActionModal] = useState({ isOpen: false, config: null });
    const [actionLoading, setActionLoading] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        floor: '',
        block: '',
        capacity: '',
        status: 'available'
    });

    useEffect(() => {
        fetchShelves();
    }, []);

    const fetchShelves = async () => {
        try {
            const res = await api.get('/sections/shelves');
            setShelves(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchShelfBooks = async (shelfId) => {
        try {
            const res = await api.get(`/sections/shelves/${shelfId}/books`);
            setShelfBooks(res.data);
            setViewingBooks(shelfId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleActionSubmit = async (data) => {
        setActionLoading(true);
        try {
            const payload = { ...data, shelf_id: viewingBooks }; // Ensure shelf_id is correct
            await api.post('/books', payload);

            // Refresh books
            if (viewingBooks) fetchShelfBooks(viewingBooks);

            // Update shelves count if needed (optional, effectively requires refetching shelves)
            fetchShelves();

            setActionModal({ isOpen: false, config: null });
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Book Added',
                message: 'The book has been successfully assigned to this shelf.'
            });
        } catch (err) {
            console.error(err);
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Action Failed',
                message: err.response?.data?.error || err.message || 'Failed to add book.'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenModal = (shelf = null) => {
        if (shelf) {
            setEditingShelf(shelf);
            setFormData({
                code: shelf.code,
                name: shelf.name,
                floor: shelf.floor,
                block: shelf.block,
                capacity: shelf.capacity,
                status: shelf.status
            });
        } else {
            setEditingShelf(null);
            setFormData({
                code: '',
                name: '',
                floor: '',
                block: '',
                capacity: '',
                status: 'available'
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingShelf) {
                await api.put(`/sections/shelves/${editingShelf.id}`, formData);
            } else {
                await api.post('/sections/shelves', formData);
            }
            setShowModal(false);
            fetchShelves();
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: editingShelf ? 'Shelf Updated' : 'Shelf Created',
                message: 'Shelf configuration has been saved.'
            });
        } catch (err) {
            console.error(err);
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Save Failed',
                message: 'Could not save shelf details.'
            });
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Shelf',
            message: 'Are you sure you want to delete this shelf? All books assigned to it will be unassigned or deleted.',
            isDangerous: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/sections/shelves/${id}`);
                    fetchShelves();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setStatusModal({ isOpen: true, type: 'success', title: 'Shelf Deleted', message: 'Shelf has been removed.' });
                } catch (err) {
                    console.error(err);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setStatusModal({ isOpen: true, type: 'error', title: 'Delete Failed', message: err.response?.data?.error || 'Error deleting shelf' });
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Shelf List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Shelf Management</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{shelves.length} Shelves</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add Shelf</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <th className="px-8 py-4">Code</th>
                                <th className="px-8 py-4">Name</th>
                                <th className="px-8 py-4">Location</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-center">Capacity</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {shelves.map((shelf) => (
                                <tr key={shelf.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-4 font-bold text-slate-700">{shelf.code}</td>
                                    <td className="px-8 py-4 text-sm font-medium text-slate-600">{shelf.name}</td>
                                    <td className="px-8 py-4 text-sm text-slate-500">{shelf.floor && `Floor ${shelf.floor}`} {shelf.block && `• Block ${shelf.block}`}</td>
                                    <td className="px-8 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${shelf.status === 'available' ? 'bg-emerald-100 text-emerald-600' :
                                            shelf.status === 'full' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                            {shelf.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs font-bold text-slate-600">{shelf.current_count || 0} / {shelf.capacity}</span>
                                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${(shelf.current_count / shelf.capacity) > 0.9 ? 'bg-rose-500' : 'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${Math.min((shelf.current_count / shelf.capacity) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => fetchShelfBooks(shelf.id)}
                                                className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="View Books"
                                            >
                                                <Book size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(shelf)}
                                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(shelf.id)}
                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Books List Section (Drill Down) */}
            {viewingBooks && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            <Book size={18} className="text-indigo-500" />
                            Books on {shelves.find(s => s.id === viewingBooks)?.code}
                        </h4>
                        <button onClick={() => setViewingBooks(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="px-8 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Filter books..."
                                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-500 w-48"
                            />
                        </div>
                        <button
                            onClick={() => setActionModal({
                                isOpen: true,
                                config: {
                                    title: 'Add Book to Shelf',
                                    fields: [
                                        { name: 'title', label: 'Book Title', required: true, placeholder: 'Complete Title' },
                                        { name: 'author', label: 'Author', required: true, placeholder: 'Author Name' },
                                        { name: 'isbn', label: 'ISBN', required: true, placeholder: 'ISBN-13' },
                                        { name: 'category', label: 'Category', required: true, placeholder: 'Fiction, Sci-Fi...' },
                                        { name: 'shelf_id', label: 'Shelf ID', type: 'hidden', defaultValue: viewingBooks } // We handle this in submit
                                    ],
                                    endpoint: '/books'
                                }
                            })}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            <Plus size={14} /> Add Book
                        </button>
                    </div>

                    {shelfBooks.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-8 py-3">Title</th>
                                        <th className="px-8 py-3">Author</th>
                                        <th className="px-8 py-3">Category</th>
                                        <th className="px-8 py-3">Status</th>
                                        <th className="px-8 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {shelfBooks.map(book => (
                                        <tr key={book.id}>
                                            <td className="px-8 py-3 text-sm font-bold text-slate-700">{book.title}</td>
                                            <td className="px-8 py-3 text-sm text-slate-600">{book.author}</td>
                                            <td className="px-8 py-3 text-sm text-slate-500">{book.category || '-'}</td>
                                            <td className="px-8 py-3">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${book.status === 'issued' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                                                    }`}>{book.status || 'Available'}</span>
                                            </td>
                                            <td className="px-8 py-3 text-right">
                                                <button className="text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-10 text-center text-slate-400">
                            No books assigned to this shelf yet.
                        </div>
                    )}
                </div>
            )
            }


            {/* Generic Action Modal for Books */}
            <GenericFormModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal({ ...actionModal, isOpen: false })}
                title={actionModal.config?.title || 'Action'}
                fields={actionModal.config?.fields || []}
                onSubmit={handleActionSubmit}
                loading={actionLoading}
            />

            {/* Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 animate-in zoom-in duration-200">
                            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                {editingShelf ? 'Edit Shelf' : 'Add New Shelf'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Shelf Code</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                                            placeholder="e.g. A-101"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Science Fiction"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Floor</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700"
                                            value={formData.floor}
                                            onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                            placeholder="e.g. 2nd"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Block</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700"
                                            value={formData.block}
                                            onChange={e => setFormData({ ...formData, block: e.target.value })}
                                            placeholder="e.g. West Wing"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capacity</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700"
                                            value={formData.capacity}
                                            onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                        <select
                                            className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="available">Available</option>
                                            <option value="full">Full</option>
                                            <option value="maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                                    >
                                        {editingShelf ? 'Save Changes' : 'Create Shelf'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
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

export default ShelfManager;
