const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"VizNest Studio" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent: " + info.response);
    return info;
  } catch (error) {
    // This will help us see the REAL error in your console
    console.error("🔴 NODEMAILER ERROR:", error.message);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;