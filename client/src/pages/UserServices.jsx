import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, History, DollarSign, Search, UserPlus, Mail, Shield, ChevronRight } from 'lucide-react';

const UserServices = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);
    const [history, setHistory] = useState([]);
    const [totalFine, setTotalFine] = useState(0);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const response = await axios.get('http://localhost:5000/api/members', config);
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const response = await axios.get(`http://localhost:5000/api/members/${id}/history`, config);
            setHistory(response.data.history);
            setTotalFine(response.data.totalFine);
            const member = members.find(m => m.id === id);
            setSelectedMember(member);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Loading user services...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">User Services</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage library memberships and view borrowing activities.</p>
                </div>
                <button className="bg-primary-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-primary-700 transition-all font-bold whitespace-nowrap shadow-lg shadow-primary-500/20">
                    <UserPlus size={18} />
                    Register Member
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search members..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm shadow-sm font-medium"
                        />
                    </div>
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                        {members.map(member => (
                            <button
                                key={member.id}
                                onClick={() => fetchHistory(member.id)}
                                className={`w-full flex items-center gap-4 p-5 text-left hover:bg-primary-50/50 transition-all group ${selectedMember?.id === member.id ? 'bg-primary-50/80 border-l-4 border-l-primary-600' : ''}`}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                                    {member.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-800 truncate">{member.username}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-black mt-0.5">Member since {new Date(member.created_at).getFullYear()}</p>
                                </div>
                                <ChevronRight className={`text-slate-300 transition-transform ${selectedMember?.id === member.id ? 'translate-x-1 text-primary-400' : ''}`} size={18} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    {selectedMember ? (
                        <div className="animate-in slide-in-from-right-8 duration-500">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                    <Users size={160} />
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-primary-500/20">
                                        {selectedMember.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{selectedMember.username}</h3>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                <Mail size={12} /> {selectedMember.username.toLowerCase()}@lib.com
                                            </span>
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                <Shield size={12} /> ID: BIB-26-{selectedMember.id}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center md:items-end gap-2">
                                    <span className="px-5 py-2 bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-sm border border-emerald-100">Verified User</span>
                                    <p className="text-[11px] text-slate-400 font-bold">Member for {Math.floor((new Date() - new Date(selectedMember.created_at)) / (1000 * 60 * 60 * 24))} days</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                            <History size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 tracking-tight">Borrowing History</h4>
                                            <p className="text-xs text-slate-400">Past and current book loans</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {history.length > 0 ? (
                                            history.map(item => (
                                                <div key={item.id} className="group p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-white hover:shadow-md transition-all">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-black text-slate-700 leading-tight">{item.book_title}</p>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(item.issue_date).toLocaleDateString()}</span>
                                                            <span className={`w-1 h-1 rounded-full ${item.status === 'returned' ? 'bg-emerald-500' : item.status === 'overdue' ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'returned' ? 'text-emerald-500' : item.status === 'overdue' ? 'text-rose-500' : 'text-blue-500'}`}>{item.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center">
                                                <p className="text-xs text-slate-400 font-medium italic">No historical records found for this member.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="p-5 bg-amber-50 text-amber-600 rounded-[2rem] mb-6 shadow-inner">
                                        <DollarSign size={40} />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Unpaid Dues</h4>
                                    <p className={`text-5xl font-black tracking-tight ${totalFine > 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                                        ${parseFloat(totalFine).toFixed(2)}
                                    </p>
                                    <div className="mt-8 w-full space-y-3">
                                        <button
                                            disabled={totalFine === 0}
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 disabled:opacity-20 disabled:shadow-none transition-all hover:-translate-y-1 active:translate-y-0"
                                        >
                                            Process Payment
                                        </button>
                                        <p className="text-[10px] text-slate-400 font-bold italic">Calculated at $1.00 per day overdue</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] h-full min-h-[500px] flex flex-col items-center justify-center text-slate-300 group">
                            <div className="p-8 bg-slate-50 rounded-full group-hover:scale-110 transition-transform duration-500">
                                <Users size={80} className="opacity-20" />
                            </div>
                            <p className="font-black text-xs uppercase tracking-[0.3em] mt-8">Select a dossier</p>
                            <p className="text-xs mt-2 font-medium">To view detailed member analytics and records.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserServices;
