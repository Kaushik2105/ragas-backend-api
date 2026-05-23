const { Playlist, PlaylistSong, Song, User } = require('../models');

const getUserPlaylists = async (userId) => {
  const playlists = await Playlist.findAll({
    where: { userId },
    include: [
      {
        model: Song,
        as: 'songs',
        through: { attributes: [] },
        attributes: ['id', 'title', 'artist', 'coverImage', 'duration'],
      },
    ],
    order: [['created_at', 'DESC']],
  });
  return playlists;
};

const getPlaylistById = async (playlistId, userId) => {
  const playlist = await Playlist.findByPk(playlistId, {
    include: [
      {
        model: Song,
        as: 'songs',
        through: { attributes: [] },
        include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
      },
      { model: User, as: 'owner', attributes: ['id', 'name'] },
    ],
  });

  if (!playlist) {
    throw Object.assign(new Error('Playlist not found.'), { statusCode: 404 });
  }

  // Only allow owner or public playlists
  if (playlist.userId !== userId && !playlist.isPublic) {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
  }

  return playlist;
};

const createPlaylist = async (userId, { name, isPublic = false }) => {
  const playlist = await Playlist.create({
    name,
    userId,
    isPublic,
  });
  return playlist;
};

const updatePlaylist = async (playlistId, userId, updateData) => {
  const playlist = await Playlist.findByPk(playlistId);
  if (!playlist) {
    throw Object.assign(new Error('Playlist not found.'), { statusCode: 404 });
  }
  if (playlist.userId !== userId) {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
  }

  const allowedFields = ['name', 'isPublic'];
  const updates = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  }

  await playlist.update(updates);
  return playlist;
};

const deletePlaylist = async (playlistId, userId) => {
  const playlist = await Playlist.findByPk(playlistId);
  if (!playlist) {
    throw Object.assign(new Error('Playlist not found.'), { statusCode: 404 });
  }
  if (playlist.userId !== userId) {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
  }
  await playlist.destroy();
};

const addSongToPlaylist = async (playlistId, songId, userId) => {
  const playlist = await Playlist.findByPk(playlistId);
  if (!playlist) {
    throw Object.assign(new Error('Playlist not found.'), { statusCode: 404 });
  }
  if (playlist.userId !== userId) {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
  }

  const song = await Song.findByPk(songId);
  if (!song) {
    throw Object.assign(new Error('Song not found.'), { statusCode: 404 });
  }

  const existing = await PlaylistSong.findOne({
    where: { playlistId, songId },
  });
  if (existing) {
    throw Object.assign(new Error('Song already in playlist.'), { statusCode: 409 });
  }

  await PlaylistSong.create({ playlistId, songId });
  return { message: 'Song added to playlist.' };
};

const removeSongFromPlaylist = async (playlistId, songId, userId) => {
  const playlist = await Playlist.findByPk(playlistId);
  if (!playlist) {
    throw Object.assign(new Error('Playlist not found.'), { statusCode: 404 });
  }
  if (playlist.userId !== userId) {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
  }

  const entry = await PlaylistSong.findOne({
    where: { playlistId, songId },
  });
  if (!entry) {
    throw Object.assign(new Error('Song not in playlist.'), { statusCode: 404 });
  }

  await entry.destroy();
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
