const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Faculty', 'Student'],
        default: 'Student'
    },
    mfaSecret: { type: String }, // For TOTP or simple OTP
    otpCode: { type: String },
    otpExpires: { type: Date },
    publicKey: { type: String }, // RSA Public Key for signatures/exchange
    privateKey: { type: String }, // NOTE: Storing private key is generally insecure, but here for demonstration of key management
    rollNumber: { type: String },
    isApproved: { type: Boolean, default: false },
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});



// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
