import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, UserX, Search, Shield, ShieldAlert, Mail, Hash, Trash2 } from 'lucide-react';
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
        <div className="space-y-8 pb-12">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        User <span className="gradient-text">Governance</span>
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <Users className="text-indigo-500" size={16} />
                        Manage identity provision and access authorization
                    </p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setTab('pending')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'pending' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Pending Requests
                    </button>
                    <button
                        onClick={() => setTab('all')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        All Members
                    </button>
                </div>
            </header>

            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Filter by name, email or roll number..."
                        className="input-field pl-12 h-12 bg-white/5 border-white/10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        [1, 2].map(i => <div key={i} className="glass h-32 animate-pulse border-white/5"></div>)
                    ) : filteredUsers.length === 0 ? (
                        <div className="glass p-20 text-center flex flex-col items-center gap-4 border-dashed border-white/10">
                            <Shield className="text-slate-700" size={48} />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No verification requests in this segment.</p>
                        </div>
                    ) : (
                        filteredUsers.map((u, index) => (
                            <motion.div
                                key={u._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${u.isApproved ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                                        {u.role === 'Student' ? <Users size={24} /> : <Shield size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-white">{u.name}</h3>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border ${u.role === 'Student' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}>
                                                {u.role}
                                            </span>
                                            {!u.isApproved && (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">
                                                    <ShieldAlert size={10} /> Pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 mt-1">
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5 leading-none">
                                                <Mail size={12} /> {u.email}
                                            </p>
                                            {u.rollNumber && (
                                                <p className="text-xs text-slate-500 flex items-center gap-1.5 leading-none bg-white/5 px-2 py-1 rounded">
                                                    <Hash size={12} /> {u.rollNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {!u.isApproved ? (
                                        <>
                                            <button
                                                onClick={() => handleApprove(u._id)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                                            >
                                                <UserCheck size={16} /> Approve Access
                                            </button>
                                            <button
                                                onClick={() => handleReject(u._id)}
                                                className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                                                title="Reject Request"
                                            >
                                                <UserX size={20} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleReject(u._id)}
                                            className="p-3 text-slate-600 hover:text-rose-500 transition-all"
                                            title="Revoke Access"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
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
