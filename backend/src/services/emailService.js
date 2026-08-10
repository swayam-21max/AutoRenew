const nodemailer = require('nodemailer');

/**
 * Creates primary Gmail/SMTP transporter from .env configuration.
 */
function getPrimaryTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Send an email via Nodemailer. Uses configured SMTP or falls back to Ethereal Sandbox.
 */
async function sendMailHelper(mailOptions) {
  // Try real configured SMTP first
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const primaryTransporter = getPrimaryTransporter();
      const info = await primaryTransporter.sendMail(mailOptions);
      console.log(`✓ Real email dispatched to ${mailOptions.to} (MessageId: ${info.messageId})`);
      return { success: true, provider: 'SMTP', messageId: info.messageId };
    } catch (smtpErr) {
      console.warn(`⚠ SMTP Auth/Network notice (${smtpErr.message}). Using Ethereal Email Sandbox preview...`);
    }
  }

  // Ethereal Sandbox fallback
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const testInfo = await testTransporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(testInfo);
    console.log(`✓ Ethereal Test Email Sandbox Preview for ${mailOptions.to}: ${previewUrl}`);
    return { success: true, provider: 'ETHEREAL', previewUrl, messageId: testInfo.messageId };
  } catch (sandboxErr) {
    console.error('Failed sending email via sandbox:', sandboxErr.message);
    return { success: false, provider: 'NONE', error: sandboxErr.message };
  }
}

/**
 * Send Vehicle Insurance Renewal Reminder Email.
 */
async function sendInsuranceReminder({ to, ownerName, vehicleNumber, expiryDate, daysRemaining }) {
  const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Vehicle Insurance Renewal Reminder`;
  const text = `Hello ${ownerName},

This is a reminder that the insurance policy for your vehicle is approaching expiry.

Vehicle Number:
${vehicleNumber}

Insurance Expiry Date:
${formattedDate}

Days Remaining:
${daysRemaining}

Please renew your insurance before the expiry date to avoid penalties and interruption of coverage.

Regards,
Vehicle Compliance Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px; border-top: 4px solid #0A2B5C;">
      <h2 style="color: #0A2B5C; margin-top: 0;">Vehicle Insurance Renewal Reminder</h2>
      <p style="font-size: 15px; color: #334155;">Hello <strong>${ownerName}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        This is a reminder that the insurance policy for your vehicle is approaching expiry.
      </p>
      <div style="background-color: #F8FAFC; padding: 16px; border-radius: 6px; border: 1px solid #CBD5E1; margin: 20px 0;">
        <p style="margin: 4px 0; font-size: 14px;"><strong>Vehicle Number:</strong> <span style="color: #0A2B5C; font-weight: bold;">${vehicleNumber}</span></p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Insurance Expiry Date:</strong> ${formattedDate}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Days Remaining:</strong> <span style="color: #D97706; font-weight: bold;">${daysRemaining} day(s)</span></p>
      </div>
      <p style="font-size: 14px; color: #475569;">
        Please renew your insurance before the expiry date to avoid penalties and interruption of coverage.
      </p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
      <p style="font-size: 13px; color: #64748B;">Regards,<br /><strong>Vehicle Compliance Team</strong></p>
    </div>
  `;

  return await sendMailHelper({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Vehicle Compliance Team <noreply@policypulse.com>',
    to,
    subject,
    text,
    html,
  });
}

/**
 * Send Pollution Certificate (PUC) Renewal Reminder Email.
 */
async function sendPucReminder({ to, ownerName, vehicleNumber, expiryDate, daysRemaining }) {
  const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Pollution Certificate Renewal Reminder`;
  const text = `Hello ${ownerName},

Your Pollution Under Control Certificate is approaching expiry.

Vehicle Number:
${vehicleNumber}

PUC Expiry Date:
${formattedDate}

Days Remaining:
${daysRemaining}

Please renew your certificate before expiry.

Regards,
Vehicle Compliance Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px; border-top: 4px solid #16A34A;">
      <h2 style="color: #16A34A; margin-top: 0;">Pollution Certificate Renewal Reminder</h2>
      <p style="font-size: 15px; color: #334155;">Hello <strong>${ownerName}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Your Pollution Under Control (PUC) Certificate is approaching expiry.
      </p>
      <div style="background-color: #F0FDF4; padding: 16px; border-radius: 6px; border: 1px solid #BBF7D0; margin: 20px 0;">
        <p style="margin: 4px 0; font-size: 14px;"><strong>Vehicle Number:</strong> <span style="color: #0A2B5C; font-weight: bold;">${vehicleNumber}</span></p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>PUC Expiry Date:</strong> ${formattedDate}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Days Remaining:</strong> <span style="color: #16A34A; font-weight: bold;">${daysRemaining} day(s)</span></p>
      </div>
      <p style="font-size: 14px; color: #475569;">
        Please renew your certificate before expiry.
      </p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
      <p style="font-size: 13px; color: #64748B;">Regards,<br /><strong>Vehicle Compliance Team</strong></p>
    </div>
  `;

  return await sendMailHelper({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Vehicle Compliance Team <noreply@policypulse.com>',
    to,
    subject,
    text,
    html,
  });
}

