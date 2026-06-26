const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, handleChat);

module.exports = router;
