import pool from '../db.js';

export const Case = {
  async create(data) {
    const query = `
      INSERT INTO cases (case_code, beneficiary_id, case_type, case_title, case_resolution_type, 
                        court, organizations, status, notes, google_drive_folder_id, google_drive_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [
      data.case_code,
      data.beneficiary_id,
      data.case_type,
      data.case_title,
      data.case_resolution_type,
      data.court,
      data.organizations,
      data.status || 'active',
      data.notes,
      data.google_drive_folder_id,
      data.google_drive_url
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findById(id) {
    const query = `
      SELECT c.*, b.name as beneficiary_name, b.contact_number, b.email as beneficiary_email,
             b.address as beneficiary_address, b.has_smartphone, b.can_read
      FROM cases c
      LEFT JOIN beneficiaries b ON c.beneficiary_id = b.id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async getAll(dateFilter = null) {
    let query = `
      SELECT c.*, b.name as beneficiary_name
      FROM cases c
      LEFT JOIN beneficiaries b ON c.beneficiary_id = b.id
    `;
    const values = [];
    let paramCount = 1;

    // Add date filtering if specified
    if (dateFilter) {
      const now = new Date();
      let filterDate;
      
      if (dateFilter === '3months') {
        filterDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      } else if (dateFilter === '5months') {
        filterDate = new Date(now.getFullYear(), now.getMonth() - 5, now.getDate());
      } else if (dateFilter === '6months') {
        filterDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      } else if (dateFilter.startsWith('year-')) {
        // Year-wise filter: year-2024, year-2025, etc.
        const year = parseInt(dateFilter.split('-')[1]);
        query += ` WHERE EXTRACT(YEAR FROM c.created_at) = $${paramCount}`;
        values.push(year);
        paramCount++;
      }
      
      if (filterDate && !dateFilter.startsWith('year-')) {
        query += ` WHERE c.created_at >= $${paramCount}`;
        values.push(filterDate.toISOString());
        paramCount++;
      }
    }

    query += ' ORDER BY c.created_at DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  },

  async getOngoing(dateFilter = null) {
    let query = `
      SELECT c.*, b.name as beneficiary_name
      FROM cases c
      LEFT JOIN beneficiaries b ON c.beneficiary_id = b.id
      WHERE c.status IN ('active', 'pending', 'urgent')
    `;
    const values = [];
    let paramCount = 1;

    // Add date filtering if specified
    if (dateFilter) {
      const now = new Date();
      let filterDate;
      
      if (dateFilter === '3months') {
        filterDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      } else if (dateFilter === '5months') {
        filterDate = new Date(now.getFullYear(), now.getMonth() - 5, now.getDate());
      } else if (dateFilter === '6months') {
        filterDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      } else if (dateFilter.startsWith('year-')) {
        // Year-wise filter: year-2024, year-2025, etc.
        const year = parseInt(dateFilter.split('-')[1]);
        query += ` AND EXTRACT(YEAR FROM c.created_at) = $${paramCount}`;
        values.push(year);
        paramCount++;
      }
      
      if (filterDate && !dateFilter.startsWith('year-')) {
        query += ` AND c.created_at >= $${paramCount}`;
        values.push(filterDate.toISOString());
        paramCount++;
      }
    }

    query += ' ORDER BY c.created_at DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  },

  async getWithFilters(filters) {
    let query = `
      SELECT c.*, b.name as beneficiary_name
      FROM cases c
      LEFT JOIN beneficiaries b ON c.beneficiary_id = b.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    // Add date filtering if specified
    if (filters.dateFilter) {
      const now = new Date();
      let filterDate;
      
      if (filters.dateFilter === '3months') {
        filterDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      } else if (filters.dateFilter === '5months') {
        filterDate = new Date(now.getFullYear(), now.getMonth() - 5, now.getDate());
      } else if (filters.dateFilter === '6months') {
        filterDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      } else if (filters.dateFilter.startsWith('year-')) {
        // Year-wise filter: year-2024, year-2025, etc.
        const year = parseInt(filters.dateFilter.split('-')[1]);
        query += ` AND EXTRACT(YEAR FROM c.created_at) = $${paramCount}`;
        values.push(year);
        paramCount++;
      }
      
      if (filterDate && !filters.dateFilter.startsWith('year-')) {
        query += ` AND c.created_at >= $${paramCount}`;
        values.push(filterDate.toISOString());
        paramCount++;
      }
    }

    if (filters.case_type) {
      query += ` AND c.case_type = $${paramCount}`;
      values.push(filters.case_type);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND c.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.court) {
      query += ` AND c.court = $${paramCount}`;
      values.push(filters.court);
      paramCount++;
    }

    if (filters.case_resolution_type) {
      query += ` AND c.case_resolution_type = $${paramCount}`;
      values.push(filters.case_resolution_type);
      paramCount++;
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  },

  async update(id, data) {
    // Build dynamic UPDATE query to handle partial updates
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    // Only include fields that are provided in data
    if (data.beneficiary_id !== undefined) {
      updateFields.push(`beneficiary_id = $${paramCount++}`);
      values.push(data.beneficiary_id);
    }
    if (data.case_type !== undefined) {
      updateFields.push(`case_type = $${paramCount++}`);
      values.push(data.case_type);
    }
    if (data.case_title !== undefined) {
      updateFields.push(`case_title = $${paramCount++}`);
      values.push(data.case_title);
    }
    if (data.case_resolution_type !== undefined) {
      updateFields.push(`case_resolution_type = $${paramCount++}`);
      values.push(data.case_resolution_type);
    }
    if (data.court !== undefined) {
      updateFields.push(`court = $${paramCount++}`);
      values.push(data.court);
    }
    if (data.organizations !== undefined) {
      updateFields.push(`organizations = $${paramCount++}`);
      values.push(data.organizations);
    }
    if (data.status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.notes !== undefined) {
      updateFields.push(`notes = $${paramCount++}`);
      values.push(data.notes);
    }
    if (data.google_drive_folder_id !== undefined) {
      updateFields.push(`google_drive_folder_id = $${paramCount++}`);
      values.push(data.google_drive_folder_id);
    }
    if (data.google_drive_url !== undefined) {
      updateFields.push(`google_drive_url = $${paramCount++}`);
      values.push(data.google_drive_url);
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add the id parameter
    values.push(id);

    const query = `
      UPDATE cases
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async delete(id) {
    const query = 'DELETE FROM cases WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async generateCaseCode() {
    const year = new Date().getFullYear();
    const query = `
      SELECT case_code FROM cases 
      WHERE case_code LIKE $1 
      ORDER BY case_code DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [`PACE-${year}-%`]);
    
    if (result.rows.length === 0) {
      return `PACE-${year}-001`;
    }
    
    const lastCode = result.rows[0].case_code;
    const lastNumber = parseInt(lastCode.split('-')[2]);
    const newNumber = (lastNumber + 1).toString().padStart(3, '0');
    return `PACE-${year}-${newNumber}`;
  },

  async getTotalCount() {
    const query = 'SELECT COUNT(*) as count FROM cases';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
};
