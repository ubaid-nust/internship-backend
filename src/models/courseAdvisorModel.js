const db = require("../config/db");

// CREATE
const createCourseAdvisor = async (
  loginId,
  password,
  advisorName,
  batchId,
  adminId
) => {
  const result = await db.query(
    `INSERT INTO course_advisor (login_id, password, advisor_name, batch_id, admin_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [loginId, password, advisorName, batchId, adminId]
  );
  return result.rows[0];
};

// GET all with batch and admin info
const getAllCourseAdvisors = async () => {
  const result = await db.query(
    `SELECT ca.advisor_id, ca.login_id, ca.advisor_name,
            b.batch_id, b.batch_name, 
            a.admin_id, a.login_id AS admin_login
     FROM course_advisor ca
     JOIN batch b ON ca.batch_id = b.batch_id
     JOIN admin a ON ca.admin_id = a.admin_id
     ORDER BY ca.advisor_name`
  );
  return result.rows;
};

// Get by ID (include password for server-side use)
const getCourseAdvisorById = async (advisorId) => {
  const result = await db.query(
    `SELECT ca.advisor_id,
            ca.login_id,
            ca.password,          -- include hashed password (server-only)
            ca.advisor_name,
            ca.batch_id,
            b.batch_name,
            a.admin_id,
            a.login_id AS admin_login
     FROM course_advisor ca
     LEFT JOIN batch b ON ca.batch_id = b.batch_id
     LEFT JOIN admin a ON ca.admin_id = a.admin_id
     WHERE ca.advisor_id = $1`,
    [advisorId]
  );
  return result.rows[0];
};

// UPDATE advisor (update only advisor fields — do NOT rely on client to send admin_id)
const updateCourseAdvisorById = async (id, updateData) => {
  const { login_id, password, advisor_name, batch_id } = updateData;

  const result = await db.query(
    `UPDATE course_advisor
     SET login_id = $1,
         password = $2,
         advisor_name = $3,
         batch_id = $4
     WHERE advisor_id = $5
     RETURNING *`,
    [login_id, password, advisor_name, batch_id, id]
  );

  return result.rows[0];
};

const deleteCourseAdvisorById = async (id) => {
  const result = await db.query(
    `DELETE FROM course_advisor WHERE advisor_id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0]; // ✅ return deleted row to confirm success
};

module.exports = {
  createCourseAdvisor,
  getAllCourseAdvisors,
  getCourseAdvisorById,
  updateCourseAdvisorById,
  deleteCourseAdvisorById,
};