const { sendReminderEmail } = require('./emailService');
const { sendReminderSms } = require('./smsService');
const { sendReminderWhatsApp } = require('./whatsappService');
const reminderModel = require('../../models/reminderModel');

/**
 * Determine list of target channels from user preference.
 */
function getActiveChannels(preference) {
  const pref = (preference || 'EMAIL').toUpperCase();
  switch (pref) {
    case 'SMS':
      return ['SMS'];
    case 'WHATSAPP':
      return ['WHATSAPP'];
    case 'EMAIL_SMS':
      return ['EMAIL', 'SMS'];
    case 'EMAIL_WHATSAPP':
      return ['EMAIL', 'WHATSAPP'];
    case 'ALL':
      return ['EMAIL', 'SMS', 'WHATSAPP'];
    case 'EMAIL':
    default:
      return ['EMAIL'];
  }
}

/**
 * Format email subject & body text according to compliance type.
 */
function getComplianceTitle(complianceType) {
  switch (complianceType) {
    case 'PUC':
      return 'Pollution Certificate (PUC)';
    case 'ROAD_TAX':
      return 'Road Tax';
    case 'INSURANCE':
    default:
      return 'Vehicle Insurance';
  }
}

/**
 * Dispatch vehicle compliance reminder across required channels based on user preferences.
 */
async function dispatchVehicleReminder({
  vehicleId,
  userEmail,
  phoneNumber,
  ownerName,
  vehicleNumber,
  complianceType, // 'INSURANCE' | 'PUC' | 'ROAD_TAX'
  expiryDate,
  daysRemaining,
  preference,
}) {
  const channels = getActiveChannels(preference);
  const results = [];
  const complianceTitle = getComplianceTitle(complianceType);

  const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const targetEmail = userEmail;
  const targetPhone = phoneNumber;

  for (const channel of channels) {
    // 1. Check duplicate prevention per vehicle + compliance type + days_before + channel
    const alreadySent = await reminderModel.hasBeenSent(vehicleId, complianceType, channel);
    if (alreadySent) {
      console.log(`  ℹ Skipping ${channel} for ${vehicleNumber} (${complianceType} ${daysRemaining}d already logged)`);
      continue;
    }

    let dispatchResult = { success: false, provider: 'UNKNOWN', error: null };

    try {
      if (channel === 'EMAIL') {
        dispatchResult = await sendReminderEmail({
          to: targetEmail,
          userName: ownerName,
          policyNumber: `${vehicleNumber} — ${complianceTitle}`,
          insuranceCompany: 'Vehicle Compliance Platform',
          expiryDate,
          daysRemaining,
        });
      } else if (channel === 'SMS') {
        const messageText = `Vehicle Compliance Alert\n\nVehicle Number:\n${vehicleNumber}\n\nCompliance:\n${complianceTitle} Expiry\n\nExpires On:\n${formattedDate}\n\nYour ${complianceTitle} expires in ${daysRemaining} day(s). Please renew before expiry.`;
        dispatchResult = await sendReminderSms({
          phoneNumber: targetPhone,
          userName: ownerName,
          policyNumber: vehicleNumber,
          insuranceCompany: complianceTitle,
          expiryDate,
          daysRemaining,
          customMessage: messageText,
        });
      } else if (channel === 'WHATSAPP') {
        const messageText = `🔔 *Vehicle Compliance Reminder*\n\nHello *${ownerName}*,\n\nYour vehicle *${vehicleNumber}* has a *${complianceTitle}* expiring on *${formattedDate}* (${daysRemaining} day(s) remaining).\n\nPlease renew your ${complianceTitle} before expiry to ensure full compliance.\n\nRegards,\n*Vehicle Compliance Team*`;
        dispatchResult = await sendReminderWhatsApp({
          phoneNumber: targetPhone,
          userName: ownerName,
          policyNumber: vehicleNumber,
          insuranceCompany: complianceTitle,
          expiryDate,
          daysRemaining,
          customMessage: messageText,
        });
      }
    } catch (err) {
      dispatchResult = { success: false, provider: channel, error: err.message };
    }

    // 2. Log outcome to reminder_logs table
    const status = dispatchResult.success ? 'SUCCESS' : 'FAILED';
    const errorMsg = dispatchResult.error || dispatchResult.notice || null;
    const recipient = channel === 'EMAIL' ? targetEmail : targetPhone;

    await reminderModel.logReminder(
      vehicleId,
      complianceType,
      daysRemaining || 0,
      recipient || 'N/A',
      status,
      errorMsg
    );

    results.push({ channel, ...dispatchResult });
  }

  return results;
}

module.exports = { dispatchVehicleReminder, getActiveChannels };
