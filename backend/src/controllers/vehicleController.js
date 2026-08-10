const vehicleModel = require('../models/vehicleModel');
const { parseExcelWorkbook, generateSampleExcelBuffer } = require('../services/excelImportService');
const { evaluateVehicleCompliance } = require('../services/priorityEngine');
const { processReminders } = require('../schedulers/reminderScheduler');

const vehicleController = {
  /**
   * POST /api/vehicles/import
   * Upload and process Excel file containing vehicle compliance records.
   * Automatically triggers reminder engine scan for imported vehicles.
   */
  async importExcel(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Please select an Excel file (.xlsx or .xls).' });
      }

      // Parse Excel workbook buffer
      const parsed = parseExcelWorkbook(req.file.buffer);

      if (parsed.validRecords.length === 0 && parsed.validationErrors.length > 0) {
        return res.status(400).json({
          error: 'No valid vehicle records found in uploaded Excel sheet.',
          summary: parsed.summary,
          validationErrors: parsed.validationErrors,
        });
      }

      // Bulk insert/upsert valid records into PostgreSQL
      const dbResult = await vehicleModel.bulkCreate(req.user.id, parsed.validRecords);

      // Automatically trigger reminder engine scan for newly imported vehicles
      let reminderSummary = { dispatched: 0 };
      try {
        reminderSummary = await processReminders();
      } catch (remErr) {
        console.warn('Auto reminder trigger notice:', remErr.message);
      }

      res.status(200).json({
        message: `Excel import processed successfully! ${dbResult.inserted} vehicle(s) added/updated. ${reminderSummary?.dispatched || 0} automated reminder email(s) dispatched.`,
        summary: {
          ...parsed.summary,
          imported: dbResult.inserted,
          remindersDispatched: reminderSummary?.dispatched || 0,
        },
        validationErrors: parsed.validationErrors,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/vehicles/sample-template
   * Download sample Excel template.
   */
  async downloadSample(req, res, next) {
    try {
      const buffer = generateSampleExcelBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="Vehicle_Compliance_Sample_Template.xlsx"');
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/vehicles
   * Paginated & filtered list of user's vehicles with compliance priority evaluation.
   */
  async getAll(req, res, next) {
    try {
      const { page, limit, search, filter, sortBy, sortOrder } = req.query;

      const result = await vehicleModel.findByUserId(req.user.id, {
        page: page || 1,
        limit: limit || 10,
        search: search || '',
        filter: filter || '',
        sortBy: sortBy || 'created_at',
        sortOrder: sortOrder || 'DESC',
      });

      // Enrich records with priority engine compliance evaluation
      const enriched = result.vehicles.map((v) => {
        const comp = evaluateVehicleCompliance(v);
        return {
          ...v,
          compliance: comp,
        };
      });

      res.json({
        vehicles: enriched,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/vehicles/:id
   */
  async getById(req, res, next) {
    try {
      const vehicle = await vehicleModel.findById(req.params.id, req.user.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle record not found.' });
      }

      const compliance = evaluateVehicleCompliance(vehicle);

      res.json({
        vehicle: {
          ...vehicle,
          compliance,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/vehicles
   * Manually add a vehicle.
   */
  async create(req, res, next) {
    try {
      const { ownerName, email, phoneNumber, vehicleNumber, insuranceExpiry, pucExpiry, roadTaxExpiry } = req.body;

      if (!ownerName || !phoneNumber || !vehicleNumber) {
        return res.status(400).json({ error: 'Owner Name, Phone Number, and Vehicle Number are required.' });
      }

      const vehicle = await vehicleModel.create(req.user.id, {
        ownerName: ownerName.trim(),
        email: email?.trim() || null,
        phoneNumber: phoneNumber.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase().replace(/[\s-]/g, ''),
        insuranceExpiry: insuranceExpiry || null,
        pucExpiry: pucExpiry || null,
        roadTaxExpiry: roadTaxExpiry || null,
      });

      const compliance = evaluateVehicleCompliance(vehicle);

      // Auto-trigger reminder check for this vehicle if due
      try {
        await processReminders();
      } catch (e) {}

      res.status(201).json({
        message: 'Vehicle added successfully.',
        vehicle: {
          ...vehicle,
          compliance,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/vehicles/:id
   */
  async update(req, res, next) {
    try {
      const { ownerName, email, phoneNumber, vehicleNumber, insuranceExpiry, pucExpiry, roadTaxExpiry } = req.body;

      if (!ownerName || !phoneNumber || !vehicleNumber) {
        return res.status(400).json({ error: 'Owner Name, Phone Number, and Vehicle Number are required.' });
      }

      const vehicle = await vehicleModel.update(req.params.id, req.user.id, {
        ownerName: ownerName.trim(),
        email: email?.trim() || null,
        phoneNumber: phoneNumber.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase().replace(/[\s-]/g, ''),
        insuranceExpiry: insuranceExpiry || null,
        pucExpiry: pucExpiry || null,
        roadTaxExpiry: roadTaxExpiry || null,
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle record not found.' });
      }

      const compliance = evaluateVehicleCompliance(vehicle);

      res.json({
        message: 'Vehicle updated successfully.',
        vehicle: {
          ...vehicle,
          compliance,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/vehicles/:id
   */
  async delete(req, res, next) {
    try {
      const deleted = await vehicleModel.delete(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Vehicle record not found.' });
      }
      res.json({ message: 'Vehicle deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = vehicleController;
