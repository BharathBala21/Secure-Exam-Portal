import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Briefcase, ChevronRight, Copy, Check, Shield, FileText, Loader2, Award, ArrowUpRight, AlertTriangle } from 'lucide-react';
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
            <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl"
                >
                    <div className="surface-card p-10 md:p-14 relative overflow-hidden bg-white">
                        <div className="text-center mb-12">
                            <div className="bg-accent-mint/10 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-accent-mint/20 shadow-medium">
                                <Shield className="text-accent-mint w-12 h-12" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tighter uppercase italic mb-3">
                                Identity <span className="text-text-muted">Provisioned</span>
                            </h1>
                            <p className="text-text-muted font-medium">Your profile has been cryptographically secured with asymmetric keys.</p>

                            {registeredData.role === 'Student' && (
                                <div className="mt-8 p-5 bg-accent-coral/5 border border-accent-coral/10 rounded-2xl text-accent-coral text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3">
                                    <div className="w-2 h-2 bg-accent-coral rounded-full animate-pulse"></div>
                                    Awaiting Administrative Handshake (Approval Pending)
                                </div>
                            )}
                        </div>

                        <div className="space-y-8">
                            <div className="bg-sidebar-bg p-8 rounded-[2rem] border border-black/5 relative group">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-[10px] font-black text-text-main uppercase tracking-[0.3em]">Signature Matrix (Private Key)</p>
                                    <button
                                        onClick={copyToClipboard}
                                        className="btn-secondary py-2 px-4 h-auto normal-case tracking-normal text-xs"
                                    >
                                        {copied ? <Check size={14} className="text-accent-mint mr-2" /> : <Copy size={14} className="mr-2" />}
                                        {copied ? 'Captured' : 'Capture Key'}
                                    </button>
                                </div>
                                <div className="relative group/key">
                                    <textarea
                                        className="w-full bg-white/50 p-6 rounded-2xl border border-black/5 text-text-muted text-[11px] font-mono h-44 outline-none resize-none cursor-not-allowed leading-relaxed shadow-inner"
                                        readOnly
                                        value={registeredData.privateKey}
                                    />
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] rounded-2xl opacity-0 group-hover/key:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <Lock className="text-text-muted" size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 rounded-2xl border border-red-100 bg-red-50/50">
                                <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                                <div>
                                    <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Critical Protocol Notice</p>
                                    <p className="text-[11px] text-red-400 font-medium leading-relaxed">This matrix is required for all cryptographic signings. Failure to store this key will result in permanent loss of participation capabilities. We do not persist this key on our nodes.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="btn-primary w-full h-16 mt-12"
                        >
                            Authorize Initial Login
                            <ArrowUpRight className="ml-3" size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="surface-card p-10 md:p-14 relative bg-white">
                    <div className="text-center mb-12">
                        <div className="bg-accent-dark w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-medium">
                            <UserPlus className="text-white w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-text-main uppercase italic">
                            Initialize <span className="text-text-muted">Identity</span>
                        </h1>
                        <p className="text-text-muted text-sm font-medium mt-2">Provision a new node on the secure academic network</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-accent-coral/10 border border-accent-coral/20 text-accent-coral p-4 rounded-2xl text-[11px] font-black uppercase tracking-wider mb-8"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleRegister} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Full Legal Name</label>
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-text-main" size={18} />
                                    <input
                                        type="text"
                                        className="input-field pl-14 h-14"
                                        placeholder="Jane Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Node Role</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-text-main pointer-events-none" size={18} />
                                    <select
                                        className="input-field pl-14 h-14 appearance-none cursor-pointer font-black text-[11px] uppercase tracking-widest"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Student">Student Node</option>
                                        <option value="Faculty">Faculty Portal</option>
                                        <option value="Admin">Administrator</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Official Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-text-main" size={18} />
                                    <input
                                        type="email"
                                        className="input-field pl-14 h-14"
                                        placeholder="jane.doe@university.edu"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Credential ID</label>
                                <div className="relative group">
                                    <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-text-main" size={18} />
                                    <input
                                        type="text"
                                        className="input-field pl-14 h-14 font-mono text-xs uppercase"
                                        placeholder="ROLL-2024-OX"
                                        value={formData.rollNumber}
                                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                        required={formData.role === 'Student'}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Account Passkey</label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-text-main" size={18} />
                                <input
                                    type="password"
                                    className="input-field pl-14 h-14"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full h-16 mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    Provision Identity
                                    <ChevronRight size={18} className="ml-3" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-10 border-t border-black/5 text-center">
                        <p className="text-text-muted text-xs font-medium tracking-tight">
                            Identity already provisioned? <Link to="/login" className="text-text-main font-black hover:underline underline-offset-4 decoration-2">Access Portal</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
