const userService = require('../services/user.services');
const { sendSuccess, sendError } = require('../utils/response.utils');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    return sendSuccess(res, 200, 'Profile fetched.', user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, 200, 'Profile updated.', user);
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Avatar image is required.');
    }
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const user = await userService.updateAvatar(req.user.id, avatarPath);
    return sendSuccess(res, 200, 'Avatar updated.', user);
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await userService.deleteAccount(req.user.id);
    res.clearCookie('refreshToken');
    return sendSuccess(res, 200, 'Account deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, updateAvatar, deleteAccount };
