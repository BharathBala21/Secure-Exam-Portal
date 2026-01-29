import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Activity, Fingerprint, Database, AlertTriangle, CheckCircle2, Search, RefreshCcw, Lock, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuditLogs = ({ user }) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get('/api/audit', config);
            setLogs(data);
        } catch (err) {
            console.error('Failed to fetch forensic logs');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [user]);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight flex items-center gap-4">
                        Forensic <span className="gradient-text">Audit Logs</span>
                        <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] h-fit">
                            Immutable Ledger
                        </div>
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <Fingerprint className="text-indigo-500" size={16} />
                        Cryptographically linked system events for security governance
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by action, user, or detail..."
                            className="input-field pl-12 h-12 bg-white/5 border-white/10 w-full lg:w-80 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-slate-400 hover:text-indigo-400 group shadow-lg"
                        title="Resync Chain"
                    >
                        <RefreshCcw size={20} className={`${isLoading ? 'animate-spin' : 'group-active:rotate-180 transition-transform duration-500'}`} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="glass p-6 h-24 animate-pulse border-white/5"></div>
                        ))
                    ) : filteredLogs.length === 0 ? (
                        <div className="glass p-20 text-center flex flex-col items-center gap-4 border-dashed border-white/10">
                            <Box size={48} className="text-slate-700" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No security events found in the current segment.</p>
                        </div>
                    ) : (
                        filteredLogs.map((log, index) => (
                            <motion.div
                                key={log._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`glass overflow-hidden border-white/5 hover:border-white/10 transition-all group relative ${log.status === 'Failure' ? 'border-rose-500/20' :
                                        log.status === 'Warning' ? 'border-amber-500/20' : ''
                                    }`}
                            >
                                {/* Hash Chain Indicator */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors"></div>

                                <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className={`p-4 rounded-2xl border transition-all ${log.status === 'Failure' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                            log.status === 'Warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                        }`}>
                                        {log.status === 'Failure' ? <AlertTriangle size={24} /> :
                                            log.status === 'Success' ? <CheckCircle2 size={24} /> :
                                                <Activity size={24} />}
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">{log.action}</h3>
                                            <span className="text-[10px] font-black text-slate-500 border border-white/10 px-2 py-0.5 rounded uppercase tracking-widest">
                                                {log.status}
                                            </span>
                                            {log.user && (
                                                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-md border border-indigo-500/10">
                                                    @{log.user.name}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed">{log.details}</p>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                                                <Database size={12} />
                                                ID: {log._id.slice(-8).toUpperCase()}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                                                <Activity size={12} />
                                                IP: {log.ipAddress || '127.0.0.1'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                                                <Lock size={12} />
                                                PREV: {log.previousHash.slice(0, 12)}...
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right hidden md:block">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Global Timestamp</p>
                                        <p className="text-sm font-bold text-slate-300 mt-0.5">{new Date(log.createdAt).toLocaleTimeString()}</p>
                                        <p className="text-[10px] text-slate-600 font-medium">{new Date(log.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AuditLogs;
