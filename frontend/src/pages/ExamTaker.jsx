import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ArrowLeft, Loader2, Timer, Lock, Send, AlertTriangle, Shield, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signData } from '../utils/securityUtils';

const ExamTaker = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(3600); // 60 mins mock

    useEffect(() => {
        // Tertiary Shield: Faculty and Admins are restricted from this segment
        if (user?.role !== 'Student') {
            navigate('/dashboard');
            return;
        }

        const fetchExam = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get(`/api/exams/${id}`, config);
                setExam(data);
            } catch (err) {
                console.error('Failed to fetch exam details');
                if (err.response?.status === 403) {
                    alert(err.response.data.message);
                    navigate('/exams');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchExam();
    }, [id, user, navigate]);

    const handleOptionChange = (questionIndex, optionIndex) => {
        setAnswers({ ...answers, [questionIndex]: optionIndex });
    };

    const handleSubmit = async () => {
        if (!window.confirm('AUTHORIZATION REQUIRED: This submission will be cryptographically signed with your private RSA key. This process is irreversible. Proceed with finalization?')) return;

        setIsSubmitting(true);
        try {
            const answerArray = Object.keys(answers).sort().map(key => answers[key]);
            const signature = await signData(answerArray, user.privateKey || 'MOCK_PRIVATE_KEY');

            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            await axios.post('/api/exams/submit', {
                examId: id,
                answers: answerArray,
                signature
            }, config);

            navigate('/results');
        } catch (err) {
            alert(err.response?.data?.message || 'Cryptographic signing failure');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <Loader2 className="animate-spin text-text-main" size={56} />
            <p className="text-text-muted font-black uppercase tracking-[0.4em] text-[10px] italic">Initializing Secure Session Environment...</p>
        </div>
    );

    if (!exam) return (
        <div className="surface-card p-16 text-center max-w-lg mx-auto mt-20 border-red-100">
            <AlertTriangle className="text-red-500 mx-auto mb-6" size={56} />
            <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase italic">Access Denied</h2>
            <p className="text-text-muted font-medium mt-4 mb-10 leading-relaxed">The requested assessment node is either restricted or its cryptographic lease has expired.</p>
            <button onClick={() => navigate('/exams')} className="btn-primary w-full">Return to Dashboard</button>
        </div>
    );

    const q = exam.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / exam.questions.length) * 100;

    return (
        <div className="max-w-6xl mx-auto pb-24">
            <header className="flex flex-col md:flex-row gap-8 mb-12">
                <div className="flex-1 surface-card p-8 md:p-12 flex items-center gap-8 relative overflow-hidden bg-white">
                    <div className="w-20 h-20 bg-accent-dark rounded-3xl flex items-center justify-center text-white shadow-medium z-10">
                        <Lock size={36} />
                    </div>
                    <div className="z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="badge-mint py-1">Active Session</span>
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-sidebar-bg px-3 py-1 rounded-lg">ID: {id.slice(-12).toUpperCase()}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tighter italic uppercase">{exam.title}</h1>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <ShieldCheck size={180} />
                    </div>
                </div>

                <div className="md:w-64 surface-card p-8 flex flex-col items-center justify-center text-center bg-sidebar-bg border-none">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Timer size={14} className="text-accent-coral" /> Lease Remaining
                    </p>
                    <p className="text-4xl font-black font-mono tracking-tighter text-text-main">59:24</p>
                    <div className="w-full h-1 bg-black/10 mt-4 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-accent-coral"
                            initial={{ width: '100%' }}
                            animate={{ width: '85%' }}
                            transition={{ duration: 10, ease: 'linear' }}
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-3 space-y-8">
                    <div className="surface-card p-10 md:p-14 bg-white min-h-[500px] flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-12">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-3">
                                    <div className="w-2 h-2 bg-accent-mint rounded-full animate-pulse"></div>
                                    Synchronizing Node {currentQuestion + 1}
                                </span>
                                <span className="text-[10px] font-black font-mono text-white bg-accent-dark px-4 py-1.5 rounded-full tracking-tighter italic">
                                    PROG: {Math.round(progress)}%
                                </span>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuestion}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12"
                                >
                                    <h2 className="text-3xl font-black text-text-main tracking-tighter italic uppercase leading-tight">
                                        {q.questionText}
                                    </h2>

                                    <div className="grid grid-cols-1 gap-4">
                                        {q.options.map((option, idx) => (
                                            <motion.label
                                                key={idx}
                                                whileHover={{ x: 10 }}
                                                className={`flex items-center gap-6 p-7 rounded-[2rem] border-2 transition-all cursor-pointer group ${answers[currentQuestion] === idx
                                                    ? 'bg-accent-dark border-accent-dark text-white shadow-medium'
                                                    : 'bg-sidebar-bg border-transparent text-text-muted hover:bg-white hover:border-black/5'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    className="hidden"
                                                    checked={answers[currentQuestion] === idx}
                                                    onChange={() => handleOptionChange(currentQuestion, idx)}
                                                />
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-xl transition-all duration-500 ${answers[currentQuestion] === idx
                                                    ? 'bg-white text-black'
                                                    : 'bg-white/50 text-text-muted group-hover:bg-white'
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className="font-black text-xl tracking-tight">{option}</span>
                                            </motion.label>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex justify-between items-center gap-6">
                        <button
                            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestion === 0}
                            className="h-14 px-8 rounded-2xl bg-white border border-black/5 text-text-muted hover:text-text-main font-black uppercase text-[10px] tracking-widest flex items-center gap-3 disabled:opacity-0 transition-all"
                        >
                            <ArrowLeft size={18} />
                            Previous Node
                        </button>

                        {currentQuestion < exam.questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                                className="btn-primary h-14 px-10 flex items-center gap-3 italic"
                            >
                                Next Segment
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="btn-primary bg-accent-mint hover:bg-emerald-600 h-14 px-12 italic shadow-medium border-none"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>
                                        Authorize & Sync Ledger
                                        <Send size={18} className="ml-3" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="surface-card p-8 bg-sidebar-bg/50 border-none">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-8">Identity Assurance</h3>
                        <div className="space-y-6">
                            <SecurityMetric icon={<Fingerprint size={18} />} label="TX Integrity" value="SHA-256 Verified" color="text-accent-mint" />
                            <SecurityMetric icon={<Shield size={18} />} label="Node Encryption" value="RSA-2048 Ready" color="text-accent-coral" />
                            <SecurityMetric icon={<Lock size={18} />} label="Data Stream" value="SSL Pinned" color="text-text-main" />
                        </div>
                    </div>

                    <div className="surface-card p-8 bg-white">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-8">Node Map</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {exam.questions.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentQuestion(i)}
                                    className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500 border-2 ${currentQuestion === i
                                        ? 'bg-accent-dark border-accent-dark text-white shadow-medium italic'
                                        : answers[i] !== undefined
                                            ? 'bg-accent-mint/10 border-accent-mint/20 text-accent-mint'
                                            : 'bg-sidebar-bg border-transparent text-text-muted hover:border-black/5'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 surface-card bg-accent-dark text-white flex flex-col items-center gap-4 text-center">
                        <ShieldCheck className="text-accent-mint" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Secure Tunneling Active</p>
                        <p className="text-[11px] font-medium leading-relaxed opacity-80">Every keystroke is buffered and ready for cryptographic signing.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SecurityMetric = ({ icon, label, value, color }) => (
    <div className="flex items-center gap-4 group">
        <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm ${color}`}>
            {icon}
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{label}</span>
            <span className="text-[11px] font-black text-text-main uppercase italic">{value}</span>
        </div>
    </div>
);

export default ExamTaker;
