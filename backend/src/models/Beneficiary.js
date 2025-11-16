import pool from '../db.js';

export const Beneficiary = {
  async create(data) {
    const query = `
      INSERT INTO beneficiaries (name, contact_number, email, address, date_of_filing, has_smartphone, can_read)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      data.name,
      data.contact_number,
      data.email,
      data.address,
      data.date_of_filing,
      data.has_smartphone,
      data.can_read
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findById(id) {
    const query = 'SELECT * FROM beneficiaries WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async getAll() {
    const query = 'SELECT * FROM beneficiaries ORDER BY name ASC';
    const result = await pool.query(query);
    return result.rows;
  },

  async update(id, data) {
    const query = `
      UPDATE beneficiaries
      SET name = $1, contact_number = $2, email = $3, address = $4,
          date_of_filing = $5, has_smartphone = $6, can_read = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    const values = [
      data.name,
      data.contact_number,
      data.email,
      data.address,
      data.date_of_filing,
      data.has_smartphone,
      data.can_read,
      id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async delete(id) {
    const query = 'DELETE FROM beneficiaries WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async getCasesForBeneficiary(beneficiaryId) {
    const query = 'SELECT * FROM cases WHERE beneficiary_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [beneficiaryId]);
    return result.rows;
  }
};
