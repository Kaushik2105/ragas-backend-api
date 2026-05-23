const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controllers');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const { uploadSongFiles } = require('../middlewares/upload.middleware');

router.get('/', authMiddleware, songController.getAllSongs);
router.get('/search', authMiddleware, songController.searchSongs);
router.get('/:id', authMiddleware, songController.getSongById);
router.post('/', authMiddleware, adminMiddleware, uploadSongFiles, songController.createSong);
router.put('/:id', authMiddleware, adminMiddleware, uploadSongFiles, songController.updateSong);
router.delete('/:id', authMiddleware, adminMiddleware, songController.deleteSong);

module.exports = router;
