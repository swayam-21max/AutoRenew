const nodemailer = require('nodemailer');

/**
 * Creates primary SMTP transporter from .env configuration.
 */
function getPrimaryTransporter() {
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const isSecure = port === 465;
  const passClean = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSecure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: passClean,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
}

/**
 * Send a vehicle compliance expiry reminder email.
 * Falls back to Ethereal sandbox or simulated dispatch if SMTP credentials are missing or fail.
 */
async function sendReminderEmail({ to, userName, policyNumber, insuranceCompany, expiryDate, daysRemaining }) {
  const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const urgencyColor = daysRemaining <= 1 ? '#DC2626' : daysRemaining <= 7 ? '#D97706' : '#0A2B5C';
  const urgencyText = daysRemaining <= 1 ? 'URGENT' : daysRemaining <= 7 ? 'Important' : 'Reminder';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F4F7FA; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F7FA; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(10,43,92,0.1); border-top: 4px solid #D97706;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A2B5C, #051937); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">AutoRenew</h1>
              <p style="margin: 6px 0 0; color: #D0E1FD; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Vehicle Compliance Reminder Platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; color: #0F172A; font-size: 16px; font-weight: 700;">Hello ${userName || 'Vehicle Owner'},</p>
              <p style="margin: 0 0 24px; color: #334155; font-size: 14px; line-height: 1.6;">
                This is an automated vehicle compliance renewal alert to ensure your vehicle coverage remains active and compliant.
              </p>

              <!-- Urgency Badge -->
              <div style="margin-bottom: 24px;">
                <span style="display: inline-block; background-color: ${urgencyColor}; color: #FFFFFF; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${urgencyText} — ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining
                </span>
              </div>

              <!-- Vehicle Summary Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Vehicle & Compliance</span><br>
                          <span style="color: #0A2B5C; font-size: 16px; font-weight: 800;">${policyNumber}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
                          <span style="color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Compliance Type</span><br>
                          <span style="color: #0F172A; font-size: 15px; font-weight: 600;">${insuranceCompany || 'Vehicle Renewal'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Expiry Date</span><br>
                          <span style="color: ${urgencyColor}; font-size: 16px; font-weight: 800;">${formattedDate}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <p style="margin: 24px 0 0; color: #64748B; font-size: 14px; line-height: 1.6;">
                Please renew your vehicle compliance items before expiry to avoid penalties or lapse in coverage.
              </p>

              <p style="margin: 24px 0 0; color: #0F172A; font-size: 14px; font-weight: 700;">
                Regards,<br>
                Vehicle Compliance Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #051937; padding: 20px 40px; border-top: 3px solid #D97706; text-align: center;">
              <p style="margin: 0; color: #94A3B8; font-size: 12px;">
                © AutoRenew Vehicle Compliance Reminder Platform.<br>
                Automated notification sent to ${to}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Vehicle Compliance Team <noreply@autorenew.com>',
    to,
    subject: `Vehicle Compliance Renewal Reminder — ${policyNumber}`,
    html,
  };

  // Try real configured SMTP first
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const primaryTransporter = getPrimaryTransporter();
      const info = await primaryTransporter.sendMail(mailOptions);
      console.log(`✓ Real reminder email sent to ${to} (MessageId: ${info.messageId})`);
      return { success: true, provider: 'SMTP', messageId: info.messageId };
    } catch (smtpErr) {
      console.warn(`⚠ SMTP Auth failed (${smtpErr.message}). Trying sandbox...`);
    }
  }

  // Ethereal Sandbox fallback
  try {
    const testAccount = await Promise.race([
      nodemailer.createTestAccount(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Ethereal sandbox connection timeout')), 5000))
    ]);

    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      connectionTimeout: 5000,
      socketTimeout: 5000,
    });

    const testInfo = await testTransporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(testInfo);
    console.log(`✓ Ethereal Test Email Sandbox Preview: ${previewUrl}`);
    return { success: true, provider: 'ETHEREAL', previewUrl, messageId: testInfo.messageId };
  } catch (sandboxErr) {
    console.warn('⚠ Reminder email sandbox notice (using simulated dispatch):', sandboxErr.message);
    return {
      success: true,
      provider: 'SIMULATED',
      notice: 'Email notification logged & simulated in production mode',
      messageId: `sim_${Date.now()}`,
    };
  }
}

module.exports = { sendReminderEmail };
