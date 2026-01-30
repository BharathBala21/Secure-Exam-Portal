import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Shield, Hash, Calendar, Key, UserCheck, ShieldCheck, Fingerprint, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = ({ user: authUser }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${authUser.token}` }
                };
                const { data } = await axios.get('/api/users/profile', config);
                setProfile(data);
            } catch (err) {
                console.error('Failed to fetch profile', err);
                setError('Identity verification node unreachable. Please re-authenticate.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [authUser.token]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-16 h-16 border-4 border-accent-dark border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Deciphering identity packet...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center gap-6">
                <div className="bg-accent-coral/10 p-8 rounded-[2.5rem] text-accent-coral">
                    <ShieldCheck size={48} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-text-main uppercase italic tracking-tighter">Access Denied</h3>
                    <p className="text-text-muted text-sm mt-2 max-w-xs">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="max-w-4xl mx-auto space-y-10 pb-20 pt-16"
        >
            <header className="text-center space-y-4">
                <motion.div variants={itemVariants} className="inline-flex items-center gap-3 bg-accent-dark text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    <Fingerprint size={14} className="text-accent-coral" />
                    Identity Certificate Root
                </motion.div>
                <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-black tracking-tighter text-text-main uppercase italic">
                    User <span className="text-text-muted">Profile</span>
                </motion.h1>
                <motion.p variants={itemVariants} className="text-text-muted font-medium">
                    Cryptographic identity verification for the <span className="text-text-main font-bold">SECURE EXAM NODE</span>
                </motion.p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <motion.div variants={itemVariants} className="md:col-span-1 space-y-8">
                    <div className="surface-card p-10 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-700">
                            <Shield size={120} />
                        </div>

                        <div className="w-24 h-24 bg-accent-dark rounded-[2rem] flex items-center justify-center text-white text-3xl font-black italic mb-6 shadow-medium relative z-10">
                            {profile.name.charAt(0)}
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-2xl font-black text-text-main tracking-tight uppercase italic mb-1">{profile.name}</h2>
                            <p className="text-xs font-black uppercase tracking-widest text-text-muted">{profile.role} NODE</p>
                        </div>

                        <div className="w-full h-[1px] bg-black/5 my-8 relative z-10"></div>

                        <div className="flex flex-col gap-4 w-full relative z-10">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-text-muted">Status</span>
                                <span className={`flex items-center gap-1.5 ${profile.isApproved ? 'text-accent-mint' : 'text-accent-coral'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${profile.isApproved ? 'bg-accent-mint animate-pulse' : 'bg-accent-coral'}`}></div>
                                    {profile.isApproved ? 'VERIFIED' : 'PENDING'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-text-muted">Secure ID</span>
                                <span className="text-text-main">#{profile._id.substring(profile._id.length - 6).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="surface-card p-8 bg-accent-dark text-white relative overflow-hidden">
                        <div className="absolute -bottom-8 -left-8 opacity-10 rotate-45">
                            <Award size={120} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                            <ShieldCheck size={16} className="text-accent-coral" /> Security Trust
                        </h3>
                        <p className="text-[10px] text-white/60 font-medium leading-relaxed mb-6 relative z-10">
                            Identity assurance level NIST SP 800-63-2 verified. All sessions are monitored for integrity.
                        </p>
                        <div className="bg-white/10 rounded-2xl p-4 border border-white/5 relative z-10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Protocol Health</p>
                            <div className="flex items-center gap-1 h-1">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="flex-1 h-full bg-accent-mint rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Details Section */}
                <motion.div variants={itemVariants} className="md:col-span-2 space-y-8">
                    <div className="surface-card p-10">
                        <h3 className="text-sm font-black text-text-main uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                            <User size={18} className="text-accent-coral" /> Credential Detail
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            <DetailItem icon={<Mail size={16} />} label="Academic Email" value={profile.email} />
                            <DetailItem icon={<Shield size={16} />} label="Platform Role" value={profile.role} />
                            {profile.rollNumber && <DetailItem icon={<Hash size={16} />} label="Roll/Faculty ID" value={profile.rollNumber} />}
                            <DetailItem icon={<Calendar size={16} />} label="Enrolled Since" value={new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} />
                        </div>
                    </div>

                    <div className="surface-card p-10 bg-sidebar-bg/50 border-dashed flex flex-col items-center justify-center text-center gap-6">
                        <div className="bg-white p-6 rounded-full text-accent-mint shadow-sm">
                            <Key size={32} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-text-main uppercase tracking-[0.2em] mb-2">Cryptographic Material</h3>
                            <p className="text-[10px] text-text-muted font-medium max-w-xs leading-relaxed">
                                Your identity node is secured with RSA-2048 encryption. Public keys are managed by the central authority.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

const DetailItem = ({ icon, label, value }) => (
    <div className="space-y-1.5">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
            {icon} {label}
        </p>
        <p className="text-base font-bold text-text-main italic break-all">{value}</p>
    </div>
);

export default Profile;
