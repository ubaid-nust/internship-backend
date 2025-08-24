const pool = require('../config/db'); // ✅ For admin validation
const { createBatch, getAllBatches, deleteBatchById, updateBatchById } = require('../models/batchModel');

// Add new batch
const addBatch = async (req, res) => {
  try {
    const { batch_year, batch_name, dept_id } = req.body;
    const admin_id = req.user?.admin_id;

    // Validate input
    if (!batch_year || !batch_name || !dept_id || !admin_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if admin exists
    const adminCheck = await pool.query("SELECT * FROM admin WHERE admin_id = $1", [admin_id]);
    if (adminCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    const newBatch = await createBatch(batch_year, batch_name, dept_id, admin_id);
    res.status(201).json({ message: 'Batch created', batch: newBatch });
  } catch (err) {
    console.error('Add Batch Error:', err);

    // Handle foreign key violation
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Invalid department or admin ID' });
    }

    res.status(500).json({ error: 'Server error' });
  }
};

// Get all batches
const getBatches = async (req, res) => {
  try {
    const batches = await getAllBatches();
    res.status(200).json(batches);
  } catch (err) {
    console.error('Get Batches Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete batch
const deleteBatch = async (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    if (isNaN(batchId)) {
      return res.status(400).json({ error: 'Invalid batch ID' });
    }

    const deletedBatch = await deleteBatchById(batchId);
    if (!deletedBatch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.status(200).json({ message: 'Batch deleted', batch: deletedBatch });
  } catch (err) {
    console.error('Delete Batch Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// controllers/batchController.js

// controllers/batchController.js

const updateBatch = async (req, res) => {
  try {
    const { batch_id } = req.params; // comes as string
    const { batch_year, batch_name, dept_id } = req.body;

    // Validate params and body
    if (!batch_id || isNaN(batch_id)) {
      return res.status(400).json({ error: "Invalid batch ID" });
    }
    if (!batch_year || !batch_name || !dept_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const updatedBatch = await updateBatchById(
      parseInt(batch_id),   // ✅ ensure integer
      batch_year,
      batch_name,
      dept_id
    );

    if (!updatedBatch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    res.status(200).json({ message: "Batch updated", batch: updatedBatch });
  } catch (error) {
    console.error("Error updating batch:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = { addBatch, getBatches, deleteBatch, updateBatch };