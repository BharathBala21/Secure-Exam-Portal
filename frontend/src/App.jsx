import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExamList from './pages/ExamList';
import ExamTaker from './pages/ExamTaker';
import ExamCreator from './pages/ExamCreator';
import Results from './pages/Results';
import AuditLogs from './pages/AuditLogs';
import UserManagement from './pages/UserManagement';

function App() {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) setUser(userInfo);
        setInitializing(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        navigate('/login');
    };

    if (initializing) return null;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Dynamic Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar user={user} logout={logout} />

                <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <Routes location={location}>
                                <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
                                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
                                <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
                                <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
                                <Route path="/exams" element={user ? <ExamList user={user} /> : <Navigate to="/login" />} />
                                <Route path="/exams/:id" element={user ? <ExamTaker user={user} /> : <Navigate to="/login" />} />
                                <Route path="/create-exam" element={user?.role === 'Faculty' ? <ExamCreator /> : <Navigate to="/dashboard" />} />
                                <Route path="/results" element={user ? <Results user={user} /> : <Navigate to="/login" />} />
                                <Route path="/audit" element={user?.role === 'Admin' ? <AuditLogs user={user} /> : <Navigate to="/dashboard" />} />
                                <Route path="/users" element={user?.role === 'Admin' ? <UserManagement user={user} /> : <Navigate to="/dashboard" />} />
                            </Routes>
                        </motion.div>
                    </AnimatePresence>
                </main>

                <footer className="py-6 border-t border-white/5 bg-slate-950/50 backdrop-blur-md">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                            Secure Infrastructure v4.0.2
                        </div>

                        <p className="text-[10px] text-slate-600 font-medium text-center md:text-right">
                            Digital Signature Protocol: RSA-2048/SHA-256 <br className="md:hidden" />
                            <span className="mx-2 hidden md:inline">|</span>
                            Confidentiality Standard: AES-256-CBC
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default App;
