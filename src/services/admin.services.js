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
  const { page = 1, limit = 20 } = query;
  const offset = (page - 1) * limit;

  const { rows: songs, count: total } = await Song.findAndCountAll({
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
  return result;
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
  return result;
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
};
