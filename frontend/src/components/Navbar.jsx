import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LogOut, User as UserIcon, BookOpen, BarChart3, PlusCircle, Menu, X, Fingerprint, Users, Layout } from 'lucide-react';

const Navbar = ({ user, logout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { to: "/dashboard", icon: <Layout size={18} />, label: "Dashboard" },
        { to: "/exams", icon: <BookOpen size={18} />, label: "Exams" },
        { to: "/results", icon: <BarChart3 size={18} />, label: "Records" },
    ];

    if (user?.role === 'Faculty') {
        navLinks.splice(2, 0, { to: "/create-exam", icon: <PlusCircle size={18} />, label: "Create" });
    }

    if (user?.role === 'Admin') {
        navLinks.push({ to: "/users", icon: <Users size={18} />, label: "Registry" });
        navLinks.push({ to: "/audit", icon: <Fingerprint size={18} />, label: "Forensics" });
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-7xl z-50">
            <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[2rem] shadow-medium px-6 md:px-10 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="bg-accent-dark p-2 rounded-xl group-hover:scale-105 transition-transform duration-500">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-black italic tracking-tighter text-text-main hidden sm:block">
                        SECURE<span className="text-text-muted font-light">NODE</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                {user && (
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2.5 text-xs font-black uppercase tracking-widest ${isActive(link.to)
                                        ? 'bg-accent-dark text-white shadow-medium'
                                        : 'text-text-muted hover:text-text-main hover:bg-page-bg'
                                    }`}
                            >
                                {link.icon}
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="badge-coral items-center gap-2 hidden lg:flex">
                                <div className="w-1.5 h-1.5 bg-accent-coral rounded-full animate-pulse"></div>
                                {user.role} Identity
                            </span>
                            <button
                                onClick={logout}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-sidebar-bg text-text-muted hover:bg-accent-coral/10 hover:text-accent-coral transition-all"
                                title="End Session"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-text-main py-2 px-4 transition-colors">Login</Link>
                            <Link to="/register" className="btn-primary py-2.5 px-6">Join Network</Link>
                        </div>
                    )}

                    {/* Mobile Toggle */}
                    {user && (
                        <button className="md:hidden p-3 text-text-main bg-sidebar-bg rounded-xl" onClick={toggleMenu}>
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {user && isOpen && (
                <div className="md:hidden mt-4 bg-white/95 backdrop-blur-2xl px-6 py-8 rounded-[2.5rem] shadow-medium border border-black/5 animate-slide-up space-y-6">
                    <div className="grid grid-cols-1 gap-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive(link.to)
                                        ? 'bg-accent-dark text-white'
                                        : 'bg-sidebar-bg text-text-muted hover:text-text-main'
                                    }`}
                            >
                                {link.icon}
                                <span className="font-black uppercase tracking-widest text-xs">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                    <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                        <span className="badge-coral">{user.role} IDENTITY</span>
                        <button
                            onClick={() => { logout(); setIsOpen(false); }}
                            className="flex items-center gap-2 font-black uppercase tracking-widest text-xs text-accent-coral"
                        >
                            <LogOut size={18} /> End Session
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
