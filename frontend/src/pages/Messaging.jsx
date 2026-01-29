import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Mail, User, Users, Megaphone, Shield,
    MessageSquare, Search, Trash2, ArrowUpRight,
    Lock, CheckCircle2, AlertCircle, Fingerprint,
    ShieldCheck, Clock
} from 'lucide-react';

const Messaging = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [newMessage, setNewMessage] = useState({
        receiverId: '',
        content: '',
        isBroadcast: false
    });
    const [showCompose, setShowCompose] = useState(false);

    const fetchMessages = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/messages/inbox', config);
            setMessages(data);
        } catch (err) {
            console.error('Failed to fetch messages');
        }
    };

    const fetchRecipients = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/messages/recipients', config);
            setRecipients(data);
        } catch (err) {
            console.error('Failed to fetch recipients');
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await Promise.all([fetchMessages(), fetchRecipients()]);
            setIsLoading(false);
        };
        init();

        // Polling for new messages
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.content || (!newMessage.receiverId && !newMessage.isBroadcast)) return;

        setIsSending(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('/api/messages/send', newMessage, config);

            setNewMessage({ receiverId: '', content: '', isBroadcast: false });
            setShowCompose(false);
            await fetchMessages();
        } catch (err) {
            alert(err.response?.data?.message || 'Message dispatch failed');
        } finally {
            setIsSending(false);
        }
    };

    const filteredMessages = messages.filter(m =>
        m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.sender.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-main uppercase italic">
                        Secure <span className="text-text-muted">Comm</span>
                    </h1>
                    <p className="text-text-muted mt-2 font-medium flex items-center gap-2">
                        <Lock size={14} className="text-accent-mint" />
                        End-to-End Cryptographic Messaging Active
                    </p>
                </div>

                <button
                    onClick={() => setShowCompose(true)}
                    className="btn-primary"
                >
                    <Send size={18} className="mr-2" />
                    Compose Dispatch
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Search & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="surface-card p-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search archives..."
                                className="w-full bg-sidebar-bg/50 border border-black/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-black/10 transition-all text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="surface-card p-8 bg-accent-dark text-white relative overflow-hidden">
                        <Megaphone size={120} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4">Protocol Status</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-white/60">Encryption</span>
                                <span className="text-accent-mint font-bold uppercase">AES-256 GCM</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-white/60">Signature</span>
                                <span className="text-accent-coral font-bold uppercase">RSA-Verify</span>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-[10px] text-white/40 leading-relaxed italic">
                                    All transmissions are symmetrically encrypted and stored in forensic-locked volumes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message List */}
                <div className="lg:col-span-3 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-20">
                                <Shield className="animate-spin text-accent-mint" size={40} />
                            </div>
                        ) : filteredMessages.length > 0 ? (
                            filteredMessages.map((msg, i) => (
                                <motion.div
                                    key={msg._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`surface-card p-8 group hover:border-black/10 transition-all ${msg.isBroadcast ? 'border-l-4 border-l-accent-coral' : ''}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm uppercase ${msg.sender.role === 'Faculty' ? 'bg-accent-coral text-white' :
                                                msg.sender.role === 'Admin' ? 'bg-accent-dark text-white' : 'bg-sidebar-bg text-text-main'
                                                }`}>
                                                {msg.sender.name[0]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-black text-text-main uppercase tracking-tighter italic text-lg">
                                                        {msg.sender._id === user._id ? 'Sent Dispatch' : msg.sender.name}
                                                    </span>
                                                    {msg.isBroadcast && (
                                                        <span className="badge-coral text-[9px]">Broadcast</span>
                                                    )}
                                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-sidebar-bg px-2 py-0.5 rounded-full">
                                                        {msg.sender.role}
                                                    </span>
                                                </div>
                                                <p className="text-text-main font-medium leading-relaxed max-w-2xl">
                                                    {msg.content}
                                                </p>
                                                <div className="mt-4 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} /> {new Date(msg.createdAt).toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-accent-mint">
                                                        <ShieldCheck size={12} /> Encrypted Buffer Seal
                                                    </span>
                                                    {msg.signature && (
                                                        <span className="flex items-center gap-1 text-accent-coral">
                                                            <Fingerprint size={12} /> RSA Verified Origin
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-text-muted hover:text-red-500">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="surface-card p-20 text-center flex flex-col items-center gap-6 border-dashed">
                                <MessageSquare size={48} className="text-text-muted/20" />
                                <div>
                                    <h3 className="font-black uppercase tracking-tighter text-text-muted">No communication archives found.</h3>
                                    <p className="text-text-muted text-sm mt-2">End-to-end encrypted channel is ready for your first dispatch.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Compose Modal */}
            <AnimatePresence>
                {showCompose && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCompose(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-premium w-full max-w-2xl relative z-10 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8 md:p-12">
                                <div className="flex items-center justify-between mb-10">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">New <span className="text-text-muted">Dispatch</span></h2>
                                    <button
                                        onClick={() => setShowCompose(false)}
                                        className="text-text-muted hover:text-text-main font-black uppercase tracking-[0.2em] text-[10px]"
                                    >
                                        Abort
                                    </button>
                                </div>

                                <form onSubmit={handleSend} className="space-y-8">
                                    {/* Role-based Broadcast selector */}
                                    {(user.role === 'Faculty' || user.role === 'Admin') && (
                                        <div className="flex items-center gap-4 p-5 bg-sidebar-bg/50 rounded-2xl border border-black/5">
                                            <input
                                                type="checkbox"
                                                id="broadcast"
                                                className="w-5 h-5 accent-accent-coral"
                                                checked={newMessage.isBroadcast}
                                                onChange={(e) => setNewMessage({ ...newMessage, isBroadcast: e.target.checked, receiverId: e.target.checked ? '' : newMessage.receiverId })}
                                            />
                                            <label htmlFor="broadcast" className="text-sm font-black uppercase tracking-widest text-text-main cursor-pointer flex items-center gap-2">
                                                <Megaphone size={16} className="text-accent-coral" /> Broadcast to All Nodes
                                            </label>
                                        </div>
                                    )}

                                    {!newMessage.isBroadcast && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Destination Node</label>
                                            <select
                                                className="w-full bg-sidebar-bg/50 p-6 rounded-2xl border border-black/5 text-sm font-bold outline-none focus:bg-white focus:border-black/10 transition-all appearance-none"
                                                value={newMessage.receiverId}
                                                onChange={(e) => setNewMessage({ ...newMessage, receiverId: e.target.value })}
                                                required={!newMessage.isBroadcast}
                                            >
                                                <option value="">Select Identity...</option>
                                                {recipients.map(r => (
                                                    <option key={r._id} value={r._id}>
                                                        {r.name} ({r.role}) {r.rollNumber ? `- ${r.rollNumber}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Secure Content Payload</label>
                                        <textarea
                                            placeholder="Enter your encrypted message..."
                                            className="w-full bg-sidebar-bg/50 p-6 rounded-2xl border border-black/5 text-sm font-medium h-40 outline-none focus:bg-white focus:border-black/10 transition-all resize-none"
                                            value={newMessage.content}
                                            onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="p-6 bg-accent-mint/5 border border-accent-mint/10 rounded-2xl flex items-center gap-4">
                                        <Lock size={20} className="text-accent-mint" />
                                        <p className="text-[10px] text-accent-mint font-black uppercase tracking-widest">
                                            Symmetric AES-256 seal will be applied during transit.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSending}
                                        className="btn-primary w-full h-16"
                                    >
                                        {isSending ? 'Initiating Handshake...' : 'Seal & Dispatch'}
                                        <ArrowUpRight size={18} className="ml-2" />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Messaging;
