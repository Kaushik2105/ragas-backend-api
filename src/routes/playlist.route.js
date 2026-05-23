const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlist.controllers');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, playlistController.getUserPlaylists);
router.post('/', authMiddleware, playlistController.createPlaylist);
router.get('/:id', authMiddleware, playlistController.getPlaylistById);
router.put('/:id', authMiddleware, playlistController.updatePlaylist);
router.delete('/:id', authMiddleware, playlistController.deletePlaylist);
router.post('/:id/songs', authMiddleware, playlistController.addSongToPlaylist);
router.delete('/:id/songs/:songId', authMiddleware, playlistController.removeSongFromPlaylist);

module.exports = router;
