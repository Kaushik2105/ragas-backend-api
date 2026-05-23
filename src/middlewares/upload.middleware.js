const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const audioDir = path.join(uploadDir, 'audio');
const imageDir = path.join(uploadDir, 'images');
const avatarDir = path.join(uploadDir, 'avatars');

[uploadDir, audioDir, imageDir, avatarDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage config for audio files
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage config for cover images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage config for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filters
const audioFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/flac'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files (MP3, WAV, OGG, FLAC) are allowed'), false);
  }
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed'), false);
  }
};

// Upload middlewares
const uploadSong = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

// Combined upload for song (audio + cover image)
const uploadSongFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'audio') cb(null, audioDir);
      else cb(null, imageDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const prefix = file.fieldname === 'audio' ? 'audio' : 'cover';
      cb(null, prefix + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      audioFilter(req, file, cb);
    } else {
      imageFilter(req, file, cb);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('avatar');

module.exports = { uploadSongFiles, uploadAvatar };
