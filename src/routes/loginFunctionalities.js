const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================== ADMIN LOGIN ==================
router.post("/admin/login", async (req, res) => {
  try {
    const { login_id, password } = req.body;
    const result = await pool.query("SELECT * FROM admin WHERE login_id = $1", [login_id]);

    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const admin = result.rows[0];
    const ok = await bcrypt.compare(password, admin.password);

    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { role: "admin", admin_id: admin.admin_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: "admin" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ================== STUDENT LOGIN ==================
router.post("/student/login", async (req, res) => {
  try {
    const { login_id, password } = req.body;
    const result = await pool.query("SELECT * FROM student WHERE login_id = $1", [login_id]);

    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const student = result.rows[0];
    const ok = await bcrypt.compare(password, student.password);

    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { role: "student", student_id: student.student_id, batch_id: student.batch_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: "student" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ================== COURSE ADVISOR LOGIN ==================
router.post("/advisor/login", async (req, res) => {
  try {
    const { login_id, password } = req.body;
    const result = await pool.query("SELECT * FROM course_advisor WHERE login_id = $1", [login_id]);

    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const advisor = result.rows[0];
    const ok = await bcrypt.compare(password, advisor.password);

    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { role: "course_advisor", advisor_id: advisor.advisor_id, batch_id: advisor.batch_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: "course_advisor" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;