import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash, Edit, Filter, MoreHorizontal, Inbox, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../api/api';
import { motion } from 'framer-motion';

const GenericSectionManager = ({
    title,
    endpoint,
    columns,
    onAdd,
    onEdit,
    onDelete,
    dataFilter,
    icon: Icon
}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(endpoint);
                const fetchedData = res.data;
                setData(dataFilter ? dataFilter(fetchedData) : fetchedData);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [endpoint, retry]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-full relative"
        >
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-slate-100 flex flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                    <div className="bg-slate-50 p-1.5 rounded-lg text-slate-500 border border-slate-100">
                        <Icon size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-sm tracking-tight">{title}</h3>
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500">{data.length}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group hidden sm:block">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-8 pr-3 py-1.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 focus:bg-white focus:ring-2 focus:ring-primary-100 outline-none w-28 focus:w-40 transition-all border border-transparent focus:border-primary-200"
                        />
                    </div>
                    {onAdd && (
                        <button
                            onClick={onAdd}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
                        >
                            <Plus size={14} strokeWidth={3} />
                            <span className="hidden sm:inline">Add</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-x-auto custom-scrollbar">
                {loading ? (
                    <div className="p-8 text-center flex flex-col items-center">
                        <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-3"></div>
                        <p className="text-slate-400 text-xs font-bold animate-pulse">Loading...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in h-64">
                        <div className="bg-rose-50 p-4 rounded-full mb-3">
                            <AlertCircle size={32} className="text-rose-500" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">Unable to load data</h4>
                        <p className="text-xs text-slate-500 max-w-xs mb-4 opacity-80">{error}</p>
                        <button
                            onClick={() => setRetry(r => r + 1)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                        >
                            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                            Retry Connection
                        </button>
                    </div>
                ) : data.length === 0 ? (
                    <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                            <Inbox size={32} className="text-slate-300" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700">No records found</h4>
                        <p className="text-slate-400 text-xs mt-1">Start by adding a new item.</p>
                        {onAdd && (
                            <button onClick={onAdd} className="mt-4 text-primary-600 font-bold text-xs hover:underline">
                                + Create New
                            </button>
                        )}
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 backdrop-blur-sm z-10">
                                {columns.map((col, i) => (
                                    <th key={i} className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{col.label}</th>
                                ))}
                                <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.map((row, i) => (
                                <tr key={i} className="group hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors">
                                    {columns.map((col, j) => (
                                        <td key={j} className="px-4 py-2 text-xs font-semibold text-slate-600 truncate max-w-[200px]" title={row[col.key]}>
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                    <td className="px-4 py-2 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                >
                                                    <Edit size={12} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(row)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                                >
                                                    <Trash size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="h-0.5 bg-gradient-to-r from-slate-200 via-slate-100 to-transparent"></div>
        </motion.div>
    );
};

export default GenericSectionManager;
