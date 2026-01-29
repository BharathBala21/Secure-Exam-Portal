const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');
const sendEmail = require('../utils/sendEmail');

/**
 * Get all users pending approval (Students mainly)
 */
const getPendingUsers = async (req, res, next) => {
    try {
        const users = await User.find({ isApproved: false }).select('-password -privateKey');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all registered users (for general management)
 */
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password -privateKey');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

/**
 * Approve a user account
 */
const approveUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isApproved = true;
        await user.save();

        await createAuditLog({
            action: 'User Account Approved',
            user: req.user, // Admin who performed the action
            details: `Account for ${user.email} (Roll: ${user.rollNumber || 'N/A'}) has been authorized.`,
            resourceId: user._id,
            ipAddress: req.ip
        });

        // Notify user via real email
        try {
            await sendEmail({
                to: user.email,
                subject: 'Account Approved - Secure Exam Portal',
                text: `Congratulations ${user.name}, your account (Roll: ${user.rollNumber}) has been approved by the Administrator. You can now log in to the portal.`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #f1f5f9; border-radius: 20px;">
                        <h2 style="color: #10b981;">Access Authorized</h2>
                        <p>Hello <b>${user.name}</b>,</p>
                        <p>Your identity has been verified and your account is now <b>Active</b>.</p>
                        <div style="background: #1e293b; padding: 15px; border-radius: 10px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px;"><b>Roll Number:</b> ${user.rollNumber}</p>
                            <p style="margin: 5px 0 0 0; font-size: 14px;"><b>Status:</b> NIST Verified Access</p>
                        </div>
                        <p>You may now proceed to the portal and log in using your security keys.</p>
                        <p style="color: #64748b; font-size: 12px;">Secure Exam Portal Security Governance</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Failed to send approval email notification.');
        }

        res.json({ message: 'User approved successfully and notified' });
    } catch (error) {
        next(error);
    }
};

/**
 * Reject/Delete a user account
 */
const rejectUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent self-deletion
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Administrative Protocol: Self-deletion is restricted to prevent network lockouts.' });
        }

        await User.findByIdAndDelete(req.params.id);

        await createAuditLog({
            action: 'User Account Rejected',
            user: req.user,
            details: `Registration request for ${user.email} was denied and purged.`,
            status: 'Warning',
            resourceId: user._id,
            ipAddress: req.ip
        });

        res.json({ message: 'User request rejected' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPendingUsers,
    getAllUsers,
    approveUser,
    rejectUser
};
