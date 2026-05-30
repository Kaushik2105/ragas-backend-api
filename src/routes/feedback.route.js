const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controllers');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.get('/', authMiddleware, feedbackController.getAllFeedback);
router.post('/', authMiddleware, feedbackController.createFeedback);
router.get('/song/:songId', authMiddleware, feedbackController.getSongFeedback);
router.post('/song/:songId', authMiddleware, feedbackController.createFeedback);
router.post('/:id/react', authMiddleware, feedbackController.reactToFeedback);
router.patch('/:id/pin', authMiddleware, adminMiddleware, feedbackController.togglePinned);
router.delete('/:id', authMiddleware, feedbackController.deleteFeedback);

module.exports = router;
