const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateRSAKeys } = require('../utils/security');
const { createAuditLog } = require('../utils/auditLogger');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Register a new user
 * NIST SP 800-63-2: Level 1-3 Identity Assurance
 */
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role, rollNumber } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate RSA keys
        const { publicKey, privateKey } = generateRSAKeys();

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Student',
            rollNumber,
            isApproved: (role === 'Admin' || role === 'Faculty') ? true : false,
            publicKey,
            privateKey
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                publicKey: user.publicKey,
                privateKey: user.privateKey
            });

            await createAuditLog({
                action: 'User Registration',
                user: user,
                details: `New account provisioned with role: ${user.role}. RSA Keys generated.`,
                ipAddress: req.ip
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (!user.isApproved) {
                return res.status(403).json({ message: 'Account pending admin approval. Access denied.' });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otpCode = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000;
            await user.save();

            await createAuditLog({
                action: 'Login Attempt - MFA Sent',
                user: user,
                details: 'Primary password verified. Possession-based OTP issued.',
                ipAddress: req.ip
            });

            console.log(`[SIMULATED EMAIL] OTP for ${user.email}: ${otp}`);

            res.json({
                message: 'OTP sent to email',
                email: user.email,
                mfaRequired: true
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
};

const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (user && user.otpCode === otp && user.otpExpires > Date.now()) {
            user.otpCode = undefined;
            user.otpExpires = undefined;
            await user.save();

            await createAuditLog({
                action: 'MFA Verified',
                user: user,
                details: 'OTP confirmed. Access token generated.',
                ipAddress: req.ip
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                publicKey: user.publicKey
            });
        } else {
            res.status(401).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, loginUser, verifyOTP };
