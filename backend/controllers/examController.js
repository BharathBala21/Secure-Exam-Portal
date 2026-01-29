const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { encryptAES, decryptAES, verifySignature } = require('../utils/security');
const { createAuditLog } = require('../utils/auditLogger');
const xlsx = require('xlsx');

/**
 * Create Exam (Faculty only)
 */
const createExam = async (req, res, next) => {
    try {
        const { title, description, questions, startTime, endTime } = req.body;
        const exam = await Exam.create({
            title,
            description,
            questions,
            startTime,
            endTime,
            createdBy: req.user._id
        });

        await createAuditLog({
            action: 'Exam Module Created',
            user: req.user,
            details: `New assessment "${title}" initialized in the secure node.`,
            resourceId: exam._id,
            ipAddress: req.ip
        });

        res.status(201).json(exam);
    } catch (error) {
        next(error);
    }
};

const getExams = async (req, res, next) => {
    try {
        const exams = await Exam.find({}).select('-questions.correctOption');
        res.json(exams);
    } catch (error) {
        next(error);
    }
};

const getExamById = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        if (req.user.role === 'Student') {
            const sanitizedExam = exam.toObject();
            sanitizedExam.questions = sanitizedExam.questions.map(q => {
                const { correctOption, ...rest } = q;
                return rest;
            });
            return res.json(sanitizedExam);
        }
        res.json(exam);
    } catch (error) {
        next(error);
    }
};

const submitExam = async (req, res, next) => {
    try {
        const { examId, answers, signature } = req.body;
        const user = await User.findById(req.user._id);
        const exam = await Exam.findById(examId);

        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        const isValid = verifySignature(answers, signature, user.publicKey);
        if (!isValid) {
            await createAuditLog({
                action: 'Signature Verification Failure',
                user: req.user,
                details: `Integrity check failed for Exam ID: ${examId}. Possible tampering detected.`,
                status: 'Failure',
                resourceId: examId,
                ipAddress: req.ip
            });
            return res.status(400).json({ message: 'Digital signature verification failed. Integrity compromised.' });
        }

        const encryptedAnswers = encryptAES(JSON.stringify(answers));

        const submission = await Submission.create({
            student: req.user._id,
            exam: examId,
            encryptedAnswers,
            signature,
            status: 'Submitted'
        });

        await createAuditLog({
            action: 'Assessment Submission',
            user: req.user,
            details: `Student submitted and signed exam "${exam.title}". AES buffer sealed.`,
            resourceId: submission._id,
            ipAddress: req.ip
        });

        res.status(201).json({ message: 'Exam submitted successfully', submissionId: submission._id });
    } catch (error) {
        next(error);
    }
};

const evaluateSubmission = async (req, res, next) => {
    try {
        const submission = await Submission.findById(req.params.id).populate('exam');
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        const answers = JSON.parse(decryptAES(submission.encryptedAnswers));
        const exam = submission.exam;

        let marks = 0;
        exam.questions.forEach((q, index) => {
            if (answers[index] === q.correctOption) {
                marks += q.marks;
            }
        });

        submission.encryptedMarks = encryptAES(marks.toString());
        submission.status = 'Evaluated';
        await submission.save();

        await createAuditLog({
            action: 'Submission Evaluated',
            user: req.user,
            details: `Marks generated and encrypted for submission ${submission._id}.`,
            resourceId: submission._id,
            ipAddress: req.ip
        });

        res.json({ message: 'Evaluation complete' });
    } catch (error) {
        next(error);
    }
};

const getResults = async (req, res, next) => {
    try {
        let query = {};
        if (req.user.role === 'Student') {
            query = { student: req.user._id };
        } else if (req.user.role === 'Faculty') {
            const exams = await Exam.find({ createdBy: req.user._id });
            query = { exam: { $in: exams.map(e => e._id) } };
        }

        const submissions = await Submission.find(query)
            .populate('student', 'name email')
            .populate('exam', 'title');

        const results = submissions.map(s => {
            return {
                _id: s._id,
                student: s.student,
                exam: s.exam,
                status: s.status,
                submissionTime: s.submissionTime,
                marks: s.encryptedMarks ? decryptAES(s.encryptedMarks) : 'N/A'
            };
        });

        res.json(results);
    } catch (error) {
        next(error);
    }
};

const parseExamExcel = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Map Excel columns to Question schema
        // Expected columns: Question, A, B, C, D, Correct, Marks
        const questions = data.map(row => ({
            questionText: row.Question !== undefined ? row.Question : row.questionText,
            options: [
                row.A !== undefined ? row.A : row.option1,
                row.B !== undefined ? row.B : row.option2,
                row.C !== undefined ? row.C : row.option3,
                row.D !== undefined ? row.D : row.option4
            ],
            correctOption: row.Correct !== undefined ? Number(row.Correct) : (row.correctOption !== undefined ? Number(row.correctOption) : 0),
            marks: Number(row.Marks !== undefined ? row.Marks : (row.marks !== undefined ? row.marks : 1))
        }));

        res.json({
            message: 'Excel parsed successfully',
            questions
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createExam,
    getExams,
    getExamById,
    submitExam,
    evaluateSubmission,
    getResults,
    parseExamExcel
};

