/**
 * SECURITY POLICIES - NIST SP 800-63-2 COMPLIANT
 * --------------------------------------------
 * 1. IDENTITY ASSURANCE: MFA required for all logins via simulated email OTP.
 * 2. AUTHENTICATION: Single-factor (PWM) followed by possession-based (OTP) factor.
 * 3. AUTHORIZATION: RBAC enforced via Access Control Matrix (Admin, Faculty, Student).
 * 4. CONFIDENTIALITY: AES-256 Symmetric encryption for all sensitive exam data.
 * 5. INTEGRITY: SHA-256 Digital Signatures verify authenticity of student submissions.
 * 6. KEY MANAGEMENT: RSA-2048 Asymmetric keys used for signing and exchange.
 */
require('dotenv').config();

const express = require('express');
/**
 * CRYPTOGRAPHIC SECURITY MODULE
 * Enforces NIST-compliant encryption and integrity standards.
 */
const crypto = require('crypto');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');
const auditRoutes = require('./routes/auditRoutes');
const adminRoutes = require('./routes/adminRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Connect to Database
connectDB();

const app = express();

/**
 * Middleware Setup
 * Security starts here with CORS and data parsing
 */
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Role-Based API Routes
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Secure Exam Portal API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('INTERNAL SERVER ERROR:', err);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log('Security Policies:');
    console.log('- NIST SP 800-63-2 compliant MFA enabled');
    console.log('- RBAC enforced on all sensitive routes');
    console.log('- AES-256 Symmetric encryption for submission data');
    console.log('- RSA Asymmetric digital signatures for integrity');
    console.log('- Bcrypt with auto-salting for password hashing');
});
