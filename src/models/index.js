const { sequelize } = require('../config/db');
const User = require('./user.model');
const Song = require('./song.model');
const { Playlist, PlaylistSong } = require('./playlist.model');
const Favorite = require('./favorite.model');
const Feedback = require('./feedback.model');
const FeedbackReaction = require('./feedback-reaction.model');
const SignupOtp = require('./signup-otp.model');
const Notification = require('./notification.model');
const Artist = require('./artist.model');

// ==================== Associations ====================

// User -> Songs (admin uploads)
User.hasMany(Song, { foreignKey: 'uploaded_by', as: 'uploadedSongs' });
Song.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// User -> Playlists
User.hasMany(Playlist, { foreignKey: 'user_id', as: 'playlists' });
Playlist.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// Playlist <-> Songs (many-to-many through PlaylistSong)
Playlist.belongsToMany(Song, { through: PlaylistSong, foreignKey: 'playlist_id', otherKey: 'song_id', as: 'songs' });
Song.belongsToMany(Playlist, { through: PlaylistSong, foreignKey: 'song_id', otherKey: 'playlist_id', as: 'playlists' });

// User -> Favorites
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Song -> Favorites
Song.hasMany(Favorite, { foreignKey: 'song_id', as: 'favorites' });
Favorite.belongsTo(Song, { foreignKey: 'song_id', as: 'song' });

// User -> Feedback
User.hasMany(Feedback, { foreignKey: 'user_id', as: 'feedbacks' });
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Feedback reactions
User.hasMany(FeedbackReaction, { foreignKey: 'user_id', as: 'feedbackReactions' });
FeedbackReaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Feedback -> Reactions
Feedback.hasMany(FeedbackReaction, { foreignKey: 'feedback_id', as: 'reactionItems' });
FeedbackReaction.belongsTo(Feedback, { foreignKey: 'feedback_id', as: 'feedback' });

// Song -> Feedback
Song.hasMany(Feedback, { foreignKey: 'song_id', as: 'feedbacks' });
Feedback.belongsTo(Song, { foreignKey: 'song_id', as: 'song' });

module.exports = {
  sequelize,
  User,
  Song,
  Playlist,
  PlaylistSong,
  Favorite,
  Feedback,
  FeedbackReaction,
  SignupOtp,
  Notification,
  Artist,
};
