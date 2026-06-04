const { Op } = require('sequelize');
const { Feedback, FeedbackReaction, Song, User } = require('../models');

const allowedEmojis = ['\u{1F44D}', '\u2764\uFE0F', '\u{1F602}', '\u{1F62E}', '\u{1F622}', '\u{1F525}'];

const feedbackIncludes = [
  { model: User, as: 'user', attributes: ['id', 'name', 'profilePic'] },
  { model: Song, as: 'song', attributes: ['id', 'title', 'artist', 'coverImage'] },
];

const withUserReaction = async (feedbacks, userId) => {
  if (!userId || feedbacks.length === 0) return feedbacks;

  const feedbackIds = feedbacks.map((item) => item.id);
  const reactions = await FeedbackReaction.findAll({
    where: { feedbackId: { [Op.in]: feedbackIds }, userId },
  });
  const reactionByFeedbackId = reactions.reduce((map, reaction) => {
    map[reaction.feedbackId] = reaction.emoji;
    return map;
  }, {});

  return feedbacks.map((item) => {
    const plain = item.toJSON ? item.toJSON() : item;
    return {
      ...plain,
      userReaction: reactionByFeedbackId[plain.id] || null,
    };
  });
};

const getAllFeedback = async (query = {}, userId) => {
  const { page = 1, limit = 50, songId } = query;
  const offset = (page - 1) * limit;
  const where = songId ? { songId } : undefined;

  const { rows: feedbacks, count: total } = await Feedback.findAndCountAll({
    where,
    include: feedbackIncludes,
    order: [['is_pinned', 'DESC'], ['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    feedbacks: await withUserReaction(feedbacks, userId),
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSongFeedback = async (songId, query = {}, userId) => {
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
    feedbacks: await withUserReaction(feedbacks, userId),
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

const reactToFeedback = async (feedbackId, userId, emoji) => {
  if (!allowedEmojis.includes(emoji)) {
    throw Object.assign(new Error('Unsupported reaction emoji.'), { statusCode: 400 });
  }

  const feedback = await Feedback.findByPk(feedbackId);
  if (!feedback) {
    throw Object.assign(new Error('Feedback not found.'), { statusCode: 404 });
  }

  const existingReaction = await FeedbackReaction.findOne({ where: { feedbackId, userId } });
  if (existingReaction) {
    await existingReaction.update({ emoji });
  } else {
    await FeedbackReaction.create({ feedbackId, userId, emoji });
  }

  const allReactions = await FeedbackReaction.findAll({ where: { feedbackId } });
  const reactions = allReactions.reduce((counts, item) => {
    counts[item.emoji] = (Number(counts[item.emoji]) || 0) + 1;
    return counts;
  }, {});

  await feedback.update({ reactions });
  const updated = feedback.toJSON();
  return { ...updated, reactions, userReaction: emoji };
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
