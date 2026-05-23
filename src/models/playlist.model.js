const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Playlist = sequelize.define('Playlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_public',
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'cover_image',
  },
}, {
  tableName: 'playlists',
  timestamps: true,
  underscored: true,
});

// Join table for playlist-songs many-to-many
const PlaylistSong = sequelize.define('PlaylistSong', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  playlistId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'playlist_id',
    references: {
      model: 'playlists',
      key: 'id',
    },
  },
  songId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'song_id',
    references: {
      model: 'songs',
      key: 'id',
    },
  },
}, {
  tableName: 'playlist_songs',
  timestamps: true,
  underscored: true,
});

module.exports = { Playlist, PlaylistSong };
