const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SignupOtp = sequelize.define('SignupOtp', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  otpHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'otp_hash',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at',
  },
  verificationTokenHash: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'verification_token_hash',
  },
  verificationTokenExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verification_token_expires_at',
  },
  lastSentAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'last_sent_at',
  },
}, {
  tableName: 'signup_otps',
  timestamps: true,
  underscored: true,
});

module.exports = SignupOtp;
