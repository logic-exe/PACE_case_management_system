import pool from '../db.js';

export const Document = {
  async create(data) {
    const query = `
      INSERT INTO documents (case_id, name, drive_file_id, drive_url, download_url, mime_type, size, category, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.case_id,
      data.name,
      data.drive_file_id,
      data.drive_url,
      data.download_url,
      data.mime_type,
      data.size,
      data.category || 'other',
      data.uploaded_by
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findById(id) {
    const query = `
      SELECT d.*, u.name as uploaded_by_name, u.email as uploaded_by_email
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async getByCaseId(caseId) {
    const query = `
      SELECT d.*, u.name as uploaded_by_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.case_id = $1
      ORDER BY d.created_at DESC
    `;
    const result = await pool.query(query, [caseId]);
    return result.rows;
  },

  async getByCategory(caseId, category) {
    const query = `
      SELECT d.*, u.name as uploaded_by_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.case_id = $1 AND d.category = $2
      ORDER BY d.created_at DESC
    `;
    const result = await pool.query(query, [caseId, category]);
    return result.rows;
  },

  async delete(id) {
    const query = 'DELETE FROM documents WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async update(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(data.name);
      paramCount++;
    }

    if (data.category !== undefined) {
      updates.push(`category = $${paramCount}`);
      values.push(data.category);
      paramCount++;
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE documents
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }
};

