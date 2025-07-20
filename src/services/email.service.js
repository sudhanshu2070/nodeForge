const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendVerificationLink = async (email, verificationUrl) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Verify Your Login - ProfitWithPrecision',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #333; margin-bottom: 20px;">Verify Your Login</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">To complete your login to <strong>ProfitWithPrecision</strong>, please verify your email by clicking the button below:</p>
              <a href="${verificationUrl}" 
                 style="display: inline-block; margin: 30px 0; padding: 14px 28px; background-color: #007bff; color: #fff; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 16px;">
                Verify Now
              </a>
              <p style="color: #999; font-size: 14px;">If the button above doesn't work, paste this URL into your browser:</p>
              <p style="word-break: break-all; font-size: 14px; color: #555;">${verificationUrl}</p>
              <p style="color: #aaa; font-size: 13px; margin-top: 30px;">This link will expire in 15 minutes.</p>
            </td>
          </tr>
        </table>
        <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 20px;">&copy; ${new Date().getFullYear()} ProfitWithPrecision. All rights reserved.</p>
      </div>
    `,
  };

  await sgMail.send(msg);
};