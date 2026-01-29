import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, UserX, Search, Shield, ShieldAlert, Mail, Hash, Trash2, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tab, setTab] = useState('pending'); // 'pending' | 'all'

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const endpoint = tab === 'pending' ? '/api/admin/pending' : '/api/admin/all';
            const { data } = await axios.get(endpoint, config);
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [user, tab]);

    const handleApprove = async (id) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.put(`/api/admin/approve/${id}`, {}, config);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            alert('Approval failed');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject and purge this request?')) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.delete(`/api/admin/reject/${id}`, config);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            alert('Rejection failed');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-main italic uppercase">
                        Identity <span className="text-text-muted">Registry</span>
                    </h1>
                    <p className="text-text-muted mt-2 font-medium flex items-center gap-2">
                        <Users className="text-accent-mint" size={18} />
                        Governance of system provision and node authorization protocols
                    </p>
                </div>

                <div className="flex bg-sidebar-bg p-1 rounded-2xl border border-black/5">
                    <button
                        onClick={() => setTab('pending')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'pending' ? 'bg-accent-dark text-white shadow-medium' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Verification Queue
                    </button>
                    <button
                        onClick={() => setTab('all')}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'all' ? 'bg-accent-dark text-white shadow-medium' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Active Ledger
                    </button>
                </div>
            </header>

            <div className="flex items-center gap-4">
                <div className="relative group flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-text-main" size={18} />
                    <input
                        type="text"
                        placeholder="Search identity or credential hash..."
                        className="input-field pl-14 h-14"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="surface-card h-32 animate-pulse bg-white/50 border-dashed border-black/5"></div>
                        ))
                    ) : filteredUsers.length === 0 ? (
                        <div className="surface-card p-24 text-center flex flex-col items-center gap-6 border-dashed">
                            <Shield size={48} className="text-text-muted opacity-20" />
                            <p className="text-text-muted font-black uppercase tracking-[0.3em] text-[10px]">No verification requests detected in this segment.</p>
                        </div>
                    ) : (
                        filteredUsers.map((u, index) => (
                            <motion.div
                                key={u._id}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="surface-card group hover:shadow-medium transition-all duration-500 bg-white"
                            >
                                <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border transition-all duration-500 ${u.isApproved ? 'bg-accent-mint/10 border-accent-mint/20 text-accent-mint' : 'bg-accent-coral/10 border-accent-coral/20 text-accent-coral'}`}>
                                            {u.role === 'Student' ? <Users size={28} /> : <Shield size={28} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-2xl font-black text-text-main tracking-tighter uppercase italic">{u.name}</h3>
                                                <span className={`text-[10px] font-black border px-3 py-1 rounded-lg uppercase tracking-widest ${u.role === 'Student' ? 'border-accent-mint/20 text-accent-mint' : 'border-purple-200 text-purple-600'}`}>
                                                    {u.role} Node
                                                </span>
                                                {!u.isApproved && (
                                                    <span className="badge-coral items-center gap-1.5 flex transition-transform group-hover:scale-110">
                                                        <ShieldAlert size={10} /> Handshake Pending
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-6 mt-2">
                                                <p className="text-xs text-text-muted font-black tracking-tight flex items-center gap-2">
                                                    <Mail size={14} className="opacity-50" /> {u.email}
                                                </p>
                                                {u.rollNumber && (
                                                    <p className="text-[10px] font-black bg-sidebar-bg px-3 py-1 rounded-lg text-text-muted uppercase tracking-widest">
                                                        CRD: {u.rollNumber}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                                        {!u.isApproved ? (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(u._id)}
                                                    className="btn-primary flex-1 md:flex-none py-4 px-8"
                                                >
                                                    <UserCheck size={18} className="mr-2" />
                                                    Authorize
                                                </button>
                                                <button
                                                    onClick={() => handleReject(u._id)}
                                                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-black/5 text-text-muted hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                                                    title="Purge Request"
                                                >
                                                    <UserX size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleReject(u._id)}
                                                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-black/5 text-text-muted hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                                                title="Revoke Permission"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UserManagement;
