import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Briefcase, ChevronRight, Copy, Check, Shield, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Student',
        rollNumber: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [registeredData, setRegisteredData] = useState(null);
    const [copied, setCopied] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { data } = await axios.post('/api/users/register', formData);
            setRegisteredData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. System could not provision your profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(registeredData.privateKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (registeredData) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl"
                >
                    <div className="glass p-8 md:p-12 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                        <div className="text-center mb-10">
                            <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                                <Shield className="text-emerald-500 w-10 h-10" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Security Keys Generated</h1>
                            <p className="text-slate-400">Your profile has been provisioned with NIST-compliant asymmetric keys.</p>
                            {registeredData.role === 'Student' && (
                                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-sm font-bold flex items-center justify-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Account pending Admin approval. Access will be granted shortly.
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/50 relative group">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">Private Key (Signature Matrix)</p>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                                    >
                                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        {copied ? 'Copied' : 'Copy Key'}
                                    </button>
                                </div>
                                <textarea
                                    className="w-full bg-transparent text-slate-500 text-[11px] font-mono h-40 outline-none resize-none cursor-not-allowed leading-relaxed"
                                    readOnly
                                    value={registeredData.privateKey}
                                />
                                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none rounded-b-2xl"></div>
                            </div>

                            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3">
                                <div className="bg-rose-500/20 p-1.5 rounded-lg text-rose-500 flex-shrink-0">
                                    <Lock size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-rose-200 mb-1">Critical Security Notice</p>
                                    <p className="text-xs text-rose-400/80 leading-relaxed">This private key is required for signing all future exam submissions. In a production environment, this key would never touch our servers.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="btn-primary w-full h-14 mt-10 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                        >
                            Secure Login Account
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <div className="glass p-8 md:p-10 shadow-2xl relative">
                    <div className="text-center mb-10">
                        <div className="bg-indigo-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                            <UserPlus className="text-indigo-500 w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Create Identity</h1>
                        <p className="text-slate-400">Join the secure academic assessment network</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm mb-6 font-medium"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        className="input-field pl-12 h-12 bg-white/5 border-white/10"
                                        placeholder="Jane Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Portal Role</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 pointer-events-none" size={18} />
                                    <select
                                        className="input-field pl-12 h-12 bg-white/5 border-white/10 appearance-none cursor-pointer"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Student">Student Access</option>
                                        <option value="Faculty">Faculty Portal</option>
                                        <option value="Admin">Administrator</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        className="input-field pl-12 h-12 bg-white/5 border-white/10"
                                        placeholder="jane.doe@univ.edu"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Roll / ID Number</label>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        className="input-field pl-12 h-12 bg-white/5 border-white/10"
                                        placeholder="ROLL-2024-001"
                                        value={formData.rollNumber}
                                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                        required={formData.role === 'Student'}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Account Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    className="input-field pl-12 h-12 bg-white/5 border-white/10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full h-14 text-base font-bold flex items-center justify-center gap-3 mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Generate Security Identity
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 mt-8 text-sm">
                        Already registered? <Link to="/login" className="text-indigo-400 font-bold hover:underline underline-offset-4">Login to Portal</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};


export default Register;
