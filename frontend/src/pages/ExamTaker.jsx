import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ArrowLeft, Loader2, Timer, Lock, Send, AlertTriangle } from 'lucide-react';
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
        const fetchExam = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get(`/api/exams/${id}`, config);
                setExam(data);
            } catch (err) {
                console.error('Failed to fetch exam details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchExam();
    }, [id, user]);

    const handleOptionChange = (questionIndex, optionIndex) => {
        setAnswers({ ...answers, [questionIndex]: optionIndex });
    };

    const handleSubmit = async () => {
        if (!window.confirm('CRITICAL ACTION: This submission will be digitally signed with your RSA key. This process is irreversible. Proceed?')) return;

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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Establishing Secure TEE...</p>
        </div>
    );

    if (!exam) return (
        <div className="glass p-12 text-center max-w-md mx-auto mt-20 border-rose-500/20">
            <AlertTriangle className="text-rose-500 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-slate-400 text-sm mb-6">Exam module is restricted or no longer available in the secure vault.</p>
            <button onClick={() => navigate('/exams')} className="btn-primary w-full">Back to Catalog</button>
        </div>
    );

    const q = exam.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / exam.questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1 glass p-6 md:p-8 flex items-center gap-6 border-indigo-500/20 relative overflow-hidden">
                    <div className="bg-indigo-500/10 p-4 rounded-3xl border border-indigo-500/20">
                        <Lock className="text-indigo-400" size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/10">Active Session</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">ID: {id.slice(-8)}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white">{exam.title}</h1>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <ShieldCheck size={120} />
                    </div>
                </div>

                <div className="md:w-48 glass p-6 flex flex-col items-center justify-center border-white/5 bg-white/[0.02]">
                    <Timer className="text-slate-500 mb-2" size={20} />
                    <p className="text-2xl font-black font-mono tracking-tighter text-white">59:42</p>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Remaining</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass p-6 md:p-10 border-white/5 bg-white/[0.01]">
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                Evaluating Question {currentQuestion + 1}
                            </span>
                            <span className="text-xs font-bold font-mono text-indigo-400/80 bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">{Math.round(progress)}% Complete</span>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <h2 className="text-xl md:text-2xl font-bold text-slate-100 leading-snug">
                                    {q.questionText}
                                </h2>

                                <div className="space-y-3">
                                    {q.options.map((option, idx) => (
                                        <motion.label
                                            key={idx}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className={`flex items-center gap-5 p-5 rounded-2xl border-2 transition-all cursor-pointer group ${answers[currentQuestion] === idx
                                                    ? 'bg-indigo-500/10 border-indigo-500/50 text-white shadow-[0_0_30px_rgba(99,102,241,0.1)]'
                                                    : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                className="hidden"
                                                checked={answers[currentQuestion] === idx}
                                                onChange={() => handleOptionChange(currentQuestion, idx)}
                                            />
                                            <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${answers[currentQuestion] === idx
                                                    ? 'border-indigo-500 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                                                    : 'border-white/20'
                                                }`}>
                                                {answers[currentQuestion] === idx ? (
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                ) : (
                                                    <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase">{String.fromCharCode(65 + idx)}</span>
                                                )}
                                            </div>
                                            <span className="font-semibold text-lg">{option}</span>
                                        </motion.label>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex justify-between items-center gap-4">
                        <button
                            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestion === 0}
                            className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all font-bold flex items-center gap-3 disabled:opacity-0"
                        >
                            <ArrowLeft size={20} />
                            Previous Segment
                        </button>

                        {currentQuestion < exam.questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                                className="btn-primary px-8 py-4 rounded-2xl flex items-center gap-3"
                            >
                                Proceed to Next
                                <ArrowRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-4 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] active:scale-95 disabled:grayscale"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>
                                        Authorize & Sign
                                        <Send size={20} />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass p-6 border-white/5 bg-white/[0.01]">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Identity Verification</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-xs">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <ShieldCheck size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-200">Integrity Check</span>
                                    <span className="text-slate-500">SHA-256 Validated</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <Lock size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-200">Encryption</span>
                                    <span className="text-slate-500">AES-256 Buffer</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 border-white/5 bg-white/[0.01]">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Fast Navigation</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {exam.questions.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentQuestion(i)}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-all border ${currentQuestion === i
                                            ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                                            : answers[i] !== undefined
                                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                                : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/30'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamTaker;
