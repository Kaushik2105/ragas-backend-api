const { Op, fn, col, literal } = require('sequelize');
const { User, Song, Playlist, Feedback, Favorite, sequelize } = require('../models');

const getDashboardStats = async () => {
  const [totalUsers, totalSongs, totalPlaylists, totalFeedback] = await Promise.all([
    User.count({ where: { role: 'user' } }),
    Song.count(),
    Playlist.count(),
    Feedback.count(),
  ]);

  // Recent activity
  const recentUsers = await User.findAll({
    attributes: ['id', 'name', 'email', 'created_at'],
    order: [['created_at', 'DESC']],
    limit: 5,
  });

  const recentSongs = await Song.findAll({
    attributes: ['id', 'title', 'artist', 'created_at'],
    order: [['created_at', 'DESC']],
    limit: 5,
  });

  const recentFeedback = await Feedback.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name'] },
      { model: Song, as: 'song', attributes: ['id', 'title'] },
    ],
    order: [['created_at', 'DESC']],
    limit: 5,
  });

  return {
    stats: { totalUsers, totalSongs, totalPlaylists, totalFeedback },
    recentActivity: {
      users: recentUsers,
      songs: recentSongs,
      feedback: recentFeedback,
    },
  };
};

const getAllUsers = async (query = {}) => {
  const { page = 1, limit = 20, search, status } = query;
  const offset = (page - 1) * limit;
  const where = { role: 'user' };

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (status === 'active') where.isActive = true;
  if (status === 'inactive') where.isActive = false;

  const { rows: users, count: total } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password', 'refreshToken'] },
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'refreshToken'] },
  });
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }
  return user;
};

const toggleUserActive = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }
  if (user.role === 'admin') {
    throw Object.assign(new Error('Cannot modify admin account.'), { statusCode: 403 });
  }

  user.isActive = !user.isActive;
  await user.save();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
  };
};

const deleteUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }
  if (user.role === 'admin') {
    throw Object.assign(new Error('Cannot delete admin account.'), { statusCode: 403 });
  }
  await user.destroy();
};

const getAdminSongs = async (query = {}) => {
  const { page = 1, limit = 20, search } = query;
  const offset = (page - 1) * limit;
  const where = {};

  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { artist: { [Op.iLike]: `%${search}%` } },
      { album: { [Op.iLike]: `%${search}%` } },
      { genre: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows: songs, count: total } = await Song.findAndCountAll({
    where,
    include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
    order: [['created_at', 'DESC']],
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

const getUsersGrowth = async () => {
  const result = await User.findAll({
    attributes: [
      [fn('DATE_TRUNC', 'month', col('created_at')), 'month'],
      [fn('COUNT', col('id')), 'count'],
    ],
    where: { role: 'user' },
    group: [fn('DATE_TRUNC', 'month', col('created_at'))],
    order: [[fn('DATE_TRUNC', 'month', col('created_at')), 'ASC']],
    raw: true,
  });

  let cumulative = 0;
  return result.map((row) => {
    const count = parseInt(row.count, 10);
    cumulative += count;
    const month = new Date(row.month).toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });

    return {
      month,
      count,
      cumulative,
    };
  });
};

const getTopSongs = async (limitCount = 10) => {
  const songs = await Song.findAll({
    attributes: ['id', 'title', 'artist', 'play_count', 'cover_image'],
    order: [['play_count', 'DESC']],
    limit: parseInt(limitCount),
  });
  return songs;
};

const getGenreStats = async () => {
  const result = await Song.findAll({
    attributes: [
      'genre',
      [fn('COUNT', col('id')), 'count'],
    ],
    where: {
      genre: { [Op.ne]: null },
    },
    group: ['genre'],
    order: [[fn('COUNT', col('id')), 'DESC']],
    raw: true,
  });
  return result.map((row) => ({
    genre: row.genre,
    count: parseInt(row.count, 10),
  }));
};

const getAllFeedback = async (query = {}) => {
  const { page = 1, limit = 20 } = query;
  const offset = (page - 1) * limit;

  const { rows: feedbacks, count: total } = await Feedback.findAndCountAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Song, as: 'song', attributes: ['id', 'title', 'artist'] },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    feedbacks,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const { sendPushNotifications } = require('../services/notification.service');
const { Notification, Artist } = require('../models');

const sendAdminNotification = async ({ title, body, targetType = 'all', targetUserId, adminId }) => {
  let where = {};
  if (targetType === 'user' && targetUserId) {
    where.id = targetUserId;
  }

  const users = await User.findAll({
    where,
    attributes: ['id', 'pushToken'],
  });

  const pushTokens = users.map((u) => u.pushToken).filter(Boolean);

  const { successCount, failureCount } = await sendPushNotifications({
    pushTokens,
    title,
    body,
  });

  const log = await Notification.create({
    title,
    body,
    targetType,
    targetUserId: targetType === 'user' ? targetUserId : null,
    sentBy: adminId,
    status: 'sent',
    deliveredCount: successCount,
  });

  return {
    notification: log,
    successCount,
    failureCount,
    totalTargeted: pushTokens.length,
  };
};

const getNotificationLogs = async (query = {}) => {
  const { page = 1, limit = 20 } = query;
  const offset = (page - 1) * limit;

  const { rows: notifications, count: total } = await Notification.findAndCountAll({
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    notifications,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const setArtistImage = async ({ name, imageUrl, bio }) => {
  if (!name) throw Object.assign(new Error('Artist name is required.'), { statusCode: 400 });

  const [artist] = await Artist.findOrCreate({
    where: { name },
    defaults: { name, imageUrl, bio },
  });

  if (imageUrl !== undefined) artist.imageUrl = imageUrl;
  if (bio !== undefined) artist.bio = bio;
  await artist.save();

  return artist;
};

const getAllArtists = async () => {
  const songService = require('./song.services');
  return await songService.getTopArtists();
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  toggleUserActive,
  deleteUser,
  getAdminSongs,
  getUsersGrowth,
  getTopSongs,
  getGenreStats,
  getAllFeedback,
  sendAdminNotification,
  getNotificationLogs,
  setArtistImage,
  getAllArtists,
};