/**
 * Send Road Tax Renewal Reminder Email.
 */
async function sendRoadTaxReminder({ to, ownerName, vehicleNumber, expiryDate, daysRemaining }) {
  const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Road Tax Renewal Reminder`;
  const text = `Hello ${ownerName},

Your vehicle road tax is approaching expiry.

Vehicle Number:
${vehicleNumber}

Road Tax Expiry Date:
${formattedDate}

Days Remaining:
${daysRemaining}

Please complete the renewal process before expiry.

Regards,
Vehicle Compliance Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px; border-top: 4px solid #CA8A04;">
      <h2 style="color: #CA8A04; margin-top: 0;">Road Tax Renewal Reminder</h2>
      <p style="font-size: 15px; color: #334155;">Hello <strong>${ownerName}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Your vehicle road tax is approaching expiry.
      </p>
      <div style="background-color: #FEFCE8; padding: 16px; border-radius: 6px; border: 1px solid #FEF08A; margin: 20px 0;">
        <p style="margin: 4px 0; font-size: 14px;"><strong>Vehicle Number:</strong> <span style="color: #0A2B5C; font-weight: bold;">${vehicleNumber}</span></p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Road Tax Expiry Date:</strong> ${formattedDate}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Days Remaining:</strong> <span style="color: #CA8A04; font-weight: bold;">${daysRemaining} day(s)</span></p>
      </div>
      <p style="font-size: 14px; color: #475569;">
        Please complete the renewal process before expiry.
      </p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
      <p style="font-size: 13px; color: #64748B;">Regards,<br /><strong>Vehicle Compliance Team</strong></p>
    </div>
  `;

  return await sendMailHelper({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Vehicle Compliance Team <noreply@policypulse.com>',
    to,
    subject,
    text,
    html,
  });
}

/**
 * Send Admin Audit Email copy whenever a reminder is sent successfully.
 */
async function sendAdminAuditEmail({ adminEmail, vehicleNumber, ownerName, reminderType, daysRemaining, status = 'SUCCESS' }) {
  const targetAdmin = adminEmail || process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@policypulse.com';

  const subject = `Reminder Sent Successfully`;
  const text = `Vehicle Number:
${vehicleNumber}

Owner:
${ownerName}

Reminder Type:
${reminderType}

Days Remaining:
${daysRemaining}

Status:
${status}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #CBD5E1; border-radius: 6px; background-color: #F8FAFC;">
      <h3 style="color: #0A2B5C; margin-top: 0;">✔ Reminder Audit Notification</h3>
      <p style="font-size: 14px; margin: 4px 0;"><strong>Vehicle Number:</strong> ${vehicleNumber}</p>
      <p style="font-size: 14px; margin: 4px 0;"><strong>Owner:</strong> ${ownerName}</p>
      <p style="font-size: 14px; margin: 4px 0;"><strong>Reminder Type:</strong> ${reminderType}</p>
      <p style="font-size: 14px; margin: 4px 0;"><strong>Days Remaining:</strong> ${daysRemaining}</p>
      <p style="font-size: 14px; margin: 4px 0;"><strong>Status:</strong> <span style="color: #16A34A; font-weight: bold;">${status}</span></p>
    </div>
  `;

  return await sendMailHelper({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Vehicle Compliance Team <noreply@policypulse.com>',
    to: targetAdmin,
    subject,
    text,
    html,
  });
}

/**
 * Send test email to ADMIN_EMAIL to verify SMTP configuration.
 */
async function sendTestEmail(targetEmail) {
  const adminEmail = targetEmail || process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@policypulse.com';

  const subject = `PolicyPulse SMTP Test Email`;
  const text = `Hello Admin,\n\nThis is a test email from the Vehicle Compliance Reminder Platform to verify your SMTP configuration.\n\nStatus: Active & Functional`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #BBF7D0; border-radius: 6px; background-color: #F0FDF4;">
      <h3 style="color: #16A34A; margin-top: 0;">✅ SMTP Test Successful</h3>
      <p style="font-size: 14px; color: #166534;">This is a test email from PolicyPulse Vehicle Compliance Platform to verify your SMTP configuration.</p>
      <p style="font-size: 13px; color: #475569;">Target Email: ${adminEmail}</p>
    </div>
  `;

  return await sendMailHelper({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Vehicle Compliance Team <noreply@policypulse.com>',
    to: adminEmail,
    subject,
    text,
    html,
  });
}

module.exports = {
  sendInsuranceReminder,
  sendPucReminder,
  sendRoadTaxReminder,
  sendAdminAuditEmail,
  sendTestEmail,
};
