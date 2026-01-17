import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import {
    Users,
    BookOpen,
    Calendar,
    HelpCircle,
    AlertTriangle,
    CheckCircle,
    Clock,
    ArrowRight,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const SubServiceCard = ({ title, icon: Icon, color, onClick, status, children }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full bg-gradient-to-b from-white to-slate-50/30"
    >
        <div className="flex justify-between items-start mb-3">
            <div className={`p-2.5 rounded-lg ${color} text-white shadow-sm`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            {status && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${status.color} border border-current opacity-80`}>
                    {status.text}
                </span>
            )}
        </div>
        <h3 className="font-bold text-slate-800 text-sm mb-1">{title}</h3>
        <p className="text-slate-500 text-xs leading-relaxed mb-4 flex-1">{children}</p>
        <div className="flex items-center text-primary-600 font-bold text-xs group">
            Manage <ArrowRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
    </motion.div>
);

const SummaryCard = ({ label, value, icon: Icon, trend, color }) => (
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:text-${color}-500 transition-colors`}>
            <Icon size={16} />
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <div className="flex items-end gap-2">
                <h4 className="text-lg font-black text-slate-800 leading-none">{value}</h4>
                {trend && (
                    <span className={`text-[9px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
        </div>
    </div>
);

const AlertItem = ({ type, message, time }) => {
    const colors = {
        warning: 'text-amber-600 bg-amber-50',
        error: 'text-rose-600 bg-rose-50',
        info: 'text-blue-600 bg-blue-50'
    };
    const icons = {
        warning: AlertTriangle,
        error: AlertTriangle,
        info: Clock
    };
    const Icon = icons[type];

    return (
        <div className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <div className={`p-1.5 rounded-md h-fit ${colors[type]}`}>
                <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 mb-0.5 truncate">{message}</p>
                <p className="text-[10px] text-slate-400 italic">{time}</p>
            </div>
        </div>
    );
};

const UserServicesDashboard = ({ node }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        reservations: 0,
        tickets: 0,
        seats: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Parallel fetch for efficiency
                const [resRes, resHelp, resRooms, resActivity] = await Promise.all([
                    api.get('/user-services/reservations'),
                    api.get('/user-services/help-desk'),
                    api.get('/user-services/reading-rooms'),
                    api.get('/user-services/activity')
                ]);

                // Calculate simple stats
                const activeRes = resRes.data.filter(r => r.status === 'reserved').length;
                const openTickets = resHelp.data.filter(t => t.status === 'open').length;
                const totalSeats = resRooms.data.reduce((acc, r) => acc + (r.capacity - r.available_seats), 0);

                setStats({ reservations: activeRes, tickets: openTickets, seats: totalSeats });
                setRecentActivity(resActivity.data.slice(0, 5));
            } catch (err) {
                console.error("Stats fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Find children IDs for navigation
    const getChildId = (type) => node.children?.find(c => c.type === type)?.id;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">

            {/* Top Row: Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCard label="Active Users" value={recentActivity.length * 12} icon={Users} trend={5.2} color="blue" />
                <SummaryCard label="Books Issued" value={142} icon={BookOpen} trend={2.1} color="indigo" />
                <SummaryCard label="Active Reservations" value={stats.reservations} icon={Calendar} trend={-1.5} color="amber" />
                <SummaryCard label="Open Tickets" value={stats.tickets} icon={HelpCircle} trend={0} color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Col: Service Modules */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Service Modules</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SubServiceCard
                            title="Reading Rooms"
                            icon={BookOpen}
                            color="bg-emerald-500"
                            onClick={() => { const id = getChildId('Reading Rooms'); if (id) navigate(`/node/${id}`); }}
                            status={{ text: `${stats.seats} Active`, color: 'text-emerald-600 bg-emerald-50' }}
                        >
                            Monitor occupancy, manage seating value, and update room statuses in real-time.
                        </SubServiceCard>

                        <SubServiceCard
                            title="Reservation System"
                            icon={Calendar}
                            color="bg-amber-500"
                            onClick={() => { const id = getChildId('Reservation System'); if (id) navigate(`/node/${id}`); }}
                            status={{ text: `${stats.reservations} Pending`, color: 'text-amber-600 bg-amber-50' }}
                        >
                            Track book reservations, manage queues, and handle collection notices.
                        </SubServiceCard>

                        <SubServiceCard
                            title="Help Desk"
                            icon={HelpCircle}
                            color="bg-rose-500"
                            onClick={() => { const id = getChildId('Help Desk'); if (id) navigate(`/node/${id}`); }}
                            status={{ text: `${stats.tickets} New`, color: 'text-rose-600 bg-rose-50' }}
                        >
                            Resolve member queries, manage tickets, and track support resolution times.
                        </SubServiceCard>

                        <SubServiceCard
                            title="User Activity"
                            icon={Activity}
                            color="bg-blue-500"
                            onClick={() => {/* Maybe specific route or just showing table below */ }}
                        >
                            View comprehensive logs of member interactions, fines, and borrowing history.
                        </SubServiceCard>
                    </div>

                    {/* Compact Activity Table */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mt-2">
                        <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 text-xs">Recent Member Activity</h3>
                            <button className="text-[10px] font-bold text-primary-600 hover:underline">View All</button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 text-[9px] font-bold text-slate-400 uppercase">Member</th>
                                    <th className="px-4 py-2 text-[9px] font-bold text-slate-400 uppercase">Issued</th>
                                    <th className="px-4 py-2 text-[9px] font-bold text-slate-400 uppercase">Reserved</th>
                                    <th className="px-4 py-2 text-[9px] font-bold text-slate-400 uppercase text-right">Fines</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentActivity.map(member => (
                                    <tr key={member.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-2">
                                            <p className="text-xs font-bold text-slate-700">{member.name}</p>
                                            <p className="text-[9px] text-slate-400">{member.membership_type}</p>
                                        </td>
                                        <td className="px-4 py-2 text-xs font-medium text-slate-600">{member.books_issued}</td>
                                        <td className="px-4 py-2 text-xs font-medium text-slate-600">{member.books_reserved}</td>
                                        <td className="px-4 py-2 text-xs font-bold text-right text-rose-500">${member.pending_fines}</td>
                                    </tr>
                                ))}
                                {recentActivity.length === 0 && (
                                    <tr><td colSpan="4" className="text-center py-4 text-xs text-slate-400">No recent activity</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Col: Alerts & Notices */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Alerts</h3>
                    <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm space-y-1">
                        <AlertItem type="warning" message="Reading Room A is at 95% capacity" time="10 mins ago" />
                        <AlertItem type="error" message="5 Reservations expiring today" time="2 hours ago" />
                        <AlertItem type="info" message="System maintenance scheduled" time="Tomorrow, 10 PM" />
                        <AlertItem type="warning" message="Member #4022 exceeded fine limit" time="Yesterday" />
                    </div>

                    {/* Mini Calendar/Schedule or Quick Graphic */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-lg flex flex-col items-center text-center">
                        <Clock size={24} className="mb-2 opacity-80" />
                        <h4 className="font-bold text-sm mb-1">Library Hours</h4>
                        <p className="text-xs text-slate-400 mb-3">Today: 9:00 AM - 8:00 PM</p>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 w-2/3 h-full rounded-full"></div>
                        </div>
                        <p className="text-[9px] text-emerald-400 mt-2 font-bold uppercase tracking-wider">Currently Open</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserServicesDashboard;
