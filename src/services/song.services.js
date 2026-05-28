const { Op } = require('sequelize');
const { Song, User, Feedback } = require('../models');
const { uploadToCloudinary } = require('../utils/cloudinary.utils');

const getAllSongs = async (query = {}) => {
  const { page = 1, limit = 20, genre, sort = 'createdAt', order = 'DESC' } = query;
  const offset = (page - 1) * limit;
  const where = {};

  if (genre) where.genre = genre;

  const { rows: songs, count: total } = await Song.findAndCountAll({
    where,
    include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
    order: [[sort, order]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    songs,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSongById = async (songId) => {
  const song = await Song.findByPk(songId, {
    include: [
      { model: User, as: 'uploader', attributes: ['id', 'name'] },
      {
        model: Feedback,
        as: 'feedbacks',
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profile_pic'] }],
        limit: 10,
        order: [['created_at', 'DESC']],
      },
    ],
  });
  if (!song) {
    throw Object.assign(new Error('Song not found.'), { statusCode: 404 });
  }

  // Increment play count
  await song.increment('playCount');

  return song;
};

const searchSongs = async (searchQuery) => {
  const { q, page = 1, limit = 20 } = searchQuery;
  if (!q) {
    throw Object.assign(new Error('Search query is required.'), { statusCode: 400 });
  }

  const offset = (page - 1) * limit;
  const where = {
    [Op.or]: [
      { title: { [Op.iLike]: `%${q}%` } },
      { artist: { [Op.iLike]: `%${q}%` } },
      { album: { [Op.iLike]: `%${q}%` } },
      { genre: { [Op.iLike]: `%${q}%` } },
    ],
  };

  const { rows: songs, count: total } = await Song.findAndCountAll({
    where,
    include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
    order: [['play_count', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    songs,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const createSong = async (songData, files, adminId) => {
  if (!files || !files.audio || !files.audio[0]) {
    throw Object.assign(new Error('Audio file is required.'), { statusCode: 400 });
  }

  const audioFile = files.audio[0];
  const coverFile = files.coverImage ? files.coverImage[0] : null;

  // Upload buffers directly to Cloudinary (no disk writes)
  const audioUrl = await uploadToCloudinary(audioFile.buffer, 'musicstream/audio', 'video');
  const coverImage = coverFile
    ? await uploadToCloudinary(coverFile.buffer, 'musicstream/covers', 'image')
    : null;

  const song = await Song.create({
    title: songData.title,
    artist: songData.artist,
    album: songData.album || null,
    genre: songData.genre || null,
    duration: songData.duration || null,
    audioUrl,
    coverImage,
    uploadedBy: adminId,
  });

  return song;
};

const updateSong = async (songId, updateData, files) => {
  const song = await Song.findByPk(songId);
  if (!song) {
    throw Object.assign(new Error('Song not found.'), { statusCode: 404 });
  }

  const updates = {};
  const allowedFields = ['title', 'artist', 'album', 'genre', 'duration'];
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  }

  if (files && files.audio && files.audio[0]) {
    const audioFile = files.audio[0];
    updates.audioUrl = await uploadToCloudinary(audioFile.buffer, 'musicstream/audio', 'video');
  }
  if (files && files.coverImage && files.coverImage[0]) {
    const coverFile = files.coverImage[0];
    updates.coverImage = await uploadToCloudinary(coverFile.buffer, 'musicstream/covers', 'image');
  }

  await song.update(updates);
  return song;
};

const deleteSong = async (songId) => {
  const song = await Song.findByPk(songId);
  if (!song) {
    throw Object.assign(new Error('Song not found.'), { statusCode: 404 });
  }
  await song.destroy();
};

module.exports = { getAllSongs, getSongById, searchSongs, createSong, updateSong, deleteSong };
