const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');

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

        res.json({ message: 'User approved successfully' });
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
