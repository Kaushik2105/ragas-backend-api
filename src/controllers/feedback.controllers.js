const feedbackService = require('../services/feedback.services');
const { sendSuccess, sendError } = require('../utils/response.utils');

const getAllFeedback = async (req, res, next) => {
  try {
    const result = await feedbackService.getAllFeedback(req.query);
    return sendSuccess(res, 200, 'Feedback fetched.', result);
  } catch (error) {
    next(error);
  }
};

const getSongFeedback = async (req, res, next) => {
  try {
    const result = await feedbackService.getSongFeedback(req.params.songId, req.query);
    return sendSuccess(res, 200, 'Feedback fetched.', result);
  } catch (error) {
    next(error);
  }
};

const createFeedback = async (req, res, next) => {
  try {
    const { rating, comment, songId } = req.body;
    const targetSongId = req.params.songId || songId;
    if (!targetSongId) {
      return sendError(res, 400, 'Song is required.');
    }
    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 400, 'Rating must be between 1 and 5.');
    }
    const feedback = await feedbackService.createFeedback(req.user.id, targetSongId, { rating, comment });
    return sendSuccess(res, 201, 'Feedback submitted.', feedback);
  } catch (error) {
    next(error);
  }
};

const deleteFeedback = async (req, res, next) => {
  try {
    await feedbackService.deleteFeedback(req.params.id, req.user);
    return sendSuccess(res, 200, 'Feedback deleted.');
  } catch (error) {
    next(error);
  }
};

const reactToFeedback = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    if (!emoji) {
      return sendError(res, 400, 'Unsupported reaction emoji.');
    }

    const feedback = await feedbackService.reactToFeedback(req.params.id, emoji);
    return sendSuccess(res, 200, 'Reaction saved.', feedback);
  } catch (error) {
    next(error);
  }
};

const togglePinned = async (req, res, next) => {
  try {
    const feedback = await feedbackService.togglePinned(req.params.id);
    return sendSuccess(res, 200, feedback.isPinned ? 'Feedback pinned.' : 'Feedback unpinned.', feedback);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFeedback,
  getSongFeedback,
  createFeedback,
  deleteFeedback,
  reactToFeedback,
  togglePinned,
};
