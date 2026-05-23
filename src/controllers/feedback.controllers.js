const feedbackService = require('../services/feedback.services');
const { sendSuccess, sendError } = require('../utils/response.utils');

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
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 400, 'Rating must be between 1 and 5.');
    }
    const feedback = await feedbackService.createFeedback(req.user.id, req.params.songId, { rating, comment });
    return sendSuccess(res, 201, 'Feedback submitted.', feedback);
  } catch (error) {
    next(error);
  }
};

const deleteFeedback = async (req, res, next) => {
  try {
    await feedbackService.deleteFeedback(req.params.id, req.user.id);
    return sendSuccess(res, 200, 'Feedback deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getSongFeedback, createFeedback, deleteFeedback };
