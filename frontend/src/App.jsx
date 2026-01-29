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
import Messaging from './pages/Messaging';

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
        if (window.confirm("End secure session?")) {
            localStorage.removeItem('userInfo');
            setUser(null);
            navigate('/login');
        }
    };

    if (initializing) return null;

    return (
        <div className="min-h-screen bg-page-bg text-text-main overflow-x-hidden flex">
            {/* Minimalist Sidebar Layout support or standard container */}
            <div className="flex-1 flex flex-col min-h-screen">
                <Navbar user={user} logout={logout} />

                <main className="flex-1 container mx-auto px-6 pt-24 pb-12 max-w-7xl relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
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
                                <Route path="/messages" element={user ? <Messaging user={user} /> : <Navigate to="/login" />} />
                            </Routes>
                        </motion.div>
                    </AnimatePresence>
                </main>

                <footer className="py-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">
                    Secure Exam Portal • Infrastructure STABLE • 2026
                </footer>
            </div>
        </div>
    );
}

export default App;
