const config = require('../config/config');

const sendEmailJsEmail = async ({ templateParams }) => {
  if (!config.emailjsOtpServiceId || !config.emailjsOtpTemplateId || !config.emailjsOtpPublicKey) {
    throw Object.assign(new Error('Email service is not configured.'), { statusCode: 500 });
  }

  const body = {
    service_id: config.emailjsOtpServiceId,
    template_id: config.emailjsOtpTemplateId,
    user_id: config.emailjsOtpPublicKey,
    template_params: templateParams,
  };

  if (config.emailjsOtpPrivateKey) {
    body.accessToken = config.emailjsOtpPrivateKey;
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const body = await response.text();
    throw Object.assign(new Error(`EmailJS failed: ${body}`), { statusCode: 502 });
  }
};

const sendRegistrationOtpEmail = async ({ email, name, otp }) => {
  await sendEmailJsEmail({
    templateParams: {
      to_email: email,
      to_name: name || email,
      otp,
    },
  });
};

module.exports = { sendRegistrationOtpEmail };
