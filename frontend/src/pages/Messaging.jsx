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
            alert(err.response?.data?.message || 'Message send failed');
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
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-main italic uppercase">
                        Portal <span className="text-text-muted">Messaging</span>
                    </h1>
                    <p className="text-text-muted mt-2 font-medium flex items-center gap-2">
                        <Shield className="text-accent-coral" size={18} />
                        End-to-End Encrypted Communication Center
                    </p>
                </div>

                <button
                    onClick={() => setShowCompose(true)}
                    className="btn-primary"
                >
                    <Send size={18} className="mr-2" />
                    Compose Message
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="xl:col-span-1 space-y-8">
                    <div className="surface-card p-10 bg-white border-t-4 border-t-accent-dark">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
                            <Activity size={18} className="text-text-main" /> Messaging Security
                        </h3>

                        <div className="space-y-6">
                            <ProtocolItem label="Encryption" value="AES-256-CBC" icon={<Lock size={12} />} />
                            <ProtocolItem label="Verification" value="RSA Signature" icon={<Fingerprint size={12} />} />
                            <ProtocolItem label="Integrity" value="SHA-256 Hash" icon={<ShieldCheck size={12} />} />
                            <ProtocolItem label="Status" value="Secure" icon={<Clock size={12} />} />
                        </div>
                    </div>

                    <div className="surface-card p-8 bg-accent-dark text-white relative overflow-hidden">
                        <Megaphone size={120} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4">Security Level</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-white/60">Algorithm</span>
                                <span className="text-accent-mint font-bold uppercase">AES-256</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-white/60">Digital Sig</span>
                                <span className="text-accent-coral font-bold uppercase">RSA-Verify</span>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-[10px] text-white/40 leading-relaxed italic">
                                    Your messages are encrypted and only accessible to authorized recipients.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <div className="surface-card p-6 mb-6">
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                className="input-field pl-14 h-14"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

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
                                    className={`surface-card p-8 group hover:border-black/10 transition-all ${msg.isBroadcast ? 'border-l-4 border-l-accent-coral' : 'border-l-4 border-l-accent-mint'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm uppercase ${msg.sender.role === 'Faculty' ? 'bg-accent-coral text-white' :
                                                msg.sender.role === 'Admin' ? 'bg-accent-dark text-white' : 'bg-sidebar-bg text-text-main'
                                                }`}>
                                                {msg.sender.name[0]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${msg.isBroadcast ? 'bg-accent-coral/20 text-accent-coral' : 'bg-accent-mint/20 text-accent-mint'}`}>
                                                        {msg.isBroadcast ? 'Announcement' : 'Private'}
                                                    </span>
                                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                                        {msg.sender.name}
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
                                                        <ShieldCheck size={12} /> Encrypted
                                                    </span>
                                                    {msg.signature && (
                                                        <span className="flex items-center gap-1 text-accent-coral">
                                                            <Fingerprint size={12} /> Verified Origin
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="surface-card p-12 bg-white flex flex-col items-center gap-6 text-center border-dashed">
                                <Mail size={48} className="text-text-muted opacity-20" />
                                <div>
                                    <p className="text-sm font-black text-text-muted uppercase tracking-[0.2em]">No messages found</p>
                                    <p className="text-xs text-text-muted/60 mt-2">Commence secure communication to see history here.</p>
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
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">New <span className="text-text-muted">Message</span></h2>
                                    <button
                                        onClick={() => setShowCompose(false)}
                                        className="text-text-muted hover:text-text-main font-black uppercase tracking-[0.2em] text-[10px]"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <form onSubmit={handleSend} className="space-y-8">
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
                                                <Megaphone size={16} className="text-accent-coral" /> Broadcast to All Students
                                            </label>
                                        </div>
                                    )}

                                    {!newMessage.isBroadcast && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Select Recipient</label>
                                            <select
                                                className="input-field h-14"
                                                value={newMessage.receiverId}
                                                onChange={(e) => setNewMessage({ ...newMessage, receiverId: e.target.value })}
                                                required={!newMessage.isBroadcast}
                                            >
                                                <option value="">Choose User...</option>
                                                {recipients.map(r => (
                                                    <option key={r._id} value={r._id}>{r.name} ({r.role})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Message Body</label>
                                        <textarea
                                            className="input-field min-h-[160px] py-6 resize-none"
                                            placeholder="Write your message here..."
                                            value={newMessage.content}
                                            onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="p-6 bg-accent-mint/5 border border-accent-mint/10 rounded-2xl flex items-center gap-4">
                                        <Lock size={20} className="text-accent-mint" />
                                        <p className="text-[10px] text-accent-mint font-black uppercase tracking-widest">
                                            AES-256 Encryption will be applied automatically.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-primary w-full h-16"
                                        disabled={isSending}
                                    >
                                        {isSending ? 'Encrypting & Sending...' : 'Secure Send'}
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

const ProtocolItem = ({ label, value, icon }) => (
    <div className="flex items-center justify-between group/proto">
        <div className="flex items-center gap-3">
            <div className="text-text-muted group-hover/proto:text-text-main transition-colors">
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40">{label}</span>
        </div>
        <span className="text-[10px] font-black text-text-main tracking-tight uppercase">{value}</span>
    </div>
);

const Activity = ({ size, className }) => <Shield size={size} className={className} />;

export default Messaging;
