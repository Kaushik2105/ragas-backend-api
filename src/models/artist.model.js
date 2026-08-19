const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Artist = sequelize.define('Artist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'image_url',
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'artists',
  timestamps: true,
  underscored: true,
});

module.exports = Artist;
