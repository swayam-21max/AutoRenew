/**
 * Calculates days remaining from today to a given expiry date string (YYYY-MM-DD).
 * Returns null if expiry date is omitted.
 */
function calculateDaysRemaining(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determine compliance priority and urgency metrics for a vehicle.
 */
function evaluateVehicleCompliance(vehicle) {
  const insuranceDays = calculateDaysRemaining(vehicle.insurance_expiry || vehicle.insuranceExpiry);
  const pucDays = calculateDaysRemaining(vehicle.puc_expiry || vehicle.pucExpiry);
  const roadTaxDays = calculateDaysRemaining(vehicle.road_tax_expiry || vehicle.roadTaxExpiry);

  const expiries = [];

  if (insuranceDays !== null) {
    expiries.push({ type: 'INSURANCE', label: 'Insurance Renewal', days: insuranceDays, date: vehicle.insurance_expiry || vehicle.insuranceExpiry });
  }
  if (pucDays !== null) {
    expiries.push({ type: 'PUC', label: 'PUC Renewal', days: pucDays, date: vehicle.puc_expiry || vehicle.pucExpiry });
  }
  if (roadTaxDays !== null) {
    expiries.push({ type: 'ROAD_TAX', label: 'Road Tax Renewal', days: roadTaxDays, date: vehicle.road_tax_expiry || vehicle.roadTaxExpiry });
  }

  if (expiries.length === 0) {
    return {
      highestPriority: null,
      status: 'ACTIVE',
      insuranceDays,
      pucDays,
      roadTaxDays,
    };
  }

  // Sort by nearest days remaining ascending.
  // Tie-breaker order: INSURANCE (1) > PUC (2) > ROAD_TAX (3)
  const priorityWeight = { INSURANCE: 1, PUC: 2, ROAD_TAX: 3 };

  expiries.sort((a, b) => {
    if (a.days !== b.days) return a.days - b.days;
    return (priorityWeight[a.type] || 99) - (priorityWeight[b.type] || 99);
  });

  const topPriority = expiries[0];

  let status = 'ACTIVE';
  if (topPriority.days <= 0) {
    status = 'EXPIRED';
  } else if (
    (topPriority.type === 'INSURANCE' && topPriority.days <= 30) ||
    (topPriority.type === 'PUC' && topPriority.days <= 15) ||
    (topPriority.type === 'ROAD_TAX' && topPriority.days <= 60)
  ) {
    status = 'EXPIRING_SOON';
  }

  return {
    highestPriority: topPriority,
    status,
    insuranceDays,
    pucDays,
    roadTaxDays,
    allExpiries: expiries,
  };
}

module.exports = {
  calculateDaysRemaining,
  evaluateVehicleCompliance,
};
