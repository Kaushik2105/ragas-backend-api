const favoriteService = require('../services/favorite.services');
const { sendSuccess } = require('../utils/response.utils');

const getUserFavorites = async (req, res, next) => {
  try {
    const favorites = await favoriteService.getUserFavorites(req.user.id);
    return sendSuccess(res, 200, 'Favorites fetched.', favorites);
  } catch (error) {
    next(error);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const favorite = await favoriteService.addFavorite(req.user.id, req.params.songId);
    return sendSuccess(res, 201, 'Song added to favorites.', favorite);
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    await favoriteService.removeFavorite(req.user.id, req.params.songId);
    return sendSuccess(res, 200, 'Song removed from favorites.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserFavorites, addFavorite, removeFavorite };
