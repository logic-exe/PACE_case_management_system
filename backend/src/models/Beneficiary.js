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
    const query = `
      SELECT 
        b.*,
        COALESCE(case_counts.case_count, 0) as case_count,
        COALESCE(case_counts.active_cases, 0) as active_cases
      FROM beneficiaries b
      LEFT JOIN (
        SELECT 
          beneficiary_id,
          COUNT(*) as case_count,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_cases
        FROM cases
        GROUP BY beneficiary_id
      ) case_counts ON b.id = case_counts.beneficiary_id
      ORDER BY b.name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getAllWithCases() {
    const query = `
      SELECT 
        b.id,
        b.name,
        b.contact_number,
        b.email,
        b.address,
        b.date_of_filing,
        b.has_smartphone,
        b.can_read,
        b.created_at,
        b.updated_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN c.id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', c.id,
                'case_code', c.case_code,
                'case_type', c.case_type,
                'case_title', c.case_title,
                'status', c.status,
                'court', c.court,
                'created_at', c.created_at
              )
            END
          ) FILTER (WHERE c.id IS NOT NULL), '[]'
        ) as cases
      FROM beneficiaries b
      LEFT JOIN cases c ON b.id = c.beneficiary_id
      GROUP BY b.id, b.name, b.contact_number, b.email, b.address, 
               b.date_of_filing, b.has_smartphone, b.can_read, b.created_at, b.updated_at
      ORDER BY b.name ASC
    `;
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
  },

  async findByNameAndPhone(name, phone) {
    // Normalize phone number - extract only digits and take last 10 digits
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    
    console.log(`Looking for beneficiary: name="${name}", phone="${cleanPhone}"`);
    
    // Use a simpler approach - compare the last 10 digits of contact numbers
    const query = `
      SELECT * FROM beneficiaries 
      WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) 
      AND RIGHT(REGEXP_REPLACE(contact_number, '[^0-9]', '', 'g'), 10) = $2
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    try {
      const result = await pool.query(query, [name, cleanPhone]);
      
      console.log(`Found ${result.rows.length} matching beneficiaries`);
      if (result.rows.length > 0) {
        console.log(`Match found: ${result.rows[0].name} - ${result.rows[0].contact_number}`);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in findByNameAndPhone:', error);
      // Fallback to a simpler query if REGEXP_REPLACE fails
      const fallbackQuery = `
        SELECT * FROM beneficiaries 
        WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) 
        AND (contact_number LIKE '%' || $2 OR REPLACE(contact_number, '+91', '') = $2)
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      const fallbackResult = await pool.query(fallbackQuery, [name, cleanPhone]);
      console.log(`Fallback query found ${fallbackResult.rows.length} matching beneficiaries`);
      return fallbackResult.rows[0];
    }
  },
};
