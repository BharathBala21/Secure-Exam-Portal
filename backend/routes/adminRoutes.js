const express = require('express');
const router = express.Router();
const {
    getPendingUsers,
    getAllUsers,
    approveUser,
    rejectUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin'));

router.get('/pending', getPendingUsers);
router.get('/all', getAllUsers);
router.put('/approve/:id', approveUser);
router.delete('/reject/:id', rejectUser);

module.exports = router;
