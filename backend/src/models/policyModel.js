const { query } = require('../config/db');

const policyModel = {
  async create(userId, data) {
    const coverageHighlights = Array.isArray(data.coverageHighlights)
      ? JSON.stringify(data.coverageHighlights)
      : data.coverageHighlights || null;

    const importantNotes = Array.isArray(data.importantNotes)
      ? JSON.stringify(data.importantNotes)
      : data.importantNotes || null;

    const result = await query(
      `INSERT INTO policies (
         user_id, policy_holder_name, policy_number, insurance_company,
         start_date, expiry_date, ai_summary, coverage_highlights, important_notes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        data.policyHolderName,
        data.policyNumber,
        data.insuranceCompany,
        data.startDate || null,
        data.expiryDate,
        data.aiSummary || null,
        coverageHighlights,
        importantNotes,
      ]
    );
    return result.rows[0];
  },

  async findById(id, userId) {
    const result = await query(
      'SELECT * FROM policies WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  },

  async findByUserId(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'uploaded_at',
      sortOrder = 'DESC',
    } = options;

    const offset = (page - 1) * limit;
    const params = [userId];
    let paramIndex = 2;
    const conditions = ['p.user_id = $1'];

    // Search filter
    if (search) {
      conditions.push(
        `(p.policy_number ILIKE $${paramIndex} OR p.insurance_company ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Status filter
    if (status === 'active') {
      conditions.push(`p.expiry_date > CURRENT_DATE + INTERVAL '30 days'`);
    } else if (status === 'expiring') {
      conditions.push(
        `p.expiry_date > CURRENT_DATE AND p.expiry_date <= CURRENT_DATE + INTERVAL '30 days'`
      );
    } else if (status === 'expired') {
      conditions.push(`p.expiry_date <= CURRENT_DATE`);
    }

    const whereClause = conditions.join(' AND ');

    // Validate sort
    const allowedSorts = ['expiry_date', 'uploaded_at', 'policy_number', 'insurance_company'];
    const safeSortBy = allowedSorts.includes(sortBy) ? sortBy : 'uploaded_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM policies p WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    const dataResult = await query(
      `SELECT p.*,
              CASE
                WHEN p.expiry_date <= CURRENT_DATE THEN 'expired'
                WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring'
                ELSE 'active'
              END AS status,
              (p.expiry_date - CURRENT_DATE) AS days_remaining
       FROM policies p
       WHERE ${whereClause}
       ORDER BY p.${safeSortBy} ${safeSortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return {
      policies: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async update(id, userId, data) {
    const coverageHighlights = Array.isArray(data.coverageHighlights)
      ? JSON.stringify(data.coverageHighlights)
      : data.coverageHighlights || null;

    const importantNotes = Array.isArray(data.importantNotes)
      ? JSON.stringify(data.importantNotes)
      : data.importantNotes || null;

    const result = await query(
      `UPDATE policies
       SET policy_holder_name = $1,
           policy_number = $2,
           insurance_company = $3,
           start_date = $4,
           expiry_date = $5,
           ai_summary = COALESCE($6, ai_summary),
           coverage_highlights = COALESCE($7, coverage_highlights),
           important_notes = COALESCE($8, important_notes)
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [
        data.policyHolderName,
        data.policyNumber,
        data.insuranceCompany,
        data.startDate || null,
        data.expiryDate,
        data.aiSummary || null,
        coverageHighlights,
        importantNotes,
        id,
        userId,
      ]
    );
    return result.rows[0] || null;
  },

  async delete(id, userId) {
    const result = await query(
      'DELETE FROM policies WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows[0] || null;
  },

  async getStats(userId) {
    const result = await query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE expiry_date > CURRENT_DATE + INTERVAL '30 days') AS active,
         COUNT(*) FILTER (WHERE expiry_date > CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '30 days') AS expiring_soon,
         COUNT(*) FILTER (WHERE expiry_date <= CURRENT_DATE) AS expired
       FROM policies
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  },

  async getRecentPolicies(userId, limit = 5) {
    const result = await query(
      `SELECT p.*,
              CASE
                WHEN p.expiry_date <= CURRENT_DATE THEN 'expired'
                WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring'
                ELSE 'active'
              END AS status,
              (p.expiry_date - CURRENT_DATE) AS days_remaining
       FROM policies p
       WHERE p.user_id = $1
       ORDER BY p.uploaded_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  async getExpiringPolicies(userId, days = 30) {
    const result = await query(
      `SELECT p.*,
              (p.expiry_date - CURRENT_DATE) AS days_remaining,
              u.full_name, u.email, u.phone_number, u.notification_preference
       FROM policies p
       JOIN users u ON p.user_id = u.id
       WHERE p.expiry_date > CURRENT_DATE
         AND p.expiry_date <= CURRENT_DATE + INTERVAL '1 day' * $1
         ${userId ? 'AND p.user_id = $2' : ''}
       ORDER BY p.expiry_date ASC`,
      userId ? [days, userId] : [days]
    );
    return result.rows;
  },

  async getAllExpiringPolicies() {
    const result = await query(
      `SELECT p.*,
              (p.expiry_date - CURRENT_DATE) AS days_remaining,
              u.full_name, u.email, u.phone_number, u.notification_preference
       FROM policies p
       JOIN users u ON p.user_id = u.id
       WHERE p.expiry_date > CURRENT_DATE
         AND p.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
       ORDER BY p.expiry_date ASC`
    );
    return result.rows;
  },
};

module.exports = policyModel;
