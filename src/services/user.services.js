const { User } = require('../models');
const { hashPassword } = require('../utils/bcrypt.utils');
const { uploadToCloudinary } = require('../utils/cloudinary.utils');

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'refreshToken'] },
  });
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }
  return user;
};

const updateProfile = async (userId, updateData) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  const allowedFields = ['name'];
  const updates = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  }

  await user.update(updates);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePic: user.profilePic,
    isActive: user.isActive,
  };
};

const updateAvatar = async (userId, fileBuffer) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  // Upload buffer directly to Cloudinary (no disk writes)
  const avatarUrl = await uploadToCloudinary(fileBuffer, 'musicstream/avatars', 'image');

  user.profilePic = avatarUrl;
  await user.save();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profilePic: user.profilePic,
  };
};

const deleteAccount = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }
  await user.destroy();
};

module.exports = { getProfile, updateProfile, updateAvatar, deleteAccount };
