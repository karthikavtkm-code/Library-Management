import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    LogOut,
    Layers,
    ChevronLeft,
    ChevronRight,
    Library,
    Folder,
    ChevronDown,
    FileText,
    Book
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const getTypeIcon = (type) => {
    switch (type) {
        case 'Library': return <Library size={18} />;
        case 'Section': return <Layers size={18} />;
        case 'Library Operations': return <Settings size={18} />;
        case 'User Services': return <Users size={18} />;
        case 'Shelf': return <BookOpen size={18} />;
        case 'Reference Unit': return <Book size={18} />;
        default: return <Folder size={18} />;
    }
};

const TreeNode = ({ node, depth = 0, collapsed }) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    const location = useLocation();
    const isActive = location.pathname === `/node/${node.id}`;

    // Auto-expand if child is active - simplified logic could go here
    useEffect(() => {
        if (location.pathname.includes(`/node/`)) {
            // To do this strictly we need to know if this node is in the path of the active node
            // For now, let's just keep it simple manual toggle or default collapsed
        }
    }, [location.pathname]);

    if (collapsed) {
        return (
            <div className="relative group">
                <NavLink
                    to={`/node/${node.id}`}
                    className={({ isActive }) =>
                        `flex items-center justify-center p-3 rounded-xl transition-all mb-1 ${isActive ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`
                    }
                    title={node.name}
                >
                    {getTypeIcon(node.type)}
                </NavLink>
            </div>
        );
    }

    return (
        <div className="mb-1 select-none">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all group ${isActive ? 'bg-primary-600/10 text-primary-400' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}>
                {/* Indentation for depth */}
                <div style={{ width: `${depth * 12}px` }} />

                {/* Toggle Button */}
                {hasChildren ? (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setExpanded(!expanded);
                        }}
                        className="p-0.5 hover:bg-slate-700 rounded transition-colors"
                    >
                        <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                ) : (
                    <div className="w-4" /> // Spacer
                )}

                {/* Link Content */}
                <NavLink
                    to={`/node/${node.id}`}
                    className="flex-1 flex items-center gap-3 overflow-hidden"
                >
                    <span className={isActive ? 'text-primary-400' : ''}>
                        {getTypeIcon(node.type)}
                    </span>
                    <span className={`text-sm font-medium truncate ${isActive ? 'text-primary-400 font-bold' : ''}`}>
                        {node.name}
                    </span>
                </NavLink>
            </div>

            {/* Children */}
            {hasChildren && expanded && (
                <div className="mt-1">
                    {node.children.map(child => (
                        <TreeNode key={child.id} node={child} depth={depth + 1} collapsed={collapsed} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Sidebar = ({ collapsed: propCollapsed, onToggle, onMobileClose }) => {
    const { logout, user } = useAuth();
    // Default to prop, but if undefined (legacy), fall back to local state (or just assume false)
    // Actually simplicity: Lifting state up.
    // If prop is provided, use it.
    const [localCollapsed, setLocalCollapsed] = useState(false);
    const collapsed = propCollapsed !== undefined ? propCollapsed : localCollapsed;

    const [tree, setTree] = useState([]);

    useEffect(() => {
        api.get('/nodes')
            .then(res => setTree(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleToggle = () => {
        // If controlled
        if (onToggle) {
            onToggle(!collapsed);
        } else {
            setLocalCollapsed(!localCollapsed);
        }
    };

    return (
        <aside className="w-full h-full bg-[#1e293b] text-slate-300 flex flex-col shadow-2xl relative">
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-500 p-2 rounded-xl shadow-lg shadow-primary-500/20">
                            <Library className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="font-black text-white text-lg leading-none tracking-tight">BiblioFlow</h1>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">LMS Dashboard</p>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div className="bg-primary-500 p-2 rounded-xl mx-auto">
                        <Library className="text-white" size={24} />
                    </div>
                )}

                {/* Mobile Close Button */}
                <button
                    onClick={onMobileClose}
                    className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg absolute right-4 top-5"
                >
                    <ChevronLeft size={24} />
                </button>
            </div>

            {/* Toggle Button (Desktop Only) */}
            <button
                onClick={handleToggle}
                className="hidden lg:flex absolute -right-3 top-20 bg-primary-600 text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Nav Menu */}
            <div className="flex-1 overflow-y-auto py-8 px-3 space-y-1 custom-scrollbar">
                {!collapsed && <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">Main Menu</p>}

                <div className="mb-4">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'hover:bg-slate-800'
                            }`
                        }
                    >
                        <LayoutDashboard size={20} className={collapsed ? "mx-auto" : ""} />
                        {!collapsed && <span className="font-bold text-sm">Overview</span>}
                    </NavLink>
                </div>

                {/* Recursive Tree */}
                {/* Check if we have a root node "Library", if so, we might want to skip it if it's redundant, or show it. 
                    The request shows "Library" as root. 
                */}
                {tree.map(node => (
                    <TreeNode key={node.id} node={node} collapsed={collapsed} />
                ))}
            </div>

            {/* User Profile Info */}
            <div className={`p-4 mx-3 mb-6 bg-slate-800/50 rounded-3xl border border-slate-700/50 transition-all ${collapsed ? 'px-2' : 'p-4'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 min-w-[40px] rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-black shadow-inner">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.username || 'User'}</p>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                <p className="text-[10px] text-slate-500 truncate capitalize font-bold leading-none">{user?.role || 'Member'}</p>
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={logout}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 text-slate-400 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 border border-transparent transition-all font-bold text-xs ${collapsed ? 'px-0' : ''}`}
                >
                    <LogOut size={16} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
