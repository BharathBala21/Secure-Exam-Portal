import React, { useState, useEffect } from 'react';
import {
    Shield, BookOpen, Clock, FileText, CheckCircle,
    ArrowUpRight, Activity, Zap, Fingerprint, Users,
    Layout, Plus, BarChart3, ShieldCheck, Award, Megaphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const Dashboard = ({ user }) => {
    const [stats, setStats] = useState({
        activeExams: 0,
        meanScore: 0,
        avgDuration: '0m',
        pendingUsers: 0,
        activeUsers: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('/api/exams/stats', config);
                setStats(data);
            } catch (err) {
                console.error('Stats fetch failed');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="space-y-12"
        >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-main">
                        Exam <span className="text-text-muted italic">Dashboard</span>
                    </h1>
                    <p className="text-text-muted mt-2 font-medium">
                        Secure session established for <span className="text-text-main font-bold">{user.name}</span>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {user.role === 'Faculty' && (
                        <Link to="/create-exam" className="btn-primary">
                            <Plus size={18} className="mr-2" />
                            Create Exam
                        </Link>
                    )}
                    {(user.role === 'Admin' || user.role === 'Faculty') && (
                        <Link to="/results" className="btn-secondary">
                            <BarChart3 size={18} className="mr-2" />
                            Analytics
                        </Link>
                    )}
                </div>
            </header>

            {/* Top Stats - Dynamic labels based on identity role */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    title={user.role === 'Admin' ? "Total Users" : (user.role === 'Student' ? "Exams Available" : "Active Exams")}
                    value={user.role === 'Admin' ? stats.totalUsers : stats.activeExams}
                    icon={<Users size={24} />}
                    trend={user.role === 'Admin' ? "Registered" : (user.role === 'Student' ? "Current" : "+12%")}
                    color={user.role === 'Admin' ? "dark" : "coral"}
                    isLoading={isLoading}
                />
                <StatCard
                    title={user.role === 'Admin' ? "Audit Logs" : (user.role === 'Student' ? "My Average" : "Mean Performance")}
                    value={user.role === 'Admin' ? stats.totalAudits : stats.meanScore}
                    icon={<Fingerprint size={24} />}
                    trend={user.role === 'Admin' ? "Synchronized" : (user.role === 'Student' ? "Aggregated" : "+8%")}
                    color="mint"
                    isLoading={isLoading}
                />
                <StatCard
                    title={user.role === 'Admin' ? "Pending Approvals" : (user.role === 'Student' ? "Exams Taken" : "System Users")}
                    value={user.role === 'Admin' ? stats.pendingUsers : stats.activeUsers}
                    icon={<ShieldCheck size={24} />}
                    trend={user.role === 'Admin' ? "Review Needed" : (user.role === 'Student' ? "Completed" : "+2")}
                    color="coral"
                    isLoading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product activity style list */}
                <div className="lg:col-span-2 surface-card p-10">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
                            {user.role === 'Student' ? 'Assessment' : (user.role === 'Admin' ? 'Management' : 'Portal')} <span className="text-text-muted italic">activity</span>
                        </h2>
                        {user.role === 'Admin' ? (
                            <Link to="/users" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main flex items-center gap-2">
                                Manage Users <ArrowUpRight size={14} />
                            </Link>
                        ) : (
                            <span className="badge-mint">Live Monitoring</span>
                        )}
                    </div>

                    <div className="space-y-6">
                        {user.role === 'Student' ? (
                            <div className="p-10 border-dashed border-2 border-black/5 rounded-[2rem] flex flex-col items-center justify-center text-center gap-6">
                                <div className="w-16 h-16 bg-sidebar-bg rounded-full flex items-center justify-center text-text-muted">
                                    <Award size={32} />
                                </div>
                                <div>
                                    <h3 className="font-black text-text-main italic uppercase tracking-tighter text-xl">Result Hub</h3>
                                    <p className="text-text-muted text-sm mt-2 max-w-xs mx-auto">Your cryptographically signed performance ledger is available for review.</p>
                                </div>
                                <Link to="/results" className="btn-primary w-full max-w-[200px] h-12 text-[10px]">
                                    View All Records <ArrowUpRight size={14} className="ml-2" />
                                </Link>
                            </div>
                        ) : user.role === 'Admin' ? (
                            <AdminUserQuickControl user={user} />
                        ) : (
                            [
                                { action: 'Identity Verification', details: 'NIST 800-63-2 MFA validated via protocol', time: 'Just now', color: 'mint' },
                                { action: 'Digital Signature Integrity', details: 'Block ID #8812 - RSA integrity confirmed', time: '12m ago', color: 'coral' },
                                { action: 'Middleware ACL Sync', details: 'Hierarchical permission granted for objects', time: '1h ago', color: 'dark' },
                                { action: 'AES-256 Buffer Seal', details: 'Submission data symmetrically encrypted', time: '3h ago', color: 'mint' },
                            ].map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-sidebar-bg/50 rounded-3xl border border-transparent hover:border-black/5 hover:bg-white transition-all cursor-default group">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-3 h-3 rounded-full ${log.color === 'coral' ? 'bg-accent-coral' : log.color === 'mint' ? 'bg-accent-mint' : 'bg-accent-dark'}`}></div>
                                        <div>
                                            <p className="font-bold text-text-main group-hover:translate-x-1 transition-transform">{log.action}</p>
                                            <p className="text-xs text-text-muted mt-1">{log.details}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{log.time}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Secure Announcements Node */}
                <div className="lg:col-span-1 space-y-8">
                    <AnnouncementBlock user={user} />

                    {/* Right side Info Card */}
                    <div className="surface-card p-10 bg-accent-dark text-white flex flex-col justify-between overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none scale-150 transform rotate-12">
                            <ShieldCheck size={200} />
                        </div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                                <Shield size={28} className="text-accent-coral" />
                            </div>
                            <h3 className="text-2xl font-black italic tracking-tighter mb-4">Security Status</h3>
                            <p className="text-sm text-white/60 leading-relaxed font-medium">
                                {user.role === 'Admin'
                                    ? "Administrative override active. Full oversight of the secure exam network and user archives is enabled."
                                    : "Your session is secured with NIST Level 3 protocols for a tamper-proof exam environment."}
                            </p>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="h-[1px] bg-white/10 w-full mb-6"></div>
                            <div className="flex flex-col gap-3">
                                {(user.role === 'Admin' || user.role === 'Faculty') && (
                                    <Link to="/audit" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2">
                                        <Fingerprint size={14} /> View Audit Logs
                                    </Link>
                                )}
                                {user.role === 'Admin' && (
                                    <Link to="/users" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2">
                                        <Users size={14} /> User Management
                                    </Link>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const AnnouncementBlock = ({ user }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('/api/messages/inbox', config);
                // Filter for broadcasts and take the last 3
                const broadcasts = data.filter(m => m.isBroadcast).slice(0, 3);
                setAnnouncements(broadcasts);
            } catch (err) {
                console.error('Failed to fetch announcements');
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, [user.token]);

    return (
        <div className="surface-card p-10 bg-white border-l-4 border-l-accent-coral">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                    <Megaphone size={18} className="text-accent-coral" /> Announcements
                </h3>
                <Link to="/messages" className="text-[10px] font-black uppercase text-text-muted hover:text-text-main transition-colors">
                    Inbox
                </Link>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-sidebar-bg rounded-2xl"></div>
                    <div className="h-12 bg-sidebar-bg rounded-2xl"></div>
                </div>
            ) : announcements.length > 0 ? (
                <div className="space-y-6">
                    {announcements.map((ann, i) => (
                        <div key={ann._id} className="relative pl-6 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:bg-accent-coral/30 before:rounded-full">
                            <p className="text-xs font-bold text-text-main line-clamp-2 leading-relaxed">
                                {ann.content}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{ann.sender.name}</span>
                                <span className="text-[9px] text-text-muted/60">{new Date(ann.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-6 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted italic opacity-40">No active announcements</p>
                </div>
            )}
        </div>
    );
};

const AdminUserQuickControl = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/admin/all', config);
            setUsers(data.slice(0, 5)); // Show only 5 for quick control
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const removeUser = async (id) => {
        if (!window.confirm('Are you sure you want to purge this identity from the network?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`/api/admin/reject/${id}`, config);
            fetchUsers();
        } catch (err) {
            alert('Purge failed');
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Zap className="animate-spin text-text-muted" /></div>;

    return (
        <div className="space-y-4">
            {users.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-5 bg-sidebar-bg/50 rounded-2xl border border-transparent hover:border-black/5 hover:bg-white transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent-dark flex items-center justify-center text-white text-xs font-black">
                            {u.role[0]}
                        </div>
                        <div>
                            <p className="font-bold text-text-main text-sm uppercase italic">{u.name}</p>
                            <p className="text-[10px] text-text-muted font-black tracking-widest leading-none mt-1">{u.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${u.isApproved ? 'bg-accent-mint/10 text-accent-mint' : 'bg-accent-coral/10 text-accent-coral'}`}>
                            {u.isApproved ? 'Active' : 'Pending'}
                        </span>
                        {u._id !== user._id && (
                            <button
                                onClick={() => removeUser(u._id)}
                                className="p-2 text-text-muted hover:text-accent-coral transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove User"
                            >
                                <Shield size={16} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, color, isLoading }) => {
    return (
        <div className="surface-card p-10 group relative overflow-hidden flex items-end justify-between hover:-translate-y-1">
            {/* Background icon inspired by image */}
            <div className="absolute top-10 left-10 text-text-muted/10 group-hover:scale-110 group-hover:text-text-muted/20 transition-all duration-700">
                {icon}
            </div>

            <div className="relative z-10">
                <p className="text-sm font-bold text-text-muted mb-2 tracking-tight">{title}</p>
                <div className="text-5xl font-black tracking-tighter text-text-main">
                    {isLoading ? <span className="animate-pulse">...</span> : value}
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-end gap-4">
                <div className={`badge-${color === 'coral' ? 'coral' : color === 'mint' ? 'mint' : 'dark'} flex items-center gap-1`}>
                    <ArrowUpRight size={12} />
                    {trend}
                </div>
                {/* Small abstract spark line representation inspired by image */}
                <div className={`w-20 h-8 flex items-end gap-1 px-1`}>
                    {[0.4, 0.7, 0.3, 0.9, 0.6, 1].map((h, i) => (
                        <div
                            key={i}
                            style={{ height: `${h * 100}%` }}
                            className={`flex-1 rounded-full ${color === 'coral' ? 'bg-accent-coral/20' : color === 'mint' ? 'bg-accent-mint/20' : 'bg-accent-dark/20'}`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
