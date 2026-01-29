import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ChevronRight, Lock, Search, Filter, Plus, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ExamList = ({ user }) => {
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get('/api/exams', config);
                setExams(data);
            } catch (err) {
                console.error('Failed to fetch exams');
            } finally {
                setIsLoading(false);
            }
        };
        fetchExams();
    }, [user]);

    const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-3xl md:text-5xl font-extrabold flex items-center gap-4">
                        Exam <span className="gradient-text">Catalog</span>
                        <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest h-fit">
                            {exams.length} Modules
                        </div>
                    </h1>
                    <p className="text-slate-400 mt-2">Browse and access secure academic assessments</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-wrap items-center gap-3"
                >
                    <div className="relative flex-1 min-w-[280px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Filter by title or course ID..."
                            className="input-field pl-12 h-12 bg-white/5 border-white/10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {user.role === 'Faculty' && (
                        <Link to="/create-exam" className="btn-primary h-12 flex items-center gap-2 whitespace-nowrap">
                            <Plus size={20} />
                            Construct New
                        </Link>
                    )}
                </motion.div>
            </header>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Decrypting assessment ledger...</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    {filteredExams.length === 0 ? (
                        <div className="col-span-full glass p-20 text-center flex flex-col items-center gap-4 border-dashed border-white/10">
                            <div className="bg-white/5 p-6 rounded-full text-slate-600">
                                <FileText size={48} />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-white">No assessments found</p>
                                <p className="text-slate-500 max-w-xs mx-auto mt-1">Adjust your filter or check back later for newly published modules.</p>
                            </div>
                        </div>
                    ) : (
                        filteredExams.map((exam, index) => (
                            <motion.div
                                key={exam._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass p-6 md:p-8 group hover:border-indigo-500/50 transition-all cursor-default flex flex-col h-full hover:shadow-[0_0_40px_rgba(99,102,241,0.1)]"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                                        <FileText className="text-indigo-400 group-hover:text-indigo-300" size={24} />
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded-lg border border-white/5">
                                        <Lock size={12} className="text-slate-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Encrypted</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors mb-3">{exam.title}</h3>
                                <p className="text-slate-400 text-sm mb-8 line-clamp-3 leading-relaxed flex-1">
                                    {exam.description || 'Verified secure assessment module. Ensure your signature key is ready before initiation.'}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Valid From</p>
                                        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                                            <Calendar size={14} className="text-indigo-500/50" />
                                            {new Date(exam.startTime).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-right">Window</p>
                                        <div className="flex items-center gap-2 justify-end text-slate-300 text-xs font-semibold">
                                            <Clock size={14} className="text-indigo-500/50" />
                                            {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    to={user.role === 'Student' ? `/exams/${exam._id}` : `/results?examId=${exam._id}`}
                                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:text-white transition-all shadow-sm"
                                >
                                    {user.role === 'Student' ? 'Initiate Assessment' : 'View Analytics'}
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default ExamList;
