import pool from '../db.js';

export const Reminder = {
  async create(data) {
    const query = `
      INSERT INTO reminders (case_event_id, send_date, send_time, method, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      data.case_event_id,
      data.send_date,
      data.send_time,
      data.method,
      data.status || 'pending'
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getUpcoming() {
    const query = `
      SELECT r.*, e.event_title, e.event_date, e.event_time, 
             c.case_code, b.name as beneficiary_name, b.contact_number
      FROM reminders r
      LEFT JOIN case_events e ON r.case_event_id = e.id
      LEFT JOIN cases c ON e.case_id = c.id
      LEFT JOIN beneficiaries b ON c.beneficiary_id = b.id
      WHERE r.status = 'pending'
      AND r.send_date >= CURRENT_DATE
      ORDER BY r.send_date ASC, r.send_time ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async updateStatus(id, status) {
    const query = 'UPDATE reminders SET status = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  },

  async getByEvent(eventId) {
    const query = 'SELECT * FROM reminders WHERE case_event_id = $1 ORDER BY send_date DESC';
    const result = await pool.query(query, [eventId]);
    return result.rows;
  }
};
