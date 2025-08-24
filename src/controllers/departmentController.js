const pool = require('../config/db');
const { createDepartment, getAllDepartments, updateDepartment, deleteDepartment } = require('../models/departmentModel');

const addDepartment = async (req, res) => {
  try {
    const { dept_name } = req.body;
    const admin_id = req.user?.admin_id;

    // Validate input
    if (!dept_name || dept_name.trim() === '') {
      return res.status(400).json({ error: 'Department name is required' });
    }
    if (!admin_id) {
      return res.status(400).json({ error: 'Admin ID is required' });
    }

    // Check if admin exists
    const adminCheck = await pool.query(
      "SELECT * FROM admin WHERE admin_id = $1",
      [admin_id]
    );
    if (adminCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    // Create department
    const department = await createDepartment(dept_name.trim(), admin_id);
    res.status(201).json({
      message: "Department created successfully",
      department
    });
  } catch (error) {
    console.error('Add Department Error:', error);

    // Handle foreign key violation (in case admin_id doesn’t exist)
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    res.status(500).json({ error: 'Server error' });
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = await getAllDepartments();
    console.log("Departments from DB:", departments); // <--- Add this
    res.status(200).json(departments);
  } catch (error) {
    console.error('Get Departments Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Department
const editDepartment = async (req, res) => {
  try {
    const { dept_id } = req.params;
    const { dept_name } = req.body;

    if (!dept_name || dept_name.trim() === '') {
      return res.status(400).json({ error: "Department name is required" });
    }

    const updated = await updateDepartment(dept_id, dept_name.trim());

    if (!updated) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({
      message: "Department updated successfully",
      department: updated
    });
  } catch (error) {
    console.error("Update Department Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete (NEW)
const deleteDepartmentHandler = async (req, res) => {
  try {
    const { dept_id } = req.params;

    const deleted = await deleteDepartment(dept_id);
    if (!deleted) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.status(200).json({
      message: 'Department deleted successfully',
      department: deleted
    });
  } catch (error) {
    console.error('Delete Department Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addDepartment,
  getDepartments,
  editDepartment,
  deleteDepartmentHandler,
};