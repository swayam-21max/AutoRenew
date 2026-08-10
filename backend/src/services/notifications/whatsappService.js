/**
 * Format structured WhatsApp message content.
 */
function buildWhatsAppText({ userName, policyNumber, insuranceCompany, expiryDate, daysRemaining }) {
  const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const urgencyEmoji = daysRemaining <= 1 ? '🚨' : daysRemaining <= 7 ? '⚡' : '🔔';

  return `${urgencyEmoji} *PolicyPulse Reminder*

Hello *${userName || 'Valued Client'}*,

Your insurance policy is approaching expiry (${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining).

📋 *Policy Number:* ${policyNumber}
🏢 *Insurance Company:* ${insuranceCompany || 'N/A'}
📅 *Expiry Date:* ${formattedDate}

Please renew your policy before expiry to prevent lapse in coverage.

Thank you,
*PolicyPulse Team*`;
}

/**
 * Send WhatsApp message via Twilio WhatsApp API.
 */
async function sendViaTwilioWhatsApp(phoneNumber, messageText) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  let fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

  if (!fromWhatsApp.startsWith('whatsapp:')) {
    fromWhatsApp = `whatsapp:${fromWhatsApp}`;
  }

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials (ACCOUNT_SID, AUTH_TOKEN) not configured for WhatsApp');
  }

  let toWhatsApp = phoneNumber.trim();
  if (!toWhatsApp.startsWith('whatsapp:')) {
    toWhatsApp = `whatsapp:${toWhatsApp.startsWith('+') ? toWhatsApp : '+' + toWhatsApp}`;
  }

  const twilio = require('twilio')(accountSid, authToken);
  const message = await twilio.messages.create({
    body: messageText,
    from: fromWhatsApp,
    to: toWhatsApp,
  });

  console.log(`✓ WhatsApp message dispatched via Twilio to ${phoneNumber} (Sid: ${message.sid})`);
  return { success: true, provider: 'TWILIO_WHATSAPP', sid: message.sid };
}

/**
 * Main WhatsApp Service Entrypoint with automatic provider execution and sandbox fallback.
 */
async function sendReminderWhatsApp({ phoneNumber, userName, policyNumber, insuranceCompany, expiryDate, daysRemaining }) {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { success: false, provider: 'NONE', error: 'No phone number provided' };
  }

  const messageText = buildWhatsAppText({ userName, policyNumber, insuranceCompany, expiryDate, daysRemaining });

  // 1. Try Twilio WhatsApp API
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      return await sendViaTwilioWhatsApp(phoneNumber, messageText);
    } catch (twilioErr) {
      console.warn(`⚠ Twilio WhatsApp API notice (${twilioErr.message}). Using Sandbox Mode...`);
    }
  }

  // 2. Developer Sandbox Mode Fallback
  console.log(`💬 [SANDBOX WHATSAPP PREVIEW] To: whatsapp:${phoneNumber}`);
  console.log(`========================================`);
  console.log(messageText);
  console.log(`========================================`);

  return {
    success: true,
    provider: 'SANDBOX_WHATSAPP',
    simulated: true,
    message: 'WhatsApp simulated successfully in sandbox mode.',
  };
}

module.exports = { sendReminderWhatsApp };
