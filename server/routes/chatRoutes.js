const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const { sendMessage, getHistory } = require('../controllers/chatController');

const router = express.Router();

router.use(authenticateToken);
router.post('/send', sendMessage);
router.get('/history', getHistory);

module.exports = router;
