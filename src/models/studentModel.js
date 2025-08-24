const db = require('../config/db');

// Create new student (without CV)
const createStudent = async (loginId, password, studentName, registrationNumber, batchId, adminId) => {
  const result = await db.query(
    `INSERT INTO student (login_id, password, student_name, registration_number, batch_id, admin_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [loginId, password, studentName, registrationNumber, batchId, adminId]
  );
  return result.rows[0];
};

// Get all students with batch info
const getAllStudents = async () => {
  const result = await db.query(
    `SELECT s.student_id, s.login_id, s.student_name, s.registration_number, 
            b.batch_id, b.batch_name, 
            a.admin_id, a.login_id AS admin_login
     FROM student s
     JOIN batch b ON s.batch_id = b.batch_id
     JOIN admin a ON s.admin_id = a.admin_id
     ORDER BY s.student_name`
  );
  return result.rows;
};

// Get student by ID
const getStudentById = async (studentId) => {
  const result = await db.query(
    `SELECT s.student_id, s.login_id, s.password, s.student_name, s.registration_number, 
            s.cv, s.cv_mimetype,
            b.batch_id, b.batch_name, 
            a.admin_id, a.login_id AS admin_login
     FROM student s
     JOIN batch b ON s.batch_id = b.batch_id
     JOIN admin a ON s.admin_id = a.admin_id
     WHERE s.student_id = $1`,
    [studentId]
  );
  return result.rows[0];
}

const updateStudent = async (id, fields) => {
  const allowedFields = ["login_id", "password", "student_name", "batch_id"];
  const updates = [];
  const values = [];
  let i = 1;

  for (const key of allowedFields) {
    if (fields[key] !== undefined && fields[key] !== null && fields[key] !== "") {
      updates.push(`${key} = $${i}`);
      values.push(fields[key]);
      i++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No valid fields to update");
  }

  values.push(id);

  const query = `
    UPDATE student
    SET ${updates.join(", ")}
    WHERE student_id = $${i}
    RETURNING *;
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};


// Update student CV
// Update student CV (with MIME type)
const updateStudentCV = async (studentId, cvBuffer, mimetype, filename) => {
  const result = await db.query(
    `UPDATE student
     SET cv = $1, cv_mimetype = $2, cv_filename = $3
     WHERE student_id = $4
     RETURNING student_id, student_name, cv_mimetype, cv_filename`,
    [cvBuffer, mimetype, filename, studentId]
  );
  return result.rows[0];
};

// Delete student
const deleteStudent = async (studentId) => {
  const result = await db.query(
    'DELETE FROM student WHERE student_id = $1 RETURNING *',
    [studentId]
  );
  return result.rows[0];
};

// Open CV
const openCV = async (studentId) => {
  console.log("Arrived here");
  const result = await db.query('SELECT cv FROM student WHERE student_id = $1', [studentId]);
  const student = result.rows[0];
  res.setHeader('Content-Type', 'application/pdf');
  res.send(student.cv);
};

const getStudentCV = async (studentId) => {
  const result = await db.query(
    `SELECT student_name, cv, cv_mimetype 
     FROM student 
     WHERE student_id = $1`,
    [studentId]
  );
  return result.rows[0];
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  updateStudentCV,
  deleteStudent,
  getStudentCV, // ✅ add here
  openCV
};
