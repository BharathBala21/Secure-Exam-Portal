const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
    action: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    details: { type: String },
    ipAddress: { type: String },
    status: { type: String, enum: ['Success', 'Failure', 'Warning'], default: 'Success' },
    resourceId: { type: String }, // ID of the affected object (Exam, Submission, etc.)
    previousHash: { type: String }, // For "Blockchain" style linking
    currentHash: { type: String }
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
