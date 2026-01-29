import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, CheckCircle2, AlertCircle, RefreshCcw, Loader2, Search, User as UserIcon, Book, Award, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Results = ({ user }) => {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchResults = async () => {
        setIsLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get('/api/exams/results', config);
            setResults(data);
        } catch (err) {
            console.error('Failed to fetch results');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, [user]);

    const handleEvaluate = async (submissionId) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.post(`/api/exams/evaluate/${submissionId}`, {}, config);
            fetchResults();
        } catch (err) {
            alert('Evaluation failed');
        }
    };

    const filteredResults = results.filter(res =>
        res.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        Security <span className="gradient-text">Ledger</span>
                    </h1>
                    <p className="text-slate-400 mt-2">Verified assessment records with asymmetric signing</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by student or exam..."
                            className="input-field pl-12 h-12 bg-white/5 border-white/10 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchResults}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                    >
                        <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="glass overflow-hidden border-white/5 shadow-2xl overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-900/80 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                        <tr>
                            <th className="px-8 py-5">Submitting Student</th>
                            <th className="px-8 py-5">Assessment</th>
                            <th className="px-8 py-5">Protocol Status</th>
                            <th className="px-8 py-5">Score Matrix</th>
                            <th className="px-8 py-5">Encryption</th>
                            {user.role !== 'Student' && <th className="px-8 py-5 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Accessing encrypted archives...</p>
                                        </div>
                                    </td>
                                </motion.tr>
                            ) : filteredResults.length === 0 ? (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <td colSpan="6" className="px-8 py-20 text-center text-slate-500">
                                        No matching records found in the secure vault.
                                    </td>
                                </motion.tr>
                            ) : (
                                filteredResults.map((res, index) => (
                                    <motion.tr
                                        key={res._id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                    <UserIcon size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-200">{res.student?.name || 'Anonymous Student'}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{res.student?.email || 'id-masked'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Book size={14} className="text-slate-500" />
                                                <span className="font-medium text-slate-300">{res.exam?.title || 'Unknown Module'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Clock size={10} className="text-slate-600" />
                                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Submitted {new Date(res.submissionTime).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${res.status === 'Evaluated'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {res.status === 'Evaluated' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} className="animate-pulse" />}
                                                {res.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {res.status === 'Evaluated' ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                                                        <Award size={18} />
                                                    </div>
                                                    <span className="text-2xl font-black font-mono text-white tracking-tighter">{res.marks}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest italic">Wait Verif.</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 group/shield cursor-help">
                                                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover/shield:bg-emerald-500/20 transition-all">
                                                    <Shield className="text-emerald-500" size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-emerald-400 font-bold tracking-widest">SHA-256</span>
                                                    <span className="text-[8px] text-slate-600 font-mono uppercase">Validated</span>
                                                </div>
                                            </div>
                                        </td>
                                        {user.role !== 'Student' && (
                                            <td className="px-8 py-6 text-right">
                                                {res.status !== 'Evaluated' ? (
                                                    <button
                                                        onClick={() => handleEvaluate(res._id)}
                                                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                                                    >
                                                        Evaluate
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-700 font-black tracking-widest text-[10px] pointer-events-none uppercase">Archived</span>
                                                )}
                                            </td>
                                        )}
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Results;
