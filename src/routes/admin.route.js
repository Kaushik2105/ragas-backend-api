const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controllers');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// All admin routes require both auth + admin middleware
router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/toggle-active', adminController.toggleUserActive);
router.delete('/users/:id', adminController.deleteUser);
router.get('/songs', adminController.getAdminSongs);
router.get('/stats/users-growth', adminController.getUsersGrowth);
router.get('/stats/top-songs', adminController.getTopSongs);
router.get('/stats/genres', adminController.getGenreStats);
router.get('/feedback', adminController.getAllFeedback);

module.exports = router;
