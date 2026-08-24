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

const sendWelcomeEmail = async ({ email, name }) => {
  const serviceId = config.emailjsWelcomeServiceId;
  const templateId = config.emailjsWelcomeTemplateId;
  const publicKey = config.emailjsWelcomePublicKey;
  const privateKey = config.emailjsWelcomePrivateKey;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('⚠️ EmailJS Welcome Config is missing. Skipping email.');
    return;
  }

  const body = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: email,
      to_name: name || email,
      app_name: 'RAGAS',
      login_link: config.clientUrl || 'https://ragas-frontend.netlify.app/',
    },
  };

  if (privateKey) {
    body.accessToken = privateKey;
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ EmailJS Welcome Email failed: ${response.status} - ${text}`);
    } else {
      console.log(`✉️  Welcome email successfully sent to ${email}`);
    }
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};

module.exports = { sendRegistrationOtpEmail, sendWelcomeEmail };

