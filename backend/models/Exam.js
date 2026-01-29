const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOption: { type: Number, required: true }, // Index of correct option
    marks: { type: Number, default: 1 }
});

const examSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [questionSchema],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isPublished: { type: Boolean, default: false }
}, { timestamps: true });

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;
