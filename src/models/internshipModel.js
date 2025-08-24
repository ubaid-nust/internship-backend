const pool = require('../config/db');

class InternshipModel {
  // Create new internship
  static async create(internshipData) {
  console.log('Entered into the model');
  const keys = Object.keys(internshipData);
  const values = Object.values(internshipData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO internship_data (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const { rows } = await pool.query(query, values);
  console.log('Leaving the Model');
  return rows[0];
}

  // Update internship
  static async update(id, studentId, updateData) {
    const setClause = Object.keys(updateData)
      .map((key, i) => `${key} = $${i + 3}`)
      .join(', ');
    
    const query = `
      UPDATE internship_data 
      SET ${setClause} 
      WHERE internship_id = $1 AND student_id = $2
      RETURNING *
    `;
    const values = [id, studentId, ...Object.values(updateData)];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Delete internship
  static async delete(id, studentId) {
    const query = `
      DELETE FROM internship_data 
      WHERE internship_id = $1 AND student_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id, studentId]);
    return rows[0];
  }

  // Get internships by student (without file content)
  static async findByStudent(studentId) {
    const query = `
      SELECT 
        internship_id,
        internship_type,
        reporting_officer_name,
        organization,
        contact,
        email,
        website,
        internship_duration,
        year_of_completion,
        evidences_mimetype IS NOT NULL AS has_evidences,
        survey1_mimetype IS NOT NULL AS has_survey1,
        survey2_mimetype IS NOT NULL AS has_survey2,
        survey3_mimetype IS NOT NULL AS has_survey3
      FROM internship_data 
      WHERE student_id = $1
    `;
    const { rows } = await pool.query(query, [studentId]);
    return rows;
  }

  // Get single file by type
  static async getFile(internshipId, studentId, fileType) {
    const validTypes = ['evidences', 'survey1', 'survey2', 'survey3'];
    if (!validTypes.includes(fileType)) throw new Error('Invalid file type');
    
    const query = `
      SELECT 
        ${fileType} AS content, 
        ${fileType}_mimetype AS mimetype 
      FROM internship_data 
      WHERE internship_id = $1 AND student_id = $2
    `;
    const { rows } = await pool.query(query, [internshipId, studentId]);
    return rows[0];
  }
}

module.exports = InternshipModel;