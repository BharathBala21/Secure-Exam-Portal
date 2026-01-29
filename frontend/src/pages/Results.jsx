import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, CheckCircle2, AlertCircle, RefreshCcw, Loader2, Search, User as UserIcon, Book, Award, Clock, ArrowUpRight } from 'lucide-react';
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

    const getScoreStyles = (marks) => {
        if (marks >= 80) return { bg: 'bg-accent-mint/10', text: 'text-accent-mint', border: 'border-accent-mint/20' };
        if (marks >= 50) return { bg: 'bg-accent-coral/10', text: 'text-accent-coral', border: 'border-accent-coral/20' };
        return { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100' };
    };

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-main italic uppercase">
                        Exam <span className="text-text-muted">Results</span>
                    </h1>
                    <p className="text-text-muted mt-2 font-medium">Review and manage student performance records</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-text-main transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search student or exam..."
                            className="input-field pl-14 h-14"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchResults}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-black/5 text-text-muted hover:text-text-main hover:border-black/10 transition-all shadow-sm"
                    >
                        <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="surface-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-black/5 bg-sidebar-bg/50">
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Student Name</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Exam Title</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted text-center">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted text-center">Score</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Verification</th>
                                {user.role !== 'Student' && <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="animate-spin text-text-main" size={40} />
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Loading results...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredResults.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-10 py-32 text-center">
                                            <div className="text-text-muted font-medium italic">No results found.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredResults.map((res, index) => (
                                        <motion.tr
                                            key={res._id || index}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-sidebar-bg/30 transition-colors group"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-accent-dark flex items-center justify-center text-white shadow-medium group-hover:scale-110 transition-transform duration-500">
                                                        <UserIcon size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-text-main tracking-tighter uppercase italic">{res.student?.name || 'Unknown Student'}</p>
                                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">{res.student?.email || 'id-buffer-000'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <Book size={16} className="text-accent-coral" />
                                                    <span className="font-black text-text-main tracking-tighter uppercase text-sm">{res.exam?.title || 'Unknown Exam'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Clock size={12} className="text-text-muted" />
                                                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                                        {new Date(res.submissionTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex justify-center">
                                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${res.status === 'Evaluated'
                                                        ? 'bg-accent-mint/10 text-accent-mint border-accent-mint/20'
                                                        : 'bg-accent-coral/10 text-accent-coral border-accent-coral/20'
                                                        }`}>
                                                        {res.status === 'Evaluated' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} className="animate-pulse" />}
                                                        {res.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex justify-center">
                                                    {res.status === 'Evaluated' ? (
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getScoreStyles(res.marks).bg} ${getScoreStyles(res.marks).text}`}>
                                                                <Award size={20} />
                                                            </div>
                                                            <span className={`text-4xl font-black font-mono tracking-tighter ${getScoreStyles(res.marks).text}`}>
                                                                {res.marks}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="badge-dark opacity-40">Awaiting...</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3 group/assurance">
                                                    <div className="w-10 h-10 rounded-xl bg-sidebar-bg border border-black/5 flex items-center justify-center text-text-muted group-hover/assurance:bg-accent-mint/10 group-hover/assurance:border-accent-mint/20 group-hover/assurance:text-accent-mint transition-all">
                                                        <Shield size={18} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-text-main font-black tracking-widest uppercase italic">Node-Sec</span>
                                                        <span className="text-[8px] text-text-muted font-black uppercase tracking-tighter">RSA Handshake</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {user.role !== 'Student' && (
                                                <td className="px-10 py-8 text-right">
                                                    {res.status !== 'Evaluated' ? (
                                                        <button
                                                            onClick={() => handleEvaluate(res._id)}
                                                            className="btn-primary py-3 px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-auto"
                                                        >
                                                            Grade Exam
                                                            <ArrowUpRight size={14} />
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-2 text-text-muted opacity-30 font-black uppercase tracking-[0.2em] text-[10px]">
                                                            Result Recorded
                                                        </div>
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

            <footer className="flex items-center justify-center gap-4 pt-8">
                <div className="h-[1px] bg-black/5 flex-1"></div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted italic">
                    <Shield size={14} className="text-accent-coral" />
                    End of Results
                </div>
                <div className="h-[1px] bg-black/5 flex-1"></div>
            </footer>
        </div>
    );
};

export default Results;
