const db = require('../config/db');

// Create new batch
const createBatch = async (batchYear, batchName, deptId) => {
  const result = await db.query(
    `INSERT INTO batch (batch_year, batch_name, dept_id)
     VALUES ($1, $2, $3) RETURNING *`,
    [batchYear, batchName, deptId]
  );
  return result.rows[0];
};

// Get all batches with department names
const getAllBatches = async () => {
  const result = await db.query(
    `SELECT b.batch_id, b.batch_year, b.batch_name, b.dept_id, d.dept_name
     FROM batch b
     JOIN department d ON b.dept_id = d.dept_id
     ORDER BY b.batch_year DESC, b.batch_name`
  );
  return result.rows;
};

// Delete batch by ID
const deleteBatchById = async (batchId) => {
  const result = await db.query(
    'DELETE FROM batch WHERE batch_id = $1 RETURNING *',
    [batchId]
  );
  return result.rows[0];
};

const updateBatchById = async (batch_id, batch_year, batch_name, dept_id) => {
  const result = await db.query(
    `UPDATE batch 
     SET batch_year = $1, batch_name = $2, dept_id = $3
     WHERE batch_id = $4
     RETURNING *`,
    [batch_year, batch_name, dept_id, batch_id]
  );
  return result.rows[0];
};

module.exports = { createBatch, getAllBatches, deleteBatchById, updateBatchById };