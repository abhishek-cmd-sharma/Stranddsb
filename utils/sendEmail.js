const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use user-provided SMTP if available, else fallback to Ethereal
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_EMAIL || 'brenda.will39@ethereal.email',
      pass: process.env.SMTP_PASSWORD || 'E7YgT7a4nFhJ2T5G6b',
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Strandds Cosmetics'} <${process.env.FROM_EMAIL || 'noreply@Strandds.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  if (!process.env.SMTP_HOST) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;
