import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Search, Filter, ArrowRightLeft, Calendar, User, CheckCircle2, Clock, Trash2, Edit2, X } from 'lucide-react';

const LibraryOperations = () => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [books, setBooks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);

    // Form States
    const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', category: '' });
    const [issueData, setIssueData] = useState({ book_id: '', user_id: '', due_date: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
        fetchMembers();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const [booksRes, transRes] = await Promise.all([
                axios.get('http://localhost:5000/api/books', config),
                axios.get('http://localhost:5000/api/transactions', config)
            ]);
            setBooks(booksRes.data);
            setTransactions(transRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const response = await axios.get('http://localhost:5000/api/members', config);
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post('http://localhost:5000/api/books', newBook, config);
            setShowAddModal(false);
            setNewBook({ title: '', author: '', isbn: '', category: '' });
            fetchData();
        } catch (error) {
            console.error('Error adding book:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleIssueBook = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post('http://localhost:5000/api/transactions/issue', issueData, config);
            setShowIssueModal(false);
            setIssueData({ book_id: '', user_id: '', due_date: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error issuing book');
        }
    };

    const handleReturnBook = async (transactionId) => {
        if (window.confirm('Mark this book as returned?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                await axios.post('http://localhost:5000/api/transactions/return', { transaction_id: transactionId }, config);
                fetchData();
            } catch (error) {
                console.error('Error returning book:', error);
            }
        }
    };

    const handleDeleteBook = async (id) => {
        if (window.confirm('Delete this book?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                await axios.delete(`http://localhost:5000/api/books/${id}`, config);
                fetchData();
            } catch (error) {
                console.error('Error deleting book:', error);
            }
        }
    };

    const openIssueModal = (book) => {
        setIssueData({ ...issueData, book_id: book.id });
        setShowIssueModal(true);
    };

    if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Loading operations...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Library Operations</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage book inventory and lending activities.</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto max-w-full">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-4 md:px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-white text-primary-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`px-4 md:px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'transactions' ? 'bg-white text-primary-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Issue/Return
                    </button>
                </div>
            </div>

            {activeTab === 'inventory' ? (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        <div className="flex-1 relative group bg-white rounded-2xl">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search books..."
                                className="w-full bg-transparent border border-slate-200 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm shadow-sm"
                            />
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-700 transition-all font-bold whitespace-nowrap shadow-lg shadow-primary-500/20 active:scale-95"
                        >
                            <Plus size={18} />
                            Add New Book
                        </button>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {books.map((book) => (
                            <div key={book.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-primary-100/50 rounded-xl text-primary-600">
                                            <BookOpen size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{book.title}</p>
                                            <p className="text-xs text-slate-500">{book.author}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${book.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${book.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                        {book.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                    <div className="text-xs font-mono text-slate-400">{book.isbn}</div>
                                    <div className="flex items-center gap-2">
                                        {book.status === 'available' && (
                                            <button
                                                onClick={() => openIssueModal(book)}
                                                className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-bold hover:bg-primary-600 hover:text-white transition-all uppercase tracking-wide"
                                            >
                                                Issue
                                            </button>
                                        )}
                                        <button className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBook(book.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100/50">
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Book Information</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Metadata</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Availability</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {books.map((book) => (
                                    <tr key={book.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-primary-100/50 rounded-2xl text-primary-600 transition-transform group-hover:scale-110">
                                                    <BookOpen size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{book.title}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{book.author}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-mono text-slate-400">{book.isbn}</p>
                                            <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase tracking-wide">
                                                {book.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${book.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${book.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                {book.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {book.status === 'available' && (
                                                    <button
                                                        onClick={() => openIssueModal(book)}
                                                        className="px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-xs font-bold hover:bg-primary-600 hover:text-white transition-all"
                                                    >
                                                        Issue Book
                                                    </button>
                                                )}
                                                <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all shadow-sm">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBook(book.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all shadow-sm"
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
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                                <ArrowRightLeft size={80} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Transactions</p>
                            <p className="text-4xl font-black text-slate-800 mt-2">{transactions.length}</p>
                            <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-500 font-bold">
                                <span className="p-1 bg-emerald-100 rounded-md"><Plus size={10} /></span>
                                <span>Recent growth</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                                <Clock size={80} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Loans</p>
                            <p className="text-4xl font-black text-slate-800 mt-2">{transactions.filter(t => t.status === 'active').length}</p>
                            <div className="mt-4 flex items-center gap-2 text-[10px] text-amber-500 font-bold">
                                <span className="p-1 bg-amber-100 rounded-md"><Clock size={10} /></span>
                                <span>Pending returns</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                                <Calendar size={80} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Overdue Items</p>
                            <p className="text-4xl font-black text-rose-500 mt-2">{transactions.filter(t => t.status === 'overdue').length}</p>
                            <div className="mt-4 flex items-center gap-2 text-[10px] text-rose-500 font-bold">
                                <span className="p-1 bg-rose-100 rounded-md"><Calendar size={10} /></span>
                                <span>Requires attention</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100/50">
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Book & Borrower</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Dates</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.map((trans) => (
                                    <tr key={trans.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <p className="font-bold text-slate-800 text-sm">{trans.book_title}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <User size={10} className="text-slate-400" />
                                                    <span className="text-[11px] text-slate-500 font-medium">{trans.member_name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-center gap-4 text-[11px] font-bold">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-slate-400 uppercase text-[9px]">Issued</span>
                                                    <span className="text-slate-700">{new Date(trans.issue_date).toLocaleDateString()}</span>
                                                </div>
                                                <ArrowRightLeft size={12} className="text-slate-300" />
                                                <div className="flex flex-col items-center">
                                                    <span className="text-slate-400 uppercase text-[9px]">Due</span>
                                                    <span className="text-slate-900">{new Date(trans.due_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${trans.status === 'returned' ? 'bg-emerald-50 text-emerald-600' :
                                                trans.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                {trans.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {trans.status === 'active' && (
                                                <button
                                                    onClick={() => handleReturnBook(trans.id)}
                                                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    Mark Returned
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Book Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800">Add New Resource</h3>
                                <p className="text-slate-400 text-sm mt-1">Register a new book into the library catalog.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddBook} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Title & Identity</label>
                                <div className="grid grid-cols-1 gap-4">
                                    <input
                                        required
                                        type="text"
                                        placeholder="Book Title"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-slate-700"
                                        value={newBook.title}
                                        onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            required
                                            type="text"
                                            placeholder="Author"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-slate-700"
                                            value={newBook.author}
                                            onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="ISBN-13"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-mono font-bold text-slate-700 uppercase"
                                            value={newBook.isbn}
                                            onChange={e => setNewBook({ ...newBook, isbn: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Classification</label>
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-slate-700 appearance-none"
                                    value={newBook.category}
                                    onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    <option value="Fiction">Fiction</option>
                                    <option value="Science">Science</option>
                                    <option value="Classic">Classic</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Biography">Biography</option>
                                </select>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-4 text-slate-500 bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-500/30 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Adding...' : 'Confirm Addition'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Issue Book Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Issue Book</h3>
                                <p className="text-slate-400 text-xs mt-1">Assign this resource to a library member.</p>
                            </div>
                            <button onClick={() => setShowIssueModal(false)} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleIssueBook} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Member / Borrower</label>
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-slate-700"
                                    value={issueData.user_id}
                                    onChange={e => setIssueData({ ...issueData, user_id: e.target.value })}
                                >
                                    <option value="">Select Member</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.username}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-slate-700"
                                    value={issueData.due_date}
                                    onChange={e => setIssueData({ ...issueData, due_date: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowIssueModal(false)}
                                    className="flex-1 py-4 text-xs font-black uppercase text-slate-500 tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all"
                                >
                                    Confirm Loan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryOperations;
