const mongoose = require('mongoose');

const submissionSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },

    // Encrypted strings (Base64)
    encryptedAnswers: { type: String, required: true },
    encryptedMarks: { type: String },

    // Digital Signature (SHA-256 + RSA)
    signature: { type: String, required: true },

    status: {
        type: String,
        enum: ['Submitted', 'Evaluated'],
        default: 'Submitted'
    },
    submissionTime: { type: Date, default: Date.now }
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
