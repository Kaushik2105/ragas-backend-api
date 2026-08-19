const adminService = require('../services/admin.services');
const { sendSuccess } = require('../utils/response.utils');

const getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardStats();
    return sendSuccess(res, 200, 'Dashboard data fetched.', data);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await adminService.getAllUsers(req.query);
    return sendSuccess(res, 200, 'Users fetched.', result);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    return sendSuccess(res, 200, 'User fetched.', user);
  } catch (error) {
    next(error);
  }
};

const toggleUserActive = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserActive(req.params.id);
    return sendSuccess(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}.`, user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id);
    return sendSuccess(res, 200, 'User deleted.');
  } catch (error) {
    next(error);
  }
};

const getAdminSongs = async (req, res, next) => {
  try {
    const result = await adminService.getAdminSongs(req.query);
    return sendSuccess(res, 200, 'Songs fetched.', result);
  } catch (error) {
    next(error);
  }
};

const getUsersGrowth = async (req, res, next) => {
  try {
    const data = await adminService.getUsersGrowth();
    return sendSuccess(res, 200, 'Users growth data.', data);
  } catch (error) {
    next(error);
  }
};

const getTopSongs = async (req, res, next) => {
  try {
    const data = await adminService.getTopSongs(req.query.limit);
    return sendSuccess(res, 200, 'Top songs.', data);
  } catch (error) {
    next(error);
  }
};

const getGenreStats = async (req, res, next) => {
  try {
    const data = await adminService.getGenreStats();
    return sendSuccess(res, 200, 'Genre stats.', data);
  } catch (error) {
    next(error);
  }
};

const getAllFeedback = async (req, res, next) => {
  try {
    const result = await adminService.getAllFeedback(req.query);
    return sendSuccess(res, 200, 'Feedback fetched.', result);
  } catch (error) {
    next(error);
  }
};

const sendNotification = async (req, res, next) => {
  try {
    const { title, body, targetType, targetUserId } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required.' });
    }
    const result = await adminService.sendAdminNotification({
      title,
      body,
      targetType,
      targetUserId,
      adminId: req.user.id,
    });
    return sendSuccess(res, 200, 'Notification sent.', result);
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const result = await adminService.getNotificationLogs(req.query);
    return sendSuccess(res, 200, 'Notification logs fetched.', result);
  } catch (error) {
    next(error);
  }
};

const setArtistImage = async (req, res, next) => {
  try {
    const { name, imageUrl, bio } = req.body;
    const artist = await adminService.setArtistImage({ name, imageUrl, bio });
    return sendSuccess(res, 200, 'Artist details saved.', artist);
  } catch (error) {
    next(error);
  }
};

const getAllArtists = async (req, res, next) => {
  try {
    const artists = await adminService.getAllArtists();
    return sendSuccess(res, 200, 'Artists fetched.', artists);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  getUserById,
  toggleUserActive,
  deleteUser,
  getAdminSongs,
  getUsersGrowth,
  getTopSongs,
  getGenreStats,
  getAllFeedback,
  sendNotification,
  getNotifications,
  setArtistImage,
  getAllArtists,
};
