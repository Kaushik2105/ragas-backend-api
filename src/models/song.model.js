const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Song = sequelize.define('Song', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  artist: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  album: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: true,
  },
  audioUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'audio_url',
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'cover_image',
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'uploaded_by',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  playCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'play_count',
  },
}, {
  tableName: 'songs',
  timestamps: true,
  underscored: true,
});

module.exports = Song;
