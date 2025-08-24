const db = require('../config/db');

// Create Department
const createDepartment = async (deptName) => {
  const result = await db.query(
    'INSERT INTO department (dept_name) VALUES ($1) RETURNING *',
    [deptName]
  );
  return result.rows[0];
};

// Get All Departments
const getAllDepartments = async () => {
  const result = await db.query(
    'SELECT dept_id, dept_name FROM department ORDER BY dept_id'
  );
  return result.rows;
};

// Update Department
const updateDepartment = async (deptId, deptName) => {
  const result = await db.query(
    'UPDATE department SET dept_name = $1 WHERE dept_id = $2 RETURNING *',
    [deptName, deptId]
  );
  return result.rows[0];
};

// Delete (NEW)
const deleteDepartment = async (deptId) => {
  const result = await db.query(
    'DELETE FROM department WHERE dept_id = $1 RETURNING *',
    [deptId]
  );
  return result.rows[0]; // returns deleted row or null if not found
};

module.exports = { 
  createDepartment, 
  getAllDepartments,
  updateDepartment,
  deleteDepartment
};