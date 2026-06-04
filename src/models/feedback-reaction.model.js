const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FeedbackReaction = sequelize.define('FeedbackReaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  feedbackId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'feedback_id',
    references: {
      model: 'feedback',
      key: 'id',
    },
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
  emoji: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'feedback_reactions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['feedback_id', 'user_id'],
    },
  ],
});

module.exports = FeedbackReaction;
