const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file Buffer directly to Cloudinary via stream.
 * No disk storage needed — works entirely in memory.
 *
 * @param {Buffer} fileBuffer - The file buffer from multer memoryStorage
 * @param {string} folder     - Target folder on Cloudinary
 * @param {'image' | 'video' | 'raw' | 'auto'} resourceType
 * @returns {Promise<string>} Secure HTTPS URL of the uploaded asset
 */
const uploadToCloudinary = (fileBuffer, folder = 'musicstream', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) return resolve(null);

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) {
          // Provide a clear, actionable error message for the 403 account-type issue
          if (error.http_code === 403) {
            console.error('\n╔══════════════════════════════════════════════════════════╗');
            console.error('║         CLOUDINARY 403 — ACTION REQUIRED                 ║');
            console.error('╠══════════════════════════════════════════════════════════╣');
            console.error('║ Your Cloudinary account is a "Media Optimizer" product.  ║');
            console.error('║ The Upload API requires a "Programmable Media" account.  ║');
            console.error('║                                                          ║');
            console.error('║ Fix: Go to cloudinary.com → sign up for a NEW free      ║');
            console.error('║ account and select "Programmable Media" as the product.  ║');
            console.error('║ Then update CLOUDINARY_CLOUD_NAME / KEY / SECRET in .env ║');
            console.error('╚══════════════════════════════════════════════════════════╝\n');
          } else {
            console.error('Cloudinary upload error:', error.message);
          }
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    // Pipe the buffer into the upload stream
    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

module.exports = { uploadToCloudinary };
