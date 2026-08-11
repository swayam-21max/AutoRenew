const { query, getClient } = require('../config/db');

const vehicleModel = {
  /**
   * Insert a single vehicle record.
   */
  async create(userId, data) {
    const result = await query(
      `INSERT INTO vehicles (user_id, owner_name, email, phone_number, vehicle_number, insurance_expiry, puc_expiry, road_tax_expiry)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        data.ownerName,
        data.email || null,
        data.phoneNumber,
        data.vehicleNumber,
        data.insuranceExpiry || null,
        data.pucExpiry || null,
        data.roadTaxExpiry || null,
      ]
    );
    return result.rows[0];
  },

  /**
   * Bulk insert vehicle records using a single transaction. Skips duplicates on vehicle_number + user_id.
   */
  async bulkCreate(userId, records) {
    if (!records || records.length === 0) return { inserted: 0, skipped: 0 };

    const client = await getClient();
    let insertedCount = 0;
    let skippedCount = 0;

    try {
      await client.query('BEGIN');

      for (const rec of records) {
        // Check if vehicle number already exists for this user
        const check = await client.query(
          'SELECT id FROM vehicles WHERE user_id = $1 AND vehicle_number = $2',
          [userId, rec.vehicleNumber]
        );

        if (check.rows.length > 0) {
          // Update existing vehicle
          await client.query(
            `UPDATE vehicles
             SET owner_name = $1,
                 email = COALESCE($2, email),
                 phone_number = $3,
                 insurance_expiry = COALESCE($4, insurance_expiry),
                 puc_expiry = COALESCE($5, puc_expiry),
                 road_tax_expiry = COALESCE($6, road_tax_expiry),
                 updated_at = NOW()
             WHERE user_id = $7 AND vehicle_number = $8`,
            [
              rec.ownerName,
              rec.email || null,
              rec.phoneNumber,
              rec.insuranceExpiry || null,
              rec.pucExpiry || null,
              rec.roadTaxExpiry || null,
              userId,
              rec.vehicleNumber,
            ]
          );
          insertedCount++;
        } else {
          // Insert new vehicle
          await client.query(
            `INSERT INTO vehicles (user_id, owner_name, email, phone_number, vehicle_number, insurance_expiry, puc_expiry, road_tax_expiry)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              userId,
              rec.ownerName,
              rec.email || null,
              rec.phoneNumber,
              rec.vehicleNumber,
              rec.insuranceExpiry || null,
              rec.pucExpiry || null,
              rec.roadTaxExpiry || null,
            ]
          );
          insertedCount++;
        }
      }

      await client.query('COMMIT');
      return { inserted: insertedCount, skipped: skippedCount };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Find vehicle by ID.
   */
  async findById(id, userId) {
    const result = await query(
      'SELECT * FROM vehicles WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Get paginated and filtered list of user's vehicles.
   */
  async findByUserId(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      filter = '', // 'insurance_due' | 'puc_due' | 'road_tax_due' | 'expired' | 'active'
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = options;

    const offset = (page - 1) * limit;
    const params = [userId];
    let paramIndex = 2;
    const conditions = ['v.user_id = $1'];

    // Search filter across vehicle number, owner name, and phone
    if (search) {
      conditions.push(
        `(v.vehicle_number ILIKE $${paramIndex} OR v.owner_name ILIKE $${paramIndex} OR v.phone_number ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Status / Compliance Filter
    if (filter === 'insurance_due') {
      conditions.push(`v.insurance_expiry > CURRENT_DATE AND v.insurance_expiry <= CURRENT_DATE + INTERVAL '30 days'`);
    } else if (filter === 'puc_due') {
      conditions.push(`v.puc_expiry > CURRENT_DATE AND v.puc_expiry <= CURRENT_DATE + INTERVAL '15 days'`);
    } else if (filter === 'road_tax_due') {
      conditions.push(`v.road_tax_expiry > CURRENT_DATE AND v.road_tax_expiry <= CURRENT_DATE + INTERVAL '60 days'`);
    } else if (filter === 'expired') {
      conditions.push(
        `(v.insurance_expiry <= CURRENT_DATE OR v.puc_expiry <= CURRENT_DATE OR v.road_tax_expiry <= CURRENT_DATE)`
      );
    } else if (filter === 'active') {
      conditions.push(
        `(v.insurance_expiry IS NULL OR v.insurance_expiry > CURRENT_DATE) AND
         (v.puc_expiry IS NULL OR v.puc_expiry > CURRENT_DATE) AND
         (v.road_tax_expiry IS NULL OR v.road_tax_expiry > CURRENT_DATE)`
      );
    }

    const whereClause = conditions.join(' AND ');

    // Count query
    const countResult = await query(
      `SELECT COUNT(*) FROM vehicles v WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Results query
    const dataResult = await query(
      `SELECT v.*,
              (v.insurance_expiry - CURRENT_DATE) AS insurance_days_remaining,
              (v.puc_expiry - CURRENT_DATE) AS puc_days_remaining,
              (v.road_tax_expiry - CURRENT_DATE) AS road_tax_days_remaining
       FROM vehicles v
       WHERE ${whereClause}
       ORDER BY v.${sortBy === 'vehicle_number' || sortBy === 'owner_name' ? sortBy : 'created_at'} ${sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return {
      vehicles: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Update vehicle record.
   */
  async update(id, userId, data) {
    const result = await query(
      `UPDATE vehicles
       SET owner_name = $1,
           email = $2,
           phone_number = $3,
           vehicle_number = $4,
           insurance_expiry = $5,
           puc_expiry = $6,
           road_tax_expiry = $7,
           updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        data.ownerName,
        data.email || null,
        data.phoneNumber,
        data.vehicleNumber,
        data.insuranceExpiry || null,
        data.pucExpiry || null,
        data.roadTaxExpiry || null,
        id,
        userId,
      ]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete vehicle.
   */
  async delete(id, userId) {
    const result = await query(
      'DELETE FROM vehicles WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Get fleet dashboard summary metrics.
   */
  async getStats(userId) {
    const result = await query(
      `SELECT
         COUNT(*) AS total_vehicles,
         COUNT(*) FILTER (WHERE insurance_expiry > CURRENT_DATE AND insurance_expiry <= CURRENT_DATE + INTERVAL '30 days') AS insurance_expiring_soon,
         COUNT(*) FILTER (WHERE puc_expiry > CURRENT_DATE AND puc_expiry <= CURRENT_DATE + INTERVAL '15 days') AS puc_expiring_soon,
         COUNT(*) FILTER (WHERE road_tax_expiry > CURRENT_DATE AND road_tax_expiry <= CURRENT_DATE + INTERVAL '60 days') AS road_tax_expiring_soon,
         COUNT(*) FILTER (WHERE insurance_expiry <= CURRENT_DATE OR puc_expiry <= CURRENT_DATE OR road_tax_expiry <= CURRENT_DATE) AS expired_vehicles
       FROM vehicles
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  },

  /**
   * Get all expiring vehicles for automated background scheduler sweep.
   */
  async getAllExpiringVehicles() {
    const result = await query(
      `SELECT v.*,
              (v.insurance_expiry - CURRENT_DATE) AS insurance_days_remaining,
              (v.puc_expiry - CURRENT_DATE) AS puc_days_remaining,
              (v.road_tax_expiry - CURRENT_DATE) AS road_tax_days_remaining,
              u.full_name AS user_full_name,
              u.email AS user_email,
              u.phone_number AS user_phone_number,
              u.notification_preference
       FROM vehicles v
       JOIN users u ON v.user_id = u.id
       WHERE (v.insurance_expiry >= CURRENT_DATE AND v.insurance_expiry <= CURRENT_DATE + INTERVAL '30 days')
          OR (v.puc_expiry >= CURRENT_DATE AND v.puc_expiry <= CURRENT_DATE + INTERVAL '15 days')
          OR (v.road_tax_expiry >= CURRENT_DATE AND v.road_tax_expiry <= CURRENT_DATE + INTERVAL '60 days')`
    );
    return result.rows;
  },
};

module.exports = vehicleModel;
