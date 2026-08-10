const cron = require('node-cron');
const vehicleModel = require('../models/vehicleModel');
const reminderModel = require('../models/reminderModel');
const {
  sendInsuranceReminder,
  sendPucReminder,
  sendRoadTaxReminder,
  sendAdminAuditEmail,
} = require('../services/emailService');

const INSURANCE_THRESHOLDS = [30, 15, 7, 3, 1];
const PUC_THRESHOLDS = [15, 7, 3, 1];
const ROAD_TAX_THRESHOLDS = [60, 30, 15, 7];

/**
 * Determine exact due threshold for a given days remaining value.
 * Matches the smallest threshold 't' such that daysRemaining <= t.
 */
function getMatchingThreshold(daysRemaining, thresholdList) {
  if (daysRemaining === null || daysRemaining === undefined || daysRemaining < 0) return null;
  const sorted = [...thresholdList].sort((a, b) => a - b);
  for (const t of sorted) {
    if (daysRemaining <= t) {
      return t;
    }
  }
  return null;
}

/**
 * Process automated daily email reminders for all vehicles.
 */
async function processReminders() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] 🤖 [Scheduler Started] Daily Vehicle Compliance Email Sweep running...`);

  try {
    const expiringVehicles = await vehicleModel.getAllExpiringVehicles();
    const vehicleCount = expiringVehicles ? expiringVehicles.length : 0;
    console.log(`  📊 Vehicles Checked: ${vehicleCount}`);

    if (vehicleCount === 0) {
      console.log(`[${new Date().toISOString()}] 🤖 [Scheduler Completed] No upcoming vehicle expiries found.`);
      return { totalChecked: 0, dispatched: 0, skipped: 0, failed: 0 };
    }

    let dispatchedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const vehicle of expiringVehicles) {
      const insDays = vehicle.insurance_days_remaining !== null ? parseInt(vehicle.insurance_days_remaining, 10) : null;
      const pucDays = vehicle.puc_days_remaining !== null ? parseInt(vehicle.puc_days_remaining, 10) : null;
      const taxDays = vehicle.road_tax_days_remaining !== null ? parseInt(vehicle.road_tax_days_remaining, 10) : null;

      // Identify all due reminders for this vehicle across Insurance, PUC, and Road Tax
      const dueReminders = [];

      const insThreshold = getMatchingThreshold(insDays, INSURANCE_THRESHOLDS);
      if (insDays !== null && insThreshold !== null) {
        dueReminders.push({
          type: 'INSURANCE',
          daysRemaining: insDays,
          daysBefore: insThreshold,
          expiryDate: vehicle.insurance_expiry,
          weight: 1, // Insurance tie-breaker weight
        });
      }

      const pucThreshold = getMatchingThreshold(pucDays, PUC_THRESHOLDS);
      if (pucDays !== null && pucThreshold !== null) {
        dueReminders.push({
          type: 'PUC',
          daysRemaining: pucDays,
          daysBefore: pucThreshold,
          expiryDate: vehicle.puc_expiry,
          weight: 2, // PUC tie-breaker weight
        });
      }

      const taxThreshold = getMatchingThreshold(taxDays, ROAD_TAX_THRESHOLDS);
      if (taxDays !== null && taxThreshold !== null) {
        dueReminders.push({
          type: 'ROAD_TAX',
          daysRemaining: taxDays,
          daysBefore: taxThreshold,
          expiryDate: vehicle.road_tax_expiry,
          weight: 3, // Road Tax tie-breaker weight
        });
      }

      if (dueReminders.length === 0) {
        continue;
      }

      // Filter out reminders that have ALREADY been sent for this threshold
      const pendingReminders = [];
      for (const r of dueReminders) {
        const alreadySent = await reminderModel.hasBeenSent(vehicle.id, r.type, r.daysBefore);
        if (alreadySent) {
          skippedCount++;
        } else {
          pendingReminders.push(r);
        }
      }

      if (pendingReminders.length === 0) {
        continue;
      }

      // Priority Order:
      // 1. Nearest days remaining (minimum daysRemaining)
      // 2. Tie-breaker weight (Insurance > PUC > Road Tax)
      pendingReminders.sort((a, b) => {
        if (a.daysRemaining !== b.daysRemaining) {
          return a.daysRemaining - b.daysRemaining;
        }
        return a.weight - b.weight;
      });

      // Pick the single nearest upcoming unsent reminder
      const targetReminder = pendingReminders[0];

      // Determine recipient email address
      const recipientEmail = vehicle.email || vehicle.user_email || process.env.EMAIL_USER;

      if (!recipientEmail || recipientEmail.trim() === '') {
        console.warn(`  ⚠ Cannot send reminder for ${vehicle.vehicle_number}: No valid email address`);
        await reminderModel.logReminder(
          vehicle.id,
          targetReminder.type,
          targetReminder.daysBefore,
          'N/A',
          'FAILED',
          'No valid recipient email address'
        );
        failedCount++;
        continue;
      }

      let dispatchResult = { success: false };

      try {
        if (targetReminder.type === 'INSURANCE') {
          dispatchResult = await sendInsuranceReminder({
            to: recipientEmail,
            ownerName: vehicle.owner_name,
            vehicleNumber: vehicle.vehicle_number,
            expiryDate: targetReminder.expiryDate,
            daysRemaining: targetReminder.daysRemaining,
          });
        } else if (targetReminder.type === 'PUC') {
          dispatchResult = await sendPucReminder({
            to: recipientEmail,
            ownerName: vehicle.owner_name,
            vehicleNumber: vehicle.vehicle_number,
            expiryDate: targetReminder.expiryDate,
            daysRemaining: targetReminder.daysRemaining,
          });
        } else if (targetReminder.type === 'ROAD_TAX') {
          dispatchResult = await sendRoadTaxReminder({
            to: recipientEmail,
            ownerName: vehicle.owner_name,
            vehicleNumber: vehicle.vehicle_number,
            expiryDate: targetReminder.expiryDate,
            daysRemaining: targetReminder.daysRemaining,
          });
        }
      } catch (sendErr) {
        dispatchResult = { success: false, error: sendErr.message };
      }

      const status = dispatchResult.success ? 'SUCCESS' : 'FAILED';
      const errorMsg = dispatchResult.error || null;

      // Log dispatch to PostgreSQL
      await reminderModel.logReminder(
        vehicle.id,
        targetReminder.type,
        targetReminder.daysBefore,
        recipientEmail,
        status,
        errorMsg
      );

      if (dispatchResult.success) {
        dispatchedCount++;
        console.log(`  ✓ Dispatched ${targetReminder.type} reminder email to ${recipientEmail} for vehicle ${vehicle.vehicle_number} (${targetReminder.daysRemaining}d remaining)`);

        // Send Admin Audit Email copy
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        if (adminEmail) {
          try {
            await sendAdminAuditEmail({
              adminEmail,
              vehicleNumber: vehicle.vehicle_number,
              ownerName: vehicle.owner_name,
              reminderType: targetReminder.type,
              daysRemaining: targetReminder.daysRemaining,
              status: 'SUCCESS',
            });
            console.log(`  ✓ Admin Audit Email sent to ${adminEmail}`);
          } catch (auditErr) {
            console.warn(`  ⚠ Admin Audit Email notice: ${auditErr.message}`);
          }
        }
      } else {
        failedCount++;
        console.error(`  ✗ Email failed for vehicle ${vehicle.vehicle_number}: ${errorMsg}`);
      }
    }

    console.log(`[${new Date().toISOString()}] 🤖 [Scheduler Completed] Check finished: ${dispatchedCount} sent, ${skippedCount} skipped, ${failedCount} failed.`);

    return {
      totalChecked: vehicleCount,
      dispatched: dispatchedCount,
      skipped: skippedCount,
      failed: failedCount,
    };
  } catch (err) {
    console.error('  ✗ Scheduler execution error:', err.message);
    return { error: err.message };
  }
}

/**
 * Initialize automated daily cron scheduler (09:00 AM daily).
 */
function initScheduler() {
  cron.schedule('0 9 * * *', processReminders, {
    timezone: 'Asia/Kolkata',
  });

  console.log('  ✓ Automated Daily Email Reminder Scheduler Active (Runs every day at 09:00 AM)');
}

module.exports = { initScheduler, processReminders, getMatchingThreshold };
