const { Feedback, Song, User } = require('../models');

const getSongFeedback = async (songId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const offset = (page - 1) * limit;

  const song = await Song.findByPk(songId);
  if (!song) {
    throw Object.assign(new Error('Song not found.'), { statusCode: 404 });
  }

  const { rows: feedbacks, count: total } = await Feedback.findAndCountAll({
    where: { songId },
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'profile_pic'] },
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

const createFeedback = async (userId, songId, { rating, comment }) => {
  const song = await Song.findByPk(songId);
  if (!song) {
    throw Object.assign(new Error('Song not found.'), { statusCode: 404 });
  }

  // Check if user already left feedback on this song
  const existing = await Feedback.findOne({ where: { userId, songId } });
  if (existing) {
    // Update existing feedback
    await existing.update({ rating, comment });
    return existing;
  }

  const feedback = await Feedback.create({
    userId,
    songId,
    rating,
    comment,
  });
  return feedback;
};

const deleteFeedback = async (feedbackId, userId) => {
  const feedback = await Feedback.findByPk(feedbackId);
  if (!feedback) {
    throw Object.assign(new Error('Feedback not found.'), { statusCode: 404 });
  }
  if (feedback.userId !== userId) {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
  }
  await feedback.destroy();
};

module.exports = { getSongFeedback, createFeedback, deleteFeedback };
