const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controllers');
const authMiddleware = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');

router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, userController.updateProfile);
router.put('/me/avatar', authMiddleware, uploadAvatar, userController.updateAvatar);
router.delete('/me', authMiddleware, userController.deleteAccount);

module.exports = router;
