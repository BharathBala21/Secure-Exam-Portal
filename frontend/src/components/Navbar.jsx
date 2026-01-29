import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, LogOut, User as UserIcon, BookOpen, BarChart3, PlusCircle, Menu, X, Fingerprint, Users } from 'lucide-react';

const Navbar = ({ user, logout }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { to: "/dashboard", icon: <UserIcon size={18} />, label: "Dashboard" },
        { to: "/exams", icon: <BookOpen size={18} />, label: "Exams" },
        { to: "/results", icon: <BarChart3 size={18} />, label: "Results" },
    ];

    if (user?.role === 'Faculty') {
        navLinks.splice(2, 0, { to: "/create-exam", icon: <PlusCircle size={18} />, label: "Create" });
    }

    if (user?.role === 'Admin') {
        navLinks.push({ to: "/users", icon: <Users size={18} />, label: "Users" });
        navLinks.push({ to: "/audit", icon: <Fingerprint size={18} />, label: "Audit" });
    }

    return (
        <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all">
                        <Shield className="text-indigo-500 w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <span className="text-lg md:text-xl font-bold tracking-tight">SECURE<span className="text-indigo-400">EXAM</span></span>
                </Link>

                {/* Desktop Navigation */}
                {user && (
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm font-medium hover:translate-y-[-1px]"
                            >
                                {link.icon} {link.label}
                            </Link>
                        ))}

                        <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border border-indigo-500/20">
                                {user.role}
                            </span>
                            <button
                                onClick={logout}
                                className="p-2 text-slate-400 hover:text-rose-400 transition-all hover:bg-rose-500/10 rounded-lg"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile Menu Button */}
                {user && (
                    <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={toggleMenu}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                )}

                {!user && (
                    <div className="flex gap-2 min-w-fit">
                        <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
                        <Link to="/register" className="px-4 py-2 text-sm font-bold bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">Register</Link>
                    </div>
                )}
            </div>

            {/* Mobile Navigation Dropdown */}
            {user && isOpen && (
                <div className="md:hidden glass mx-4 my-2 p-4 space-y-4 border-white/5 animate-fade-in">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <div className="text-indigo-400">{link.icon}</div>
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    ))}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/20 uppercase">
                            {user.role}
                        </span>
                        <button
                            onClick={() => { logout(); setIsOpen(false); }}
                            className="flex items-center gap-2 p-3 text-rose-400 font-bold"
                        >
                            <LogOut size={20} /> Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};


export default Navbar;
