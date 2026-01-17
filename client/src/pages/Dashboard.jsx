import React, { useState, useEffect, useRef } from 'react';
import { Book, Users, Calendar, AlertTriangle, Bell, Activity, Search, MapPin, Database, Share2, HelpCircle, HardDrive, ClipboardList, Wallet, Armchair, Ticket } from 'lucide-react';
import api from '../api/api';
import KpiCard from '../components/KpiCard';
import StatusModal from '../components/modals/StatusModal';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);

    // Status Modal State
    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    const fetchStats = async () => {
        try {
            const response = await api.get('/stats');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await api.get(`/books/search?query=${val}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Close search results on click outside
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
    );

    const { stats, recentTransactions, recentBooks } = data || { stats: {}, recentTransactions: [], recentBooks: [] };

    return (
        <div className="w-full pb-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-x-hidden">

            {/* Header & Global Search */}
            <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md py-3 -mx-4 px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/50">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-none">System Overview</h1>
                    <p className="text-slate-500 font-medium mt-1 text-xs">Consolidated library intelligence and search.</p>
                </div>

                <div className="relative w-full max-w-md" ref={searchRef}>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search books, periodicals, digital resources..."
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                            </div>
                        )}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in zoom-in-95 duration-200">
                            <div className="p-3 bg-slate-50 border-b border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Results</p>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {searchResults.map((item, idx) => (
                                    <div key={idx} className="p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors cursor-pointer group">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-bold text-slate-800 line-clamp-1">{item.title}</p>
                                                <p className="text-xs font-medium text-slate-400">{item.subtitle}</p>
                                            </div>
                                            <span className="shrink-0 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide">
                                                {item.type}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-1.5 text-emerald-600">
                                            <MapPin size={14} />
                                            <span className="text-xs font-black uppercase tracking-wider">{item.location}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Core KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Total Inventory" value={stats.totalBooks} icon={Database} color="bg-slate-900" subtitle="Physical & Digital" />
                <KpiCard title="Active Members" value={stats.activeMembers} icon={Users} color="bg-blue-600" subtitle="Verified users" />
                <KpiCard title="Issued Today" value={stats.issuedToday} icon={Calendar} color="bg-indigo-500" subtitle="Live transactions" />
                <KpiCard title="Overdue Returns" value={stats.overdueReturns} icon={AlertTriangle} color="bg-rose-500" subtitle="Action required" />
            </div>

            {/* Distribution Map & Recent Names */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
                    <div className="relative z-10">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
                            <Activity size={20} className="text-indigo-600" />
                            Distribution Map
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <DistributionItem icon={HardDrive} label="Shelf" count={stats.distribution?.shelf} color="indigo" />
                            <DistributionItem icon={Share2} label="Reference Unit" count={stats.distribution?.reference} color="blue" />
                            <DistributionItem icon={Calendar} label="Periodicals" count={stats.distribution?.periodicals} color="amber" />
                            <DistributionItem icon={Database} label="Digital Resources" count={stats.distribution?.digital} color="emerald" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-5 text-sm">
                        <Book size={20} className="text-emerald-500" />
                        Recent Arrivals
                    </h3>
                    <div className="space-y-4 flex-grow overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                        {recentBooks.map((book, idx) => (
                            <div key={idx} className="group cursor-default">
                                <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">{book.title}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{book.author}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Library Operations Summary */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <ClipboardList size={22} className="text-blue-600" />
                            Library Operations
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <SummaryBox label="Lifetime Transactions" value={stats.operations?.totalTransactions} icon={Activity} color="blue" />
                        <SummaryBox label="Pending Fines" value={`$${stats.operations?.totalFines}`} icon={Wallet} color="rose" />
                    </div>
                    <div className="mt-8">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Live Activity Stream</p>
                        <div className="space-y-4">
                            {recentTransactions.map((t, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <Book size={20} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{t.book_title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{t.member_name}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${t.status === 'overdue' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {t.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User Services Summary */}
                <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <HelpCircle size={22} className="text-indigo-400" />
                                User Services
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6 flex-grow">
                            <ServiceItem icon={Armchair} label="Reading Room Seats" value={stats.services?.availableSeats} subtext="Available now" color="indigo" />
                            <ServiceItem icon={Calendar} label="Active Reservations" value={stats.services?.activeReservations} subtext="Awaiting pickup" color="emerald" />
                            <ServiceItem icon={Ticket} label="Open Support Tickets" value={stats.services?.openTickets} subtext="Pending resolution" color="rose" />
                        </div>

                        <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Help Desk Status</p>
                                    <p className="text-lg font-black mt-1">Operational</p>
                                </div>
                                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Feedback Modal */}
            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />
        </div>
    );
};

const DistributionItem = ({ icon: Icon, label, count, color }) => (
    <div className="flex flex-col items-center text-center group">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 mb-3 bg-${color}-50 text-${color}-600 group-hover:bg-${color}-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={24} />
        </div>
        <p className="text-3xl font-black text-slate-800 tracking-tight">{count || 0}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
);

const SummaryBox = ({ label, value, icon: Icon, color }) => (
    <div className={`p-6 rounded-3xl bg-${color}-50 border border-${color}-100 flex items-center justify-between`}>
        <div>
            <p className={`text-[10px] font-black uppercase tracking-widest text-${color}-600 mb-1`}>{label}</p>
            <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
        <Icon className={`text-${color}-500 opacity-20`} size={32} />
    </div>
);

const ServiceItem = ({ icon: Icon, label, value, subtext, color }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center text-${color}-400 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="font-bold text-slate-200">{label}</p>
                <p className="text-xs font-medium text-slate-500">{subtext}</p>
            </div>
        </div>
        <p className={`text-2xl font-black text-${color}-400`}>{value}</p>
    </div>
);

export default Dashboard;
