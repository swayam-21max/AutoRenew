const vehicleModel = require('../models/vehicleModel');
const notificationLogModel = require('../models/notificationLogModel');
const { evaluateVehicleCompliance } = require('../services/priorityEngine');

const dashboardController = {
  /**
   * GET /api/dashboard/stats
   * Get vehicle fleet statistics, upcoming renewals breakdown, and notification metrics.
   */
  async getStats(req, res, next) {
    try {
      const [stats, recentVehiclesResult, notificationStats] = await Promise.all([
        vehicleModel.getStats(req.user.id),
        vehicleModel.findByUserId(req.user.id, { page: 1, limit: 10, sortBy: 'created_at', sortOrder: 'DESC' }),
        notificationLogModel.getStats(req.user.id),
      ]);

      const enrichedVehicles = recentVehiclesResult.vehicles.map((v) => ({
        ...v,
        compliance: evaluateVehicleCompliance(v),
      }));

      // Upcoming lists
      const insuranceUpcoming = enrichedVehicles.filter(
        (v) => v.compliance.insuranceDays !== null && v.compliance.insuranceDays <= 30
      );
      const pucUpcoming = enrichedVehicles.filter(
        (v) => v.compliance.pucDays !== null && v.compliance.pucDays <= 15
      );
      const roadTaxUpcoming = enrichedVehicles.filter(
        (v) => v.compliance.roadTaxDays !== null && v.compliance.roadTaxDays <= 60
      );

      res.json({
        stats: {
          totalVehicles: parseInt(stats.total_vehicles || 0, 10),
          insuranceExpiringSoon: parseInt(stats.insurance_expiring_soon || 0, 10),
          pucExpiringSoon: parseInt(stats.puc_expiring_soon || 0, 10),
          roadTaxExpiringSoon: parseInt(stats.road_tax_expiring_soon || 0, 10),
          expiredVehicles: parseInt(stats.expired_vehicles || 0, 10),
        },
        recentVehicles: enrichedVehicles,
        upcoming: {
          insurance: insuranceUpcoming,
          puc: pucUpcoming,
          roadTax: roadTaxUpcoming,
        },
        notificationStats,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dashboardController;
