const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendVerificationLink = async (email, verificationUrl) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Verify Your Login - ProfitWithPrecision',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Verify Your Login</h2>
        <p>Click the button below to verify your login:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 4px;">Verify Now</a>
        <p>Or copy & paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 15 minutes.</p>
      </div>
    `,
  };

  await sgMail.send(msg);
};