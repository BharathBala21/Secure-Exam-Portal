import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Activity, Fingerprint, Database, AlertTriangle, CheckCircle2, Search, RefreshCcw, Lock, Box, ArrowUpRight } from 'lucide-react';
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
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-main italic uppercase">
                        Audit <span className="text-text-muted">Logs</span>
                    </h1>
                    <p className="text-text-muted mt-2 font-medium flex items-center gap-2">
                        <Fingerprint className="text-accent-coral" size={18} />
                        Immutable record of all system and exam activities
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-text-main transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search protocol action..."
                            className="input-field pl-14 h-14"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-black/5 text-text-muted hover:text-text-main hover:border-black/10 transition-all shadow-sm"
                    >
                        <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                <div className="xl:col-span-3 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="surface-card h-32 animate-pulse bg-white/50 border-dashed border-black/5 rounded-3xl"></div>
                            ))
                        ) : filteredLogs.length === 0 ? (
                            <div className="surface-card p-24 text-center flex flex-col items-center gap-6 border-dashed">
                                <Box size={48} className="text-text-muted opacity-20" />
                                <p className="text-text-muted font-black uppercase tracking-[0.3em] text-[10px]">No security events found in the current segment.</p>
                            </div>
                        ) : (
                            filteredLogs.map((log, index) => (
                                <motion.div
                                    key={log._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="surface-card group hover:-translate-x-1 transition-all duration-500 bg-white"
                                >
                                    <div className="p-8 flex flex-col lg:flex-row items-start lg:items-center gap-10">
                                        <div className={`p-5 rounded-2xl border transition-all duration-500 ${log.status === 'Failure'
                                            ? 'bg-red-50 border-red-100 text-red-500' :
                                            log.status === 'Warning'
                                                ? 'bg-accent-coral/10 border-accent-coral/20 text-accent-coral' :
                                                'bg-accent-mint/10 border-accent-mint/20 text-accent-mint'
                                            }`}>
                                            {log.status === 'Failure' ? <AlertTriangle size={28} /> :
                                                log.status === 'Success' ? <CheckCircle2 size={28} /> :
                                                    <Activity size={28} />}
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-3">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <h3 className="text-xl font-black text-text-main uppercase italic italic tracking-tighter">{log.action}</h3>
                                                <span className={`text-[10px] font-black border px-3 py-1 rounded-full uppercase tracking-widest ${log.status === 'Failure' ? 'border-red-200 text-red-500' : 'border-black/5 text-text-muted'
                                                    }`}>
                                                    {log.status}
                                                </span>
                                                {log.user && (
                                                    <span className="badge-coral lowercase text-[11px] font-black">
                                                        @{log.user.name.replace(/\s+/g, '').toLowerCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-text-muted font-medium text-sm leading-relaxed max-w-3xl">{log.details}</p>

                                            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-4 border-t border-black/[0.03]">
                                                <Attribute icon={<Database size={12} />} label="TXID" value={log._id.slice(-8).toUpperCase()} />
                                                <Attribute icon={<Activity size={12} />} label="NODE" value={log.ipAddress || '127.0.0.1'} />
                                                <Attribute icon={<Lock size={12} />} label="H-PREV" value={`${log.previousHash.slice(0, 8)}...`} />
                                            </div>
                                        </div>

                                        <div className="lg:text-right flex flex-col lg:items-end gap-2 border-l border-black/5 pl-10 h-full justify-center">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Event Timestamp</p>
                                            <p className="text-2xl font-mono font-black text-text-main tracking-tighter">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{new Date(log.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <div className="xl:col-span-1 space-y-8">
                    <ForensicEncodingTool />
                    <div className="surface-card p-8 bg-accent-dark text-white relative overflow-hidden">
                        <Lock size={140} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6">Chain Integrity</h3>
                        <div className="space-y-4 relative z-10 text-[11px] font-medium leading-relaxed opacity-70">
                            <p>All forensic events are hashed via <span className="text-white font-bold">SHA-256</span> and linked chronologically.</p>
                            <p>The previous hash in each node ensures that the audit trail remains immutable and tamper-evident.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ForensicEncodingTool = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('encode');

    const handleProcess = () => {
        try {
            if (mode === 'encode') {
                setOutput(btoa(input));
            } else {
                setOutput(atob(input));
            }
        } catch (e) {
            setOutput('ERROR: INVALID CHARACTER SET');
        }
    };

    return (
        <div className="surface-card p-10 bg-white border-t-4 border-t-accent-mint">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
                <RefreshCcw size={18} className="text-accent-mint" /> Log Decoder
            </h3>

            <div className="space-y-6">
                <div className="flex gap-2 p-1 bg-sidebar-bg rounded-xl">
                    <button
                        onClick={() => setMode('encode')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'encode' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Encode
                    </button>
                    <button
                        onClick={() => setMode('decode')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'decode' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Decode
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Input Payload</label>
                    <textarea
                        className="w-full bg-sidebar-bg/50 p-4 rounded-2xl border border-black/5 text-xs font-mono outline-none focus:bg-white focus:border-black/10 transition-all resize-none h-24"
                        placeholder={mode === 'encode' ? "Plain text..." : "Base64 string..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleProcess}
                    className="w-full btn-primary h-12 text-[10px]"
                >
                    Transition State
                </button>

                {output && (
                    <div className="space-y-2 pt-4 border-t border-black/5">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Resulting Archive</label>
                        <div className="w-full bg-accent-mint/5 p-4 rounded-2xl border border-accent-mint/10 text-xs font-mono break-all text-accent-mint min-h-12 flex items-center">
                            {output}
                        </div>
                    </div>
                )}

                <p className="text-[9px] text-text-muted leading-relaxed italic mt-4">
                    Uses <span className="text-text-main font-bold">Base64 Binary-to-Text Encoding</span> to normalize secure payloads for transit across the network nodes.
                </p>
            </div>
        </div>
    );
};

const Attribute = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 group/attr cursor-default">
        <div className="text-text-muted group-hover/attr:text-text-main transition-colors">
            {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40">{label}:</span>
        <span className="text-[10px] font-black font-mono text-text-main tracking-tight">{value}</span>
    </div>
);

export default AuditLogs;
