const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { encryptAES, decryptAES, verifySignature } = require('../utils/security');

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

module.exports = {
    createExam,
    getExams,
    getExamById,
    submitExam,
    evaluateSubmission,
    getResults
};

