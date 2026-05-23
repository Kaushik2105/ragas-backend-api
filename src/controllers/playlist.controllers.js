const playlistService = require('../services/playlist.services');
const { sendSuccess } = require('../utils/response.utils');

const getUserPlaylists = async (req, res, next) => {
  try {
    const playlists = await playlistService.getUserPlaylists(req.user.id);
    return sendSuccess(res, 200, 'Playlists fetched.', playlists);
  } catch (error) {
    next(error);
  }
};

const getPlaylistById = async (req, res, next) => {
  try {
    const playlist = await playlistService.getPlaylistById(req.params.id, req.user.id);
    return sendSuccess(res, 200, 'Playlist fetched.', playlist);
  } catch (error) {
    next(error);
  }
};

const createPlaylist = async (req, res, next) => {
  try {
    const playlist = await playlistService.createPlaylist(req.user.id, req.body);
    return sendSuccess(res, 201, 'Playlist created.', playlist);
  } catch (error) {
    next(error);
  }
};

const updatePlaylist = async (req, res, next) => {
  try {
    const playlist = await playlistService.updatePlaylist(req.params.id, req.user.id, req.body);
    return sendSuccess(res, 200, 'Playlist updated.', playlist);
  } catch (error) {
    next(error);
  }
};

const deletePlaylist = async (req, res, next) => {
  try {
    await playlistService.deletePlaylist(req.params.id, req.user.id);
    return sendSuccess(res, 200, 'Playlist deleted.');
  } catch (error) {
    next(error);
  }
};

const addSongToPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const result = await playlistService.addSongToPlaylist(req.params.id, songId, req.user.id);
    return sendSuccess(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

const removeSongFromPlaylist = async (req, res, next) => {
  try {
    await playlistService.removeSongFromPlaylist(req.params.id, req.params.songId, req.user.id);
    return sendSuccess(res, 200, 'Song removed from playlist.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
};
