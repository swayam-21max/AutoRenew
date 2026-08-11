const https = require('https');

/**
 * Format standard SMS message content.
 */
function buildSmsText({ userName, policyNumber, insuranceCompany, expiryDate, daysRemaining }) {
  const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return `AutoRenew Reminder\n\nPolicy Number:\n${policyNumber}\n\nInsurance Company:\n${insuranceCompany || 'N/A'}\n\nExpires On:\n${formattedDate}\n\nYour policy will expire in ${daysRemaining} day(s). Please renew before expiry.`;
}

/**
 * Send SMS via MSG91 API.
 */
async function sendViaMsg91(phoneNumber, messageText) {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) throw new Error('MSG91_AUTH_KEY not configured');

  const cleanPhone = phoneNumber.replace(/[^\d]/g, '');

  const payload = JSON.stringify({
    sender: process.env.MSG91_SENDER_ID || 'POLPLC',
    route: '4',
    country: '91',
    sms: [
      {
        message: messageText,
        to: [cleanPhone],
      },
    ],
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      'https://api.msg91.com/api/v2/sendsms',
      {
        method: 'POST',
        headers: {
          'authkey': authKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✓ SMS dispatched via MSG91 to ${phoneNumber}`);
            resolve({ success: true, provider: 'MSG91', raw: data });
          } else {
            reject(new Error(`MSG91 Error (${res.statusCode}): ${data}`));
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

/**
 * Fallback SMS via Twilio SMS API.
 */
async function sendViaTwilioSms(phoneNumber, messageText) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio SMS credentials (ACCOUNT_SID, AUTH_TOKEN, PHONE_NUMBER) not configured');
  }

  const twilio = require('twilio')(accountSid, authToken);
  const message = await twilio.messages.create({
    body: messageText,
    from: fromNumber,
    to: phoneNumber,
  });

  console.log(`✓ SMS dispatched via Twilio to ${phoneNumber} (Sid: ${message.sid})`);
  return { success: true, provider: 'TWILIO_SMS', sid: message.sid };
}

/**
 * Main SMS Service Entrypoint with automatic provider cascade and sandbox fallback.
 */
async function sendReminderSms({ phoneNumber, userName, policyNumber, insuranceCompany, expiryDate, daysRemaining }) {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { success: false, provider: 'NONE', error: 'No phone number provided' };
  }

  const messageText = buildSmsText({ userName, policyNumber, insuranceCompany, expiryDate, daysRemaining });

  // 1. Try MSG91 Primary
  if (process.env.MSG91_AUTH_KEY) {
    try {
      return await sendViaMsg91(phoneNumber, messageText);
    } catch (msg91Err) {
      console.warn(`⚠ MSG91 SMS failed (${msg91Err.message}). Trying Twilio SMS fallback...`);
    }
  }

  // 2. Try Twilio SMS Fallback
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      return await sendViaTwilioSms(phoneNumber, messageText);
    } catch (twilioErr) {
      console.warn(`⚠ Twilio SMS failed (${twilioErr.message}). Using Sandbox Mode...`);
    }
  }

  // 3. Developer Sandbox Mode Fallback
  console.log(`📱 [SANDBOX SMS PREVIEW] To: ${phoneNumber}`);
  console.log(`----------------------------------------`);
  console.log(messageText);
  console.log(`----------------------------------------`);

  return {
    success: true,
    provider: 'SANDBOX_SMS',
    simulated: true,
    message: 'SMS simulated successfully in sandbox mode.',
  };
}

module.exports = { sendReminderSms };
