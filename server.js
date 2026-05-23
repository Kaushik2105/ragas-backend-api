const app = require('./src/app');
const config = require('./src/config/config');
const { connectDB, sequelize } = require('./src/config/db');
const { User } = require('./src/models');
const { hashPassword } = require('./src/utils/bcrypt.utils');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { email: config.adminEmail } });
    if (!adminExists) {
      const hashedPassword = await hashPassword(config.adminPassword);
      await User.create({
        name: 'Admin',
        email: config.adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Admin account seeded successfully');
    } else {
      console.log('ℹ️  Admin account already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
};

const seedSampleData = async () => {
  try {
    const songCount = await require('./src/models').Song.count();
    if (songCount === 0) {
      const admin = await User.findOne({ where: { role: 'admin' } });
      if (admin) {
        const sampleSongs = [
          { title: 'Midnight Echoes', artist: 'Luna Wave', album: 'Dreamscape', genre: 'Electronic', duration: 245, audioUrl: '/uploads/audio/sample.mp3', coverImage: null, uploadedBy: admin.id },
          { title: 'Solar Flare', artist: 'Cosmic Ray', album: 'Stellar', genre: 'Rock', duration: 312, audioUrl: '/uploads/audio/sample.mp3', coverImage: null, uploadedBy: admin.id },
          { title: 'Ocean Breeze', artist: 'Tide Runners', album: 'Coastal', genre: 'Chill', duration: 198, audioUrl: '/uploads/audio/sample.mp3', coverImage: null, uploadedBy: admin.id },
          { title: 'City Lights', artist: 'Neon Dreams', album: 'Urban Night', genre: 'Pop', duration: 267, audioUrl: '/uploads/audio/sample.mp3', coverImage: null, uploadedBy: admin.id },
          { title: 'Thunder Road', artist: 'Steel Horses', album: 'Highway', genre: 'Rock', duration: 289, audioUrl: '/uploads/audio/sample.mp3', coverImage: null, uploadedBy: admin.id },
          { title: 'Velvet Sky', artist: 'Aurora', album: 'Northern Lights', genre: 'Ambient', duration: 356, audioUrl: '/uploads/audio/sample.mp3', coverImage: null, uploadedBy: admin.id },
          { title: 'Digital Rain', artist: 'Pixel Storm', album: 'Cyberpunk', genre: 'Electronic', duration: 223, audioUrl: '/uploads/audio/sample.mp3', coverImage: null, uploadedBy: admin.id },
          { title: 'Golden Hour', artist: 'Sunset Collective', album: 'Dusk', genre: 'Jazz', duration: 301, audioUrl: '/uploads/audio/sample.mp3', coverImage: null, uploadedBy: admin.id },
        ];

        await require('./src/models').Song.bulkCreate(sampleSongs);
        console.log('✅ Sample songs seeded successfully');
      }
    }
  } catch (error) {
    console.error('❌ Error seeding sample data:', error.message);
  }
};

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Sync models (use { alter: true } in dev, { force: false } in prod)
    await sequelize.sync({ alter: config.nodeEnv === 'development' });
    console.log('✅ Database synced');

    // Seed data
    await seedAdmin();
    await seedSampleData();

    // Start server
    app.listen(config.port, () => {
      console.log(`🎵 RAGAS server running on port ${config.port}`);
      console.log(`📡 API: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
