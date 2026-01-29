import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, FileText, Calendar, Clock, Layout, ListChecks, Loader2, ChevronRight, AlertCircle, Info, FileSpreadsheet, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExamCreator = () => {
    const [examData, setExamData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        questions: [{ questionText: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Shield Check: Only Faculty allowed to architect modules
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo?.role !== 'Faculty') {
            navigate('/dashboard');
        }
    }, [navigate]);

    const addQuestion = () => {
        setExamData({
            ...examData,
            questions: [...examData.questions, { questionText: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }]
        });
    };

    const removeQuestion = (index) => {
        if (examData.questions.length === 1) return;
        const newQs = examData.questions.filter((_, i) => i !== index);
        setExamData({ ...examData, questions: newQs });
    };

    const updateQuestion = (qIdx, field, value) => {
        const newQs = [...examData.questions];
        newQs[qIdx][field] = value;
        setExamData({ ...examData, questions: newQs });
    };

    const updateOption = (qIdx, oIdx, value) => {
        const newQs = [...examData.questions];
        newQs[qIdx].options[oIdx] = value;
        setExamData({ ...examData, questions: newQs });
    };

    const handleExcelUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsParsing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };
            const { data } = await axios.post('/api/exams/upload-excel', formData, config);

            setExamData({
                ...examData,
                questions: data.questions
            });
            alert(`Successfully ingested ${data.questions.length} questions from Excel matrix.`);
        } catch (err) {
            alert('Failed to parse Excel sheet. Ensure the format matches: Question, A, B, C, D, Correct, Marks');
        } finally {
            setIsParsing(false);
            e.target.value = null; // Reset input
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('/api/exams', examData, config);
            navigate('/exams');
        } catch (err) {
            alert('Assessment publishing failed. Check system logs.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-24 space-y-12 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-main italic uppercase">
                        Architect <span className="text-text-muted">Node</span>
                    </h1>
                    <p className="text-text-muted mt-2 font-medium flex items-center gap-2">
                        <Layout className="text-accent-coral" size={18} />
                        Engineering secure objective-based evaluation modules
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleExcelUpload}
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        disabled={isParsing}
                        className="btn-secondary h-14 px-8 border-dashed border-accent-mint/40 text-accent-mint hover:bg-accent-mint/5"
                    >
                        {isParsing ? <Loader2 size={18} className="animate-spin mr-2" /> : <FileSpreadsheet size={18} className="mr-2" />}
                        {isParsing ? 'Parsing Cryptography...' : 'Import Dataset'}
                    </button>
                    <div className="surface-card p-4 flex items-center gap-4 border-black/5 bg-sidebar-bg/50">
                        <ShieldCheck className="text-text-muted" size={24} />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-tight">
                            RSA-2048 <br /> <span className="text-text-main">Signed Protocol</span>
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleCreate} className="space-y-12">
                <section className="surface-card p-10 md:p-14 space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-accent-dark rounded-full"></div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-text-main">Global Configuration</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        <div className="lg:col-span-2 space-y-4">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Module Identity</label>
                            <div className="relative group">
                                <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-text-main transition-colors" size={20} />
                                <input
                                    className="input-field pl-14 h-16 text-lg font-black tracking-tight"
                                    placeholder="e.g. ADVANCED CRYPTOGRAPHY CORE"
                                    value={examData.title}
                                    onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Sync Start</label>
                            <input
                                type="datetime-local"
                                className="input-field h-16 font-mono text-sm uppercase font-black"
                                value={examData.startTime}
                                onChange={(e) => setExamData({ ...examData, startTime: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Sync End</label>
                            <input
                                type="datetime-local"
                                className="input-field h-16 font-mono text-sm uppercase font-black"
                                value={examData.endTime}
                                onChange={(e) => setExamData({ ...examData, endTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Protocol Briefing</label>
                        <textarea
                            className="input-field min-h-[120px] p-8 resize-none font-medium text-text-muted leading-relaxed"
                            placeholder="Specify assessment constraints and signing instructions..."
                            value={examData.description}
                            onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                        />
                    </div>
                </section>

                <section className="space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-4">
                            <ListChecks className="text-accent-mint" size={28} />
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-text-main">Module Nodes</h2>
                            <span className="badge-dark">{examData.questions.length} QC</span>
                        </div>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="btn-primary group h-14 px-8"
                        >
                            <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform" />
                            Append Node
                        </button>
                    </div>

                    <div className="space-y-8">
                        <AnimatePresence>
                            {examData.questions.map((q, qIdx) => (
                                <motion.div
                                    key={qIdx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="surface-card p-10 md:p-14 relative group"
                                >
                                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-accent-dark rounded-2xl flex items-center justify-center font-black text-white shadow-medium italic">
                                        {qIdx + 1}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(qIdx)}
                                        className="absolute top-8 right-8 p-3 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                        title="Purge Node"
                                    >
                                        <Trash2 size={24} />
                                    </button>

                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            <div className="md:col-span-9 space-y-4">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1">Problem Statement</label>
                                                <input
                                                    className="input-field bg-white border border-black/5 h-20 text-2xl font-black tracking-tighter px-10 placeholder:text-black/10"
                                                    placeholder="Define objective logic..."
                                                    value={q.questionText}
                                                    onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-3 space-y-4">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1">Credits</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="input-field bg-white border border-black/5 h-20 text-2xl font-black tracking-tighter text-center placeholder:text-black/10"
                                                    value={q.marks}
                                                    onChange={(e) => updateQuestion(qIdx, 'marks', parseInt(e.target.value) || 1)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="space-y-2 group/opt">
                                                    <div className="flex items-center gap-4">
                                                        <label className={`w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-500 ${q.correctOption === oIdx
                                                            ? 'bg-accent-mint text-white shadow-medium'
                                                            : 'bg-sidebar-bg text-text-muted hover:bg-sidebar-bg/80'
                                                            }`}>
                                                            <input
                                                                type="radio"
                                                                name={`correct-${qIdx}`}
                                                                className="hidden"
                                                                checked={q.correctOption === oIdx}
                                                                onChange={() => updateQuestion(qIdx, 'correctOption', oIdx)}
                                                            />
                                                            <span className="font-black italic text-lg">{String.fromCharCode(65 + oIdx)}</span>
                                                        </label>
                                                        <input
                                                            className="input-field h-14 bg-white border border-black/5 font-black text-sm tracking-tight"
                                                            placeholder={`Matrix Value ${oIdx + 1}`}
                                                            value={opt}
                                                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>

                <div className="flex flex-col items-center gap-10 pt-12">
                    <div className="flex items-start gap-6 surface-card p-8 bg-accent-coral/5 border-accent-coral/10 max-w-2xl">
                        <AlertCircle className="text-accent-coral flex-shrink-0" size={28} />
                        <p className="text-xs text-text-main leading-relaxed font-bold italic">
                            PROVISIONING NOTICE: Upon initialization, this module will be cross-signed and hashed into the decentralized academic network. Every node entry is encrypted via AES-256 standards. Ensure all configurations are final.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full max-w-md py-6 text-xl"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={28} />
                        ) : (
                            <>
                                Initialize Deployment
                                <ArrowUpRight className="ml-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExamCreator;
