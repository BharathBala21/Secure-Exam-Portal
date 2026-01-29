import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, FileText, Calendar, Clock, Layout, ListChecks, Loader2, ChevronRight, AlertCircle, Info, FileSpreadsheet, Upload } from 'lucide-react';
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
    const fileInputRef = React.useRef(null);
    const navigate = useNavigate();

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

            // Overwrite or Append? Let's overwrite for simplicity or confirm.
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
        <div className="max-w-5xl mx-auto pb-24 space-y-10 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        Construct <span className="gradient-text">Module</span>
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <Layout className="text-indigo-500" size={18} />
                        Architecting secure objective-based evaluations
                    </p>
                </div>

                <div className="flex items-center gap-3">
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
                        className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white px-5 py-3 rounded-2xl border border-emerald-500/20 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/5 active:scale-95"
                    >
                        {isParsing ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
                        {isParsing ? 'Parsing...' : 'Import Excel'}
                    </button>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                        <Info className="text-indigo-400" size={18} />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                            Submissions auto-signed <br /> <span className="text-indigo-300">via RSA-2048</span>
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleCreate} className="space-y-10">
                <section className="glass p-8 md:p-10 border-indigo-500/10 bg-indigo-500/[0.02] space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-200">Primary Configuration</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-3 lg:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assessment Title</label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input
                                    className="input-field pl-12 h-14 bg-white/5 border-white/10 text-lg font-bold"
                                    placeholder="e.g. ADVANCED CRYPTOGRAPHY - SEM III"
                                    value={examData.title}
                                    onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Start Window</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input
                                    type="datetime-local"
                                    className="input-field pl-12 h-14 bg-white/5 border-white/10 uppercase font-mono text-sm"
                                    value={examData.startTime}
                                    onChange={(e) => setExamData({ ...examData, startTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">End Window</label>
                            <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input
                                    type="datetime-local"
                                    className="input-field pl-12 h-14 bg-white/5 border-white/10 uppercase font-mono text-sm"
                                    value={examData.endTime}
                                    onChange={(e) => setExamData({ ...examData, endTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Briefing & Constraints</label>
                        <textarea
                            className="input-field min-h-[120px] bg-white/5 border-white/10 p-6 resize-none italic text-slate-400 leading-relaxed"
                            placeholder="Define specific instructions regarding digital signatures and time limits here..."
                            value={examData.description}
                            onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                        />
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <ListChecks className="text-indigo-500" size={24} />
                            <h2 className="text-2xl font-bold tracking-tight">Assessment Matrix</h2>
                            <span className="bg-white/5 px-2 py-1 rounded text-xs font-black text-slate-600 border border-white/10">{examData.questions.length} QC</span>
                        </div>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="group flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white px-5 py-2.5 rounded-xl border border-indigo-500/20 transition-all font-bold text-sm shadow-xl shadow-indigo-500/5 active:scale-95"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                            Append Question
                        </button>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence>
                            {examData.questions.map((q, qIdx) => (
                                <motion.div
                                    key={qIdx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass p-8 md:p-10 relative border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30">
                                        {qIdx + 1}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(qIdx)}
                                        className="absolute top-6 right-6 p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                        title="Purge Question"
                                    >
                                        <Trash2 size={20} />
                                    </button>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Question Buffer</label>
                                            <input
                                                className="input-field bg-white/5 border-white/10 h-16 text-xl font-bold px-8 placeholder:text-slate-700"
                                                placeholder="Define the problem statement..."
                                                value={q.questionText}
                                                onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="space-y-2 group">
                                                    <div className="flex items-center gap-3">
                                                        <label className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${q.correctOption === oIdx
                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                                            : 'bg-white/5 border-white/10 text-slate-600 hover:border-white/30'
                                                            }`}>
                                                            <input
                                                                type="radio"
                                                                name={`correct-${qIdx}`}
                                                                className="hidden"
                                                                checked={q.correctOption === oIdx}
                                                                onChange={() => updateQuestion(qIdx, 'correctOption', oIdx)}
                                                            />
                                                            <span className="text-xs font-black">{String.fromCharCode(65 + oIdx)}</span>
                                                        </label>
                                                        <input
                                                            className="input-field bg-white/5 h-12 border-white/10 focus:bg-white/10"
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

                <div className="pt-10 flex flex-col items-center gap-6 border-t border-white/5">
                    <div className="flex items-start gap-4 glass p-6 border-amber-500/20 bg-amber-500/[0.05] max-w-2xl">
                        <AlertCircle className="text-amber-500 flex-shrink-0" size={24} />
                        <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
                            By publishing, this assessment will be distributed across the secure node network. Every question and its key will be encrypted. Ensure all configurations are final.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full max-w-md py-5 text-lg font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 group shadow-[0_0_50px_rgba(99,102,241,0.3)]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={28} />
                        ) : (
                            <>
                                Initialize Deployment
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExamCreator;
