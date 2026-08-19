const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  targetType: {
    type: DataTypes.ENUM('all', 'user'),
    defaultValue: 'all',
    field: 'target_type',
  },
  targetUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'target_user_id',
  },
  sentBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'sent_by',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'sent',
  },
  deliveredCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'delivered_count',
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
});

module.exports = Notification;
