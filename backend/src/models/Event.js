import pool from '../db.js';

export const Event = {
  async create(data) {
    const query = `
      INSERT INTO case_events (case_id, event_type, event_title, event_date, event_time, 
                               location, description, event_status, google_drive_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.case_id,
      data.event_type,
      data.event_title,
      data.event_date,
      data.event_time,
      data.location,
      data.description,
      data.event_status || 'scheduled',
      data.google_drive_url
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findById(id) {
    const query = `
      SELECT e.*, c.case_code, c.case_title, b.name as beneficiary_name
      FROM case_events e
      LEFT JOIN cases c ON e.case_id = c.id
      LEFT JOIN beneficiaries b ON c.beneficiary_id = b.id
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async getByCase(caseId) {
    const query = `
      SELECT * FROM case_events 
      WHERE case_id = $1 
      ORDER BY event_date DESC, event_time DESC
    `;
    const result = await pool.query(query, [caseId]);
    return result.rows;
  },

  async getUpcoming(days = 7) {
    const query = `
      SELECT e.*, c.case_code, c.id as case_id, c.case_title, b.name as beneficiary_name, 
             b.contact_number, b.has_smartphone, b.can_read
      FROM case_events e
      LEFT JOIN cases c ON e.case_id = c.id
      LEFT JOIN beneficiaries b ON c.beneficiary_id = b.id
      WHERE e.event_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' * $1
      ORDER BY e.event_date ASC, e.event_time ASC
    `;
    const result = await pool.query(query, [days]);
    return result.rows;
  },

  async update(id, data) {
    const query = `
      UPDATE case_events
      SET event_type = $1, event_title = $2, event_date = $3, event_time = $4,
          location = $5, description = $6, event_status = $7, 
          google_drive_url = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    const values = [
      data.event_type,
      data.event_title,
      data.event_date,
      data.event_time,
      data.location,
      data.description,
      data.event_status,
      data.google_drive_url,
      id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async delete(id) {
    const query = 'DELETE FROM case_events WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};
