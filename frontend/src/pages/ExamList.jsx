import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ChevronRight, Lock, Search, Filter, Plus, FileText, Loader2, ArrowUpRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

const ExamList = ({ user }) => {
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
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
        <div className="space-y-12 pb-20">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-main italic uppercase">
                        Module <span className="text-text-muted">Catalog</span>
                    </h1>
                    <p className="text-text-muted mt-2 font-medium">Browse and initialize available synchronized assessments</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-text-main" size={18} />
                        <input
                            type="text"
                            placeholder="Filter modules..."
                            className="input-field pl-14 h-14"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {user.role === 'Faculty' && (
                        <Link to="/create-exam" className="btn-primary h-14 px-8">
                            <Plus size={18} className="mr-2" />
                            New Module
                        </Link>
                    )}
                </div>
            </header>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="animate-spin text-text-main" size={40} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Syncing assessment nodes...</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {filteredExams.length === 0 ? (
                        <div className="col-span-full surface-card p-24 text-center border-dashed flex flex-col items-center gap-6">
                            <div className="bg-sidebar-bg p-8 rounded-[2rem] text-text-muted">
                                <FileText size={48} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text-main mb-2">No modules detected</h3>
                                <p className="text-text-muted text-sm max-w-xs mx-auto font-medium">Reset your filters or verify your network permissions with an administrator.</p>
                            </div>
                        </div>
                    ) : (
                        filteredExams.map((exam, index) => (
                            <motion.div
                                key={exam._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="surface-card p-10 group flex flex-col h-full hover:-translate-y-2"
                            >
                                <div className="flex justify-between items-start mb-10">
                                    <div className="bg-sidebar-bg p-4 rounded-2xl group-hover:bg-accent-dark group-hover:text-white transition-all duration-500">
                                        <FileText size={28} />
                                    </div>
                                    <span className="badge-coral items-center gap-1.5 flex uppercase">
                                        <div className="w-1.5 h-1.5 bg-accent-coral rounded-full"></div>
                                        Encrypted
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black text-text-main mb-4 italic tracking-tight leading-tight uppercase line-clamp-2">
                                    {exam.title}
                                </h3>
                                <p className="text-text-muted font-medium text-sm leading-relaxed flex-1 line-clamp-3 mb-10">
                                    {exam.description || 'Verified secure assessment module utilizing RSA-2048 integrity checks and AES-256 data sealing.'}
                                </p>

                                <div className="space-y-6 pt-10 border-t border-black/5">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} className="text-accent-coral" />
                                                {new Date(exam.startTime).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 border-l border-black/10">
                                                <Clock size={12} className="text-accent-mint" />
                                                {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="text-text-main">
                                            {exam.questions?.length || 0} Nodes
                                        </div>
                                    </div>

                                    <Link
                                        to={user.role === 'Student'
                                            ? (exam.isSubmitted ? '#' : `/exams/${exam._id}`)
                                            : `/results`}
                                        onClick={(e) => {
                                            if (user.role === 'Student' && exam.isSubmitted) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={`btn-primary w-full h-16 group/btn ${(user.role === 'Student' && exam.isSubmitted)
                                            ? 'bg-sidebar-bg text-text-muted cursor-not-allowed hover:translate-y-0 hover:shadow-none'
                                            : ''
                                            }`}
                                    >
                                        <span className="mr-2">
                                            {user.role === 'Student'
                                                ? (exam.isSubmitted ? 'Exam Completed' : 'Start Exam')
                                                : 'View Outcomes'}
                                        </span>
                                        {!(user.role === 'Student' && exam.isSubmitted) && (
                                            <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        )}
                                        {(user.role === 'Student' && exam.isSubmitted) && (
                                            <CheckCircle size={18} className="text-accent-mint" />
                                        )}
                                    </Link>
                                </div>

                                {(user.role === 'Student' ? !exam.isSubmitted : true) && (
                                    <div className="mt-8 pt-6 border-t border-black/5 flex flex-col items-center gap-4 bg-sidebar-bg/30 rounded-3xl p-6 group-hover:bg-white transition-all duration-500">
                                        <div className="flex items-center justify-between w-full mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">
                                                {user.role === 'Student' ? 'Access Token' : 'Shareable Link'}
                                            </span>
                                            <div className="flex items-center gap-1 text-[8px] font-black uppercase text-accent-mint">
                                                {user.role === 'Student' ? <Lock size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-accent-mint animate-pulse" />}
                                                {user.role === 'Student' ? 'AES Sealed' : 'Live URL'}
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-2xl shadow-sm">
                                            <QRCodeSVG
                                                value={user.role === 'Student'
                                                    ? (exam.qrAccessToken || 'PENDING_PROVISION')
                                                    : `${window.location.origin}/exams/${exam._id}`}
                                                size={80}
                                                level="M"
                                                fgColor="#0F172A"
                                            />
                                        </div>
                                        <p className="text-[8px] text-text-muted text-center font-medium leading-relaxed">
                                            {user.role === 'Student'
                                                ? <>Scan this <span className="text-text-main font-bold">Encrypted Handshake Token</span> at the entry point to verify your exam instance.</>
                                                : <>Student can scan this <span className="text-text-main font-bold">Direct Link</span> to immediately access the exam page.</>
                                            }
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default ExamList;
