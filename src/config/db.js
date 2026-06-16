const { Sequelize } = require('sequelize');
const config = require('./config');

const isLocal = config.databaseUrl && (config.databaseUrl.includes('localhost') || config.databaseUrl.includes('127.0.0.1'));

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  dialectOptions: isLocal ? {} : {
    ssl: {
      require: true,
      rejectUnauthorized: false, 
    }
  },
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
