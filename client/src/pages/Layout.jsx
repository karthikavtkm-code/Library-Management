import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, Bell, HelpCircle, Settings, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    return (
        <div className="flex bg-[#f8fafc] min-h-screen font-inter">
            {/* Sidebar with responsive handling */}
            <div className={`
                fixed inset-y-0 left-0 z-30 transition-all duration-300 transform 
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:relative lg:translate-x-0 
                ${collapsed ? 'lg:w-20' : 'lg:w-72'}
                w-72 lg:w-auto
            `}>
                <Sidebar
                    collapsed={collapsed}
                    onToggle={(val) => setCollapsed(val)}
                    onMobileClose={() => setMobileMenuOpen(false)}
                />
            </div>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}

            <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-10 px-4 md:px-8 flex items-center justify-between shadow-sm gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>

                        {!collapsed && <div className="hidden lg:block opacity-0">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">BiblioFlow</h2>
                        </div>}

                        <div className="relative w-full max-w-md group hidden sm:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search books..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        <button className="sm:hidden p-2 text-slate-400 hover:text-primary-600 bg-slate-50 rounded-xl">
                            <Search size={20} />
                        </button>

                        <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white hover:shadow-sm rounded-xl transition-all relative group">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
                            </button>
                        </div>

                        <div className="h-8 w-[1px] bg-slate-200 mx-1 md:mx-2"></div>

                        <div className="flex items-center gap-3 pl-1 group">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-800 leading-none">{user?.username}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{user?.role}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                <LogOut size={14} />
                                <span className="hidden md:block">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-3 md:p-6 pb-12 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                    <div className="w-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
