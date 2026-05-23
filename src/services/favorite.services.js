const { Favorite, Song, User } = require('../models');

const getUserFavorites = async (userId) => {
  const favorites = await Favorite.findAll({
    where: { userId },
    include: [
      {
        model: Song,
        as: 'song',
        include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
      },
    ],
    order: [['created_at', 'DESC']],
  });
  return favorites;
};

const addFavorite = async (userId, songId) => {
  const song = await Song.findByPk(songId);
  if (!song) {
    throw Object.assign(new Error('Song not found.'), { statusCode: 404 });
  }

  const existing = await Favorite.findOne({ where: { userId, songId } });
  if (existing) {
    throw Object.assign(new Error('Song already in favorites.'), { statusCode: 409 });
  }

  const favorite = await Favorite.create({ userId, songId });
  return favorite;
};

const removeFavorite = async (userId, songId) => {
  const favorite = await Favorite.findOne({ where: { userId, songId } });
  if (!favorite) {
    throw Object.assign(new Error('Song not in favorites.'), { statusCode: 404 });
  }
  await favorite.destroy();
};

module.exports = { getUserFavorites, addFavorite, removeFavorite };
