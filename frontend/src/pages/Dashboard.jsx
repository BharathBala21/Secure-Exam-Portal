import React from 'react';
import { Shield, BookOpen, Clock, FileText, CheckCircle, ArrowUpRight, Activity, Zap, Fingerprint, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-8 pb-12"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <motion.div variants={item}>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        System <span className="gradient-text">Dashboard</span>
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Authenticated session for <strong className="text-white">{user.name}</strong> as <span className="text-indigo-400 font-bold uppercase text-xs px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">{user.role}</span>
                    </p>
                </motion.div>

                <motion.div
                    variants={item}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl"
                >
                    <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-500">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Health</p>
                        <p className="text-sm font-bold text-emerald-400">All Nodes Secure</p>
                    </div>
                </motion.div>
            </header>

            <motion.div
                variants={container}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <motion.div variants={item} className="glass p-6 md:p-8 border-indigo-500/20 group hover:border-indigo-500/40 transition-all cursor-default relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <BookOpen size={100} />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all">
                            <BookOpen className="text-indigo-400" size={28} />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-1 rounded-lg">
                            <ArrowUpRight size={14} />
                            +2
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white mb-2">12</p>
                    <h3 className="text-lg font-bold text-slate-300">Active Exams</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">Secure assessments available for immediate completion.</p>
                </motion.div>

                <motion.div variants={item} className="glass p-6 md:p-8 border-emerald-500/20 group hover:border-emerald-500/40 transition-all cursor-default relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <CheckCircle size={100} />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
                            <CheckCircle className="text-emerald-400" size={28} />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-1 rounded-lg">
                            <ArrowUpRight size={14} />
                            8%
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white mb-2">85%</p>
                    <h3 className="text-lg font-bold text-slate-300">Mean Score</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">Performance delta across all verified department results.</p>
                </motion.div>

                <motion.div variants={item} className="glass p-6 md:p-8 border-amber-500/20 group hover:border-amber-500/40 transition-all cursor-default relative overflow-hidden lg:col-span-1 sm:col-span-2">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Clock size={100} />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all">
                            <Clock className="text-amber-400" size={28} />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white mb-2">45m</p>
                    <h3 className="text-lg font-bold text-slate-300">Avg. Duration</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">Standard time for cryptographic result evaluation cycle.</p>
                </motion.div>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass p-6 md:p-10 relative overflow-hidden border-white/5">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none scale-150 transform rotate-12">
                        <Shield size={200} />
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                                <FileText className="text-indigo-400" size={22} />
                            </div>
                            Security Protocol Audit
                        </h2>
                        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-lg">
                            <Activity size={14} className="text-indigo-500" />
                            Real-time Monitoring
                        </div>
                    </div>

                    <div className="space-y-4 relative">
                        {[
                            { action: 'Identity Verification Success', details: 'NIST 800-63-2 MFA validated via protocol', time: '2 mins ago', color: 'bg-indigo-500' },
                            { action: 'Digital Signature Verified', details: 'Block ID #8812 - RSA integrity confirmed', time: '1 hour ago', color: 'bg-emerald-500' },
                            { action: 'Middleware ACL Check', details: 'Hierarchical permission granted for objects', time: '3 hours ago', color: 'bg-indigo-500' },
                            { action: 'AES-256 Data Seal', details: 'Submission buffer encrypted symmetrically', time: '5 hours ago', color: 'bg-amber-500' },
                        ].map((log, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ x: 5 }}
                                className="flex items-center gap-5 p-4 bg-slate-800/20 rounded-2xl border border-white/5 hover:border-white/10 transition-all font-medium"
                            >
                                <div className={`w-3 h-3 rounded-full ${log.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-200 text-sm md:text-base truncate">{log.action}</p>
                                    <p className="text-xs text-slate-500 truncate">{log.details}</p>
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 uppercase whitespace-nowrap">{log.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="glass p-8 flex flex-col items-center justify-center text-center space-y-6 border-indigo-500/10 bg-gradient-to-br from-indigo-500/[0.05] to-transparent">
                    <div className="bg-indigo-500/20 p-6 rounded-full border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                        <Shield className="text-indigo-400" size={60} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">NIST Shield active</h3>
                        <p className="text-slate-500 text-sm max-w-[200px] leading-relaxed">All operations are currently protected by Level 3 Identity Assurance protocols.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button className="text-xs font-bold text-indigo-400 uppercase tracking-widest hover:text-white transition-colors border-b border-indigo-500/30 pb-1">
                            View Security Policy
                        </button>
                        {user.role === 'Admin' && (
                            <Link to="/audit" className="text-xs font-bold text-emerald-400 uppercase tracking-widest hover:text-white transition-colors border-b border-emerald-500/30 pb-1 flex items-center gap-2">
                                <Fingerprint size={14} />
                                Access Forensic Node
                            </Link>
                        )}
                        {user.role === 'Admin' && (
                            <Link to="/users" className="text-xs font-bold text-indigo-400 uppercase tracking-widest hover:text-white transition-colors border-b border-indigo-500/30 pb-1 flex items-center gap-2">
                                <Users size={14} />
                                Identity Governance
                            </Link>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
