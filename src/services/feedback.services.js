const { Feedback, Song, User } = require('../models');

const allowedEmojis = ['\u{1F44D}', '\u2764\uFE0F', '\u{1F602}', '\u{1F62E}', '\u{1F622}', '\u{1F525}'];

const feedbackIncludes = [
  { model: User, as: 'user', attributes: ['id', 'name', 'profilePic'] },
  { model: Song, as: 'song', attributes: ['id', 'title', 'artist', 'coverImage'] },
];

const getAllFeedback = async (query = {}) => {
  const { page = 1, limit = 50 } = query;
  const offset = (page - 1) * limit;

  const { rows: feedbacks, count: total } = await Feedback.findAndCountAll({
    include: feedbackIncludes,
    order: [['is_pinned', 'DESC'], ['created_at', 'DESC']],
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

const getSongFeedback = async (songId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const offset = (page - 1) * limit;

  const song = await Song.findByPk(songId);
  if (!song) {
    throw Object.assign(new Error('Song not found.'), { statusCode: 404 });
  }

  const { rows: feedbacks, count: total } = await Feedback.findAndCountAll({
    where: { songId },
    include: feedbackIncludes,
    order: [['is_pinned', 'DESC'], ['created_at', 'DESC']],
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

  const existing = await Feedback.findOne({ where: { userId, songId } });
  if (existing) {
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

const deleteFeedback = async (feedbackId, user) => {
  const feedback = await Feedback.findByPk(feedbackId);
  if (!feedback) {
    throw Object.assign(new Error('Feedback not found.'), { statusCode: 404 });
  }
  if (feedback.userId !== user.id && user.role !== 'admin') {
    throw Object.assign(new Error('Access denied.'), { statusCode: 403 });
  }
  await feedback.destroy();
};

const reactToFeedback = async (feedbackId, emoji) => {
  if (!allowedEmojis.includes(emoji)) {
    throw Object.assign(new Error('Unsupported reaction emoji.'), { statusCode: 400 });
  }

  const feedback = await Feedback.findByPk(feedbackId);
  if (!feedback) {
    throw Object.assign(new Error('Feedback not found.'), { statusCode: 404 });
  }

  const reactions = { ...(feedback.reactions || {}) };
  reactions[emoji] = (Number(reactions[emoji]) || 0) + 1;
  await feedback.update({ reactions });
  return feedback;
};

const togglePinned = async (feedbackId) => {
  const feedback = await Feedback.findByPk(feedbackId, {
    include: feedbackIncludes,
  });
  if (!feedback) {
    throw Object.assign(new Error('Feedback not found.'), { statusCode: 404 });
  }

  feedback.isPinned = !feedback.isPinned;
  await feedback.save();
  return feedback;
};

module.exports = {
  getAllFeedback,
  getSongFeedback,
  createFeedback,
  deleteFeedback,
  reactToFeedback,
  togglePinned,
};
