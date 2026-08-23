const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controllers');
const { authMiddleware, optionalAuth } = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const { uploadSongFiles } = require('../middlewares/upload.middleware');

router.get('/', optionalAuth, songController.getAllSongs);
router.get('/search', optionalAuth, songController.searchSongs);
router.get('/artists/top', optionalAuth, songController.getTopArtists);
router.get('/artists/:artistName', optionalAuth, songController.getArtistSongs);
router.post('/:id/play', authMiddleware, songController.incrementPlayCount);
router.get('/:id', optionalAuth, songController.getSongById);
router.post('/', authMiddleware, adminMiddleware, uploadSongFiles, songController.createSong);
router.put('/:id', authMiddleware, adminMiddleware, uploadSongFiles, songController.updateSong);
router.delete('/:id', authMiddleware, adminMiddleware, songController.deleteSong);

module.exports = router;
