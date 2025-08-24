const express = require("express");
const pool = require("../config/db");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Admin signup
router.post("/admin", async (req, res) => {
  const { login_id, password } = req.body;

  if (!login_id || !password) {
    return res.status(400).json({ error: "Login ID and password are required" });
  }

  const trimmedLoginId = login_id.trim();

  try {
    const existing = await pool.query(
      "SELECT * FROM admin WHERE login_id = $1",
      [trimmedLoginId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Admin already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      "INSERT INTO admin (login_id, password) VALUES ($1, $2) RETURNING admin_id, login_id",
      [trimmedLoginId, hashedPassword]
    );

    res.status(201).json({ 
      message: "Admin registered successfully", 
      admin: result.rows[0] 
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// // Admin login
// router.post("/login/admin", async (req, res) => {
//   const { login_id, password } = req.body;

//   if (!login_id || !password) {
//     return res.status(400).json({ error: "Login ID and password are required" });
//   }

//   const trimmedLoginId = login_id.trim();

//   try {
//     const result = await pool.query(
//       "SELECT * FROM admin WHERE login_id = $1",
//       [trimmedLoginId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     const admin = result.rows[0];
//     const isMatch = await bcrypt.compare(password, admin.password);

//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     // ✅ Generate JWT token
//     const token = jwt.sign(
//       { admin_id: admin.admin_id, login_id: admin.login_id },
//       process.env.JWT_SECRET,
//       { expiresIn: "8h" } // adjust expiration as needed
//     );

//     res.status(200).json({
//       message: "Login successful",
//       admin: { admin_id: admin.admin_id, login_id: admin.login_id },
//       token, // return token for frontend to store/use
//     });
//   } catch (error) {
//     console.error("Admin login error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

module.exports = router;