const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controllers');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, favoriteController.getUserFavorites);
router.post('/:songId', authMiddleware, favoriteController.addFavorite);
router.delete('/:songId', authMiddleware, favoriteController.removeFavorite);

module.exports = router;
