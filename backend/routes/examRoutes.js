const express = require('express');
const router = express.Router();
const {
    createExam,
    getExams,
    getExamById,
    submitExam,
    evaluateSubmission,
    getResults
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getExams)
    .post(protect, authorize('Faculty', 'Admin'), createExam);

router.get('/results', protect, getResults);

router.route('/:id')
    .get(protect, getExamById);

router.post('/submit', protect, authorize('Student'), submitExam);
router.post('/evaluate/:id', protect, authorize('Faculty', 'Admin'), evaluateSubmission);

module.exports = router;
