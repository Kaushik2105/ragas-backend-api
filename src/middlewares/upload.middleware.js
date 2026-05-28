const multer = require('multer');

// Use memoryStorage — files are held in memory as Buffer objects.
// Nothing is written to disk, so no uploads/ folder is needed.
const memoryStorage = multer.memoryStorage();

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

// Combined upload for song: audio + optional cover image
const uploadSongFiles = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      audioFilter(req, file, cb);
    } else {
      imageFilter(req, file, cb);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

// Avatar upload: single image
const uploadAvatar = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('avatar');

module.exports = { uploadSongFiles, uploadAvatar };
