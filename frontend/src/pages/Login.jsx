import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [mfaRequired, setMfaRequired] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { data } = await axios.post('/api/users/login', { email, password });
            if (data.mfaRequired) {
                setMfaRequired(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { data } = await axios.post('/api/users/verify-otp', { email, otp });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired security code.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="surface-card p-10 md:p-14 relative overflow-hidden">
                    {/* Minimalist branding header */}
                    <div className="text-center mb-12">
                        <div className="bg-accent-dark w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-medium">
                            <ShieldCheck className="text-white w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-text-main uppercase italic">
                            Secure <span className="text-text-muted">Access</span>
                        </h1>
                        <p className="text-text-muted text-sm font-medium mt-2 tracking-tight">Identity verification for SECURENODE</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-accent-coral/10 border border-accent-coral/20 text-accent-coral p-4 rounded-2xl text-[11px] font-black uppercase tracking-wider mb-8 flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 bg-accent-coral rounded-full animate-pulse"></div>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!mfaRequired ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Academic Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-text-main" size={18} />
                                    <input
                                        type="email"
                                        className="input-field pl-14"
                                        placeholder="user@university.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Secure Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-text-main" size={18} />
                                    <input
                                        type="password"
                                        className="input-field pl-14"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full h-16 mt-4 shadow-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Authorize Session
                                        <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleVerifyOtp}
                            className="space-y-8"
                        >
                            <div className="bg-sidebar-bg p-6 rounded-3xl border border-black/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-main mb-2 flex items-center gap-2">
                                    <Fingerprint size={14} className="text-accent-coral" />
                                    Biometric/MFA Handshake
                                </p>
                                <p className="text-xs text-text-muted font-medium leading-relaxed">
                                    A secondary verification token has been dispatched to your primary academic address.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] text-center block">Verification Token</label>
                                <input
                                    type="text"
                                    className="w-full bg-sidebar-bg rounded-[2rem] border-none p-6 text-center text-5xl font-black tracking-[0.4em] focus:bg-white focus:ring-1 focus:ring-black/5 transition-all outline-none text-text-main"
                                    placeholder="000000"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    className="btn-primary w-full h-16"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Sign in'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMfaRequired(false)}
                                    className="w-full text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-colors py-2"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </motion.form>
                    )}

                    <div className="mt-12 pt-10 border-t border-black/5 text-center">
                        <p className="text-text-muted text-xs font-medium tracking-tight">
                            New member? <Link to="/register" className="text-text-main font-black hover:underline underline-offset-4 decoration-2">Request Access</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[10px] text-text-muted mt-8 uppercase tracking-[0.4em] font-black italic">
                    NIST 800-63-2 • ISO 27001
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
