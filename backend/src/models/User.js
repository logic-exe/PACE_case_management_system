import pool from '../db.js';

export const User = {
  async create(name, email, passwordHash, role = 'staff') {
    const query = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at
    `;
    const result = await pool.query(query, [name, email, passwordHash, role]);
    return result.rows[0];
  },

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  async findById(id) {
    const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async getAll() {
    const query = 'SELECT id, name, email, role, created_at FROM users ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }
};
