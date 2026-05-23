const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controllers');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/song/:songId', authMiddleware, feedbackController.getSongFeedback);
router.post('/song/:songId', authMiddleware, feedbackController.createFeedback);
router.delete('/:id', authMiddleware, feedbackController.deleteFeedback);

module.exports = router;
