const express = require('express');
const router = express.Router();
const {
    createExam,
    getExams,
    getExamById,
    submitExam,
    evaluateSubmission,
    getResults,
    parseExamExcel,
    getDashboardStats
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
    .get(protect, getExams)
    .post(protect, authorize('Faculty', 'Admin'), createExam);

router.get('/results', protect, getResults);
router.get('/stats', protect, getDashboardStats);

router.route('/:id')
    .get(protect, getExamById);

router.post('/submit', protect, authorize('Student'), submitExam);
router.post('/evaluate/:id', protect, authorize('Faculty', 'Admin'), evaluateSubmission);
router.post('/upload-excel', protect, authorize('Faculty', 'Admin'), upload.single('file'), parseExamExcel);

module.exports = router;
