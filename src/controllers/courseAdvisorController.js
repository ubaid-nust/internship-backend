const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const {
  createCourseAdvisor,
  getAllCourseAdvisors,
  getCourseAdvisorById,
  updateCourseAdvisorById,
  deleteCourseAdvisorById,
} = require("../models/courseAdvisorModel");

// Utility: check if admin exists
const checkAdmin = async (admin_id) => {
  if (!admin_id) return false;
  const result = await pool.query("SELECT * FROM admin WHERE admin_id = $1", [
    admin_id,
  ]);
  return result.rows.length > 0;
};

// CREATE
const addCourseAdvisor = async (req, res) => {
  try {
    const { login_id, password, advisor_name, batch_id } = req.body;
    const admin_id = req.user?.admin_id;

    if (!login_id || !password || !advisor_name || !batch_id || !admin_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const isAdminValid = await checkAdmin(admin_id);
    if (!isAdminValid)
      return res.status(403).json({ error: "Unauthorized admin" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdvisor = await createCourseAdvisor(
      login_id,
      hashedPassword,
      advisor_name,
      batch_id,
      admin_id
    );

    res.status(201).json({
      message: "Course advisor created",
      advisor: newAdvisor,
    });
  } catch (err) {
    console.error(err);
    if (err.code === "23505")
      return res.status(409).json({ error: "Login ID already exists" });
    if (err.code === "23503")
      return res.status(400).json({ error: "Invalid batch or admin ID" });
    res.status(500).json({ error: "Server error" });
  }
};

// GET all
const getCourseAdvisors = async (req, res) => {
  try {
    const advisors = await getAllCourseAdvisors();
    res.status(200).json(advisors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET by ID
const getCourseAdvisor = async (req, res) => {
  try {
    const advisorId = parseInt(req.params.id);
    if (isNaN(advisorId))
      return res.status(400).json({ error: "Invalid advisor ID" });

    const advisor = await getCourseAdvisorById(advisorId);
    if (!advisor)
      return res.status(404).json({ error: "Course advisor not found" });

    // remove password hash before sending
    if (advisor.password) delete advisor.password;

    res.status(200).json(advisor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update
const updateCourseAdvisor = async (req, res) => {
  try {
    const advisorId = parseInt(req.params.id, 10);
    if (isNaN(advisorId))
      return res.status(400).json({ error: "Invalid advisor ID" });

    const admin_id = req.user?.admin_id;
    if (!admin_id)
      return res.status(401).json({ error: "Unauthorized: admin missing" });

    const { login_id, advisor_name, batch_id, password } = req.body;
    if (!login_id || !advisor_name || !batch_id) {
      return res
        .status(400)
        .json({ error: "login_id, advisor_name and batch_id are required" });
    }

    const isAdminValid = await checkAdmin(admin_id);
    if (!isAdminValid)
      return res.status(403).json({ error: "Unauthorized admin" });

    const existingAdvisor = await getCourseAdvisorById(advisorId);
    if (!existingAdvisor)
      return res.status(404).json({ error: "Course advisor not found" });

    let passwordToSave = existingAdvisor.password;
    if (password && password.trim() !== "") {
      passwordToSave = await bcrypt.hash(password, 10);
    }

    const updateData = {
      login_id,
      password: passwordToSave,
      advisor_name,
      batch_id,
    };

    const updatedAdvisor = await updateCourseAdvisorById(advisorId, updateData);
    if (!updatedAdvisor)
      return res.status(404).json({ error: "Course advisor not found" });

    delete updatedAdvisor.password;

    res
      .status(200)
      .json({ message: "Course advisor updated", advisor: updatedAdvisor });
  } catch (err) {
    console.error("Error updating advisor:", err);
    if (err.code === "23505")
      return res.status(409).json({ error: "Login ID already exists" });
    if (err.code === "23503")
      return res.status(400).json({ error: "Invalid batch ID" });
    res.status(500).json({ error: "Server error" });
  }
};

// Delete
const deleteCourseAdvisor = async (req, res) => {
  try {
    const advisorId = parseInt(req.params.id, 10);
    if (isNaN(advisorId))
      return res.status(400).json({ error: "Invalid advisor ID" });

    const admin_id = req.user?.admin_id;
    if (!admin_id)
      return res.status(401).json({ error: "Unauthorized: admin missing" });

    const isAdminValid = await checkAdmin(admin_id);
    if (!isAdminValid)
      return res.status(403).json({ error: "Unauthorized admin" });

    const deletedAdvisor = await deleteCourseAdvisorById(advisorId);
    if (!deletedAdvisor)
      return res.status(404).json({ error: "Course advisor not found" });

    res
      .status(200)
      .json({ message: "Course advisor deleted", advisor: deletedAdvisor });
  } catch (err) {
    console.error("Error deleting advisor:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// courseAdvisorController.js
const getAdvisorProfile = async (req, res) => {
  try {
    const advisorId = req.user.advisor_id; // from JWT

    const result = await pool.query(
      `SELECT ca.advisor_id, ca.advisor_name,
          b.batch_id, b.batch_name,
          a.admin_id, a.login_id AS admin_login
   FROM course_advisor ca
   JOIN batch b ON ca.batch_id = b.batch_id
   JOIN admin a ON ca.admin_id = a.admin_id
   WHERE ca.advisor_id = $1`,
      [advisorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course Advisor not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching advisor profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  addCourseAdvisor,
  getCourseAdvisors,
  getCourseAdvisor,
  updateCourseAdvisor,
  deleteCourseAdvisor,
  getAdvisorProfile,
};
