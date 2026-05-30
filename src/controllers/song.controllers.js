const songService = require('../services/song.services');
const { sendSuccess } = require('../utils/response.utils');

const getAllSongs = async (req, res, next) => {
  try {
    const result = await songService.getAllSongs(req.query);
    return sendSuccess(res, 200, 'Songs fetched.', result);
  } catch (error) {
    next(error);
  }
};

const getSongById = async (req, res, next) => {
  try {
    const song = await songService.getSongById(req.params.id);
    return sendSuccess(res, 200, 'Song fetched.', song);
  } catch (error) {
    next(error);
  }
};

const searchSongs = async (req, res, next) => {
  try {
    const result = await songService.searchSongs(req.query);
    return sendSuccess(res, 200, 'Search results.', result);
  } catch (error) {
    next(error);
  }
};

const incrementPlayCount = async (req, res, next) => {
  try {
    const result = await songService.incrementPlayCount(req.params.id);
    return sendSuccess(res, 200, 'Play count updated.', result);
  } catch (error) {
    next(error);
  }
};

const createSong = async (req, res, next) => {
  try {
    const song = await songService.createSong(req.body, req.files, req.user.id);
    return sendSuccess(res, 201, 'Song created.', song);
  } catch (error) {
    next(error);
  }
};

const updateSong = async (req, res, next) => {
  try {
    const song = await songService.updateSong(req.params.id, req.body, req.files);
    return sendSuccess(res, 200, 'Song updated.', song);
  } catch (error) {
    next(error);
  }
};

const deleteSong = async (req, res, next) => {
  try {
    await songService.deleteSong(req.params.id);
    return sendSuccess(res, 200, 'Song deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllSongs, getSongById, incrementPlayCount, searchSongs, createSong, updateSong, deleteSong };
