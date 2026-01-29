const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getRecipients } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/send', sendMessage);
router.get('/inbox', getMessages);
router.get('/recipients', getRecipients);

module.exports = router;
