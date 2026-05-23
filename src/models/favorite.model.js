const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  tableName: 'favorites',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'song_id'],
    },
  ],
});

module.exports = Favorite;
