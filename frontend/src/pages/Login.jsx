import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Key, ArrowRight, Loader2 } from 'lucide-react';
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
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass p-6 md:p-10 shadow-2xl relative overflow-hidden border-white/10">
                    {/* Decorative background element */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="text-center mb-8 relative">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="bg-indigo-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]"
                        >
                            <ShieldCheck className="text-indigo-500 w-10 h-10" />
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Secure Access</h1>
                        <p className="text-slate-400 text-sm md:text-base">Identity verification for University Portal</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3"
                            >
                                <div className="mt-0.5 min-w-[6px] h-[6px] bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!mfaRequired ? (
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Academic Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        className="input-field pl-12 h-14 bg-white/5 border-white/10 hover:border-white/20 focus:bg-white/10 lg:text-base"
                                        placeholder="student@univ.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Security Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        className="input-field pl-12 h-14 bg-white/5 border-white/10 hover:border-white/20 focus:bg-white/10 lg:text-base"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full h-14 text-base flex items-center justify-center gap-3 relative overflow-hidden group shadow-[0_0_40px_rgba(99,102,241,0.2)]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Sign In to Portal
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleVerifyOtp}
                            className="space-y-6"
                        >
                            <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 p-4 rounded-2xl text-sm leading-relaxed">
                                <p className="font-bold text-white mb-1 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                                    MFA Required
                                </p>
                                <p>A second factor code has been dispatched to your primary academic inbox.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center block mb-4">Verification Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border-white/10 border-2 rounded-2xl p-6 text-center text-4xl font-extrabold tracking-[0.5em] focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-white placeholder:text-white/10 uppercase"
                                        placeholder="••••••"
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    className="btn-primary w-full h-14 text-base"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Complete Verification'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMfaRequired(false)}
                                    className="w-full text-sm font-semibold text-slate-500 hover:text-white transition-colors py-2"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </motion.form>
                    )}

                    <div className="mt-8 pt-8 border-t border-white/10 text-center">
                        <p className="text-slate-400 text-sm">
                            New to SecureEXAM? <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Apply for Account</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[10px] text-slate-600 mt-6 uppercase tracking-[0.2em] font-bold">
                    Encrypted with NIST standards • ISO 27001 Certified Environment
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
