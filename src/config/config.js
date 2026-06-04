require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  clientUrl: process.env.CLIENT_URL,
  nodeEnv: process.env.NODE_ENV,
  emailjsOtpServiceId: process.env.EMAILJS_OTP_SERVICE_ID,
  emailjsOtpTemplateId: process.env.EMAILJS_OTP_TEMPLATE_ID,
  emailjsOtpPublicKey: process.env.EMAILJS_OTP_PUBLIC_KEY,
  emailjsOtpPrivateKey: process.env.EMAILJS_OTP_PRIVATE_KEY,
};
