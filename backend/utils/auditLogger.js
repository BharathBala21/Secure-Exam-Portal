const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');

const createAuditLog = async ({ action, user, details, status, resourceId, ipAddress }) => {
    try {
        // Get the last log to create a "chain"
        const lastLog = await AuditLog.findOne().sort({ createdAt: -1 });
        const previousHash = lastLog ? lastLog.currentHash : '0'.repeat(64);

        const logData = {
            action,
            user: user?._id,
            role: user?.role,
            details,
            status: status || 'Success',
            resourceId,
            ipAddress,
            previousHash
        };

        // Create current hash
        logData.currentHash = crypto.createHash('sha256')
            .update(previousHash + JSON.stringify(logData))
            .digest('hex');

        await AuditLog.create(logData);
    } catch (error) {
        console.error('CRITICAL: Audit log failure:', error.message);
    }
};

module.exports = { createAuditLog };
