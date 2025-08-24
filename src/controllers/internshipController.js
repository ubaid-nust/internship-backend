const pool = require("../config/db");

// ================== INTERNSHIP CONTROLLER ==================

// Create Internship (Student)
const createInternship = async (req, res) => {
  try {
    const {
      internship_type,
      reporting_officer_name,
      organization,
      contact,
      email,
      website,
      internship_duration,
      year_of_completion,
    } = req.body || {};
    const studentId = req.user.student_id;

    if (!internship_type || !organization || !internship_duration || !year_of_completion) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    // Handle uploaded files (store as bytea with mimetype)
    const evidences = req.files?.evidences?.[0] || null;
    const survey1 = req.files?.survey1?.[0] || null;
    const survey2 = req.files?.survey2?.[0] || null;
    const survey3 = req.files?.survey3?.[0] || null;

    const result = await pool.query(
      `INSERT INTO internship_data
        (student_id, internship_type, reporting_officer_name, organization, contact, email, website, 
         internship_duration, year_of_completion,
         evidences, evidences_mimetype,
         survey1, survey1_mimetype,
         survey2, survey2_mimetype,
         survey3, survey3_mimetype)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,
               $10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        studentId,
        internship_type,
        reporting_officer_name,
        organization,
        contact,
        email,
        website,
        internship_duration,
        year_of_completion,
        evidences ? evidences.buffer : null,
        evidences ? evidences.mimetype : null,
        survey1 ? survey1.buffer : null,
        survey1 ? survey1.mimetype : null,
        survey2 ? survey2.buffer : null,
        survey2 ? survey2.mimetype : null,
        survey3 ? survey3.buffer : null,
        survey3 ? survey3.mimetype : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating internship:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get Internships (role-based)
const getInternships = async (req, res) => {
  try {
    let result;

    if (req.user.role === "admin") {
      result = await pool.query("SELECT * FROM internship_data");
    } else if (req.user.role === "student") {
      result = await pool.query("SELECT * FROM internship_data WHERE student_id = $1", [req.user.student_id]);
    } else if (req.user.role === "course_advisor") {
      result = await pool.query(
        `SELECT i.* FROM internship_data i
         JOIN student s ON i.student_id = s.student_id
         WHERE s.batch_id = $1`,
        [req.user.batch_id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin only: Get all internships
const getAllInternships = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, s.student_name, s.batch_id, b.batch_name, b.batch_year
       FROM internship_data i
       JOIN student s ON i.student_id = s.student_id
       LEFT JOIN batch b ON s.batch_id = b.batch_id
       ORDER BY i.year_of_completion DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Advisor only: Get internships by batch
const getInternshipsByBatch = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.* FROM internship_data i
       JOIN student s ON i.student_id = s.student_id
       WHERE s.batch_id = $1`,
      [req.user.batch_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get Internship by ID (role-based)
const getInternshipById = async (req, res) => {
  try {
    const { id } = req.params;
    let result;

    if (req.user.role === "admin") {
      result = await pool.query("SELECT * FROM internship_data WHERE internship_id = $1", [id]);
    } else if (req.user.role === "student") {
      result = await pool.query(
        "SELECT * FROM internship_data WHERE internship_id = $1 AND student_id = $2",
        [id, req.user.student_id]
      );
    } else if (req.user.role === "course_advisor") {
      result = await pool.query(
        `SELECT i.* FROM internship_data i
         JOIN student s ON i.student_id = s.student_id
         WHERE i.internship_id = $1 AND s.batch_id = $2`,
        [id, req.user.batch_id]
      );
    }

    if (result.rows.length === 0) return res.status(404).json({ error: "Internship not found" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update Internship (Student only)
const updateInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      internship_type,
      reporting_officer_name,
      organization,
      contact,
      email,
      website,
      internship_duration,
      year_of_completion,
    } = req.body;

    const evidences = req.files?.evidences?.[0] || null;
    const survey1 = req.files?.survey1?.[0] || null;
    const survey2 = req.files?.survey2?.[0] || null;
    const survey3 = req.files?.survey3?.[0] || null;

    const result = await pool.query(
      `UPDATE internship_data 
       SET internship_type = COALESCE($1, internship_type),
           reporting_officer_name = COALESCE($2, reporting_officer_name),
           organization = COALESCE($3, organization),
           contact = COALESCE($4, contact),
           email = COALESCE($5, email),
           website = COALESCE($6, website),
           internship_duration = COALESCE($7, internship_duration),
           year_of_completion = COALESCE($8, year_of_completion),
           evidences = COALESCE($9, evidences),
           evidences_mimetype = COALESCE($10, evidences_mimetype),
           survey1 = COALESCE($11, survey1),
           survey1_mimetype = COALESCE($12, survey1_mimetype),
           survey2 = COALESCE($13, survey2),
           survey2_mimetype = COALESCE($14, survey2_mimetype),
           survey3 = COALESCE($15, survey3),
           survey3_mimetype = COALESCE($16, survey3_mimetype)
       WHERE internship_id = $17 AND student_id = $18 
       RETURNING *`,
      [
        internship_type,
        reporting_officer_name,
        organization,
        contact,
        email,
        website,
        internship_duration,
        year_of_completion,
        evidences ? evidences.buffer : null,
        evidences ? evidences.mimetype : null,
        survey1 ? survey1.buffer : null,
        survey1 ? survey1.mimetype : null,
        survey2 ? survey2.buffer : null,
        survey2 ? survey2.mimetype : null,
        survey3 ? survey3.buffer : null,
        survey3 ? survey3.mimetype : null,
        id,
        req.user.student_id,
      ]
    );

    if (result.rows.length === 0) return res.status(403).json({ error: "Forbidden or not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete Internship (Student only)
const deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM internship_data WHERE internship_id = $1 AND student_id = $2 RETURNING *",
      [id, req.user.student_id]
    );

    if (result.rows.length === 0) return res.status(403).json({ error: "Forbidden or not found" });

    res.json({ message: "Internship deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ================== FILE HANDLING ==================

// Role-aware file download (from bytea)
const getFile = async (req, res) => {
  try {
    const { id, type } = req.params; // type = evidences | survey1 | survey2 | survey3

    const internshipRes = await pool.query("SELECT * FROM internship_data WHERE internship_id = $1", [id]);
    if (internshipRes.rows.length === 0) return res.status(404).json({ error: "Internship not found" });

    const internship = internshipRes.rows[0];

    // Role-based access
    // if (req.user.role === "student" && internship.student_id !== req.user.student_id) {
    //   return res.status(403).json({ error: "Forbidden" });
    // }
    // if (req.user.role === "course_advisor") {
    //   const studentRes = await pool.query("SELECT batch_id FROM student WHERE student_id = $1", [
    //     internship.student_id,
    //   ]);
    //   if (studentRes.rows[0].batch_id !== req.user.batch_id) {
    //     return res.status(403).json({ error: "Forbidden" });
    //   }
    // }

    let fileBuffer, mimetype;
    if (type === "evidences") {
      fileBuffer = internship.evidences;
      mimetype = internship.evidences_mimetype;
    } else if (type === "survey1") {
      fileBuffer = internship.survey1;
      mimetype = internship.survey1_mimetype;
    } else if (type === "survey2") {
      fileBuffer = internship.survey2;
      mimetype = internship.survey2_mimetype;
    } else if (type === "survey3") {
      fileBuffer = internship.survey3;
      mimetype = internship.survey3_mimetype;
    }

    if (!fileBuffer) return res.status(404).json({ error: "File not found" });

    res.setHeader("Content-Type", mimetype);
    res.send(fileBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getStudentsWithoutInternship = async (req, res) => {
  try {
    const batchId = req.query.batch_id; // optional

    let query = `
      SELECT s.student_id, s.student_name, s.registration_number, s.batch_id, b.batch_name, b.batch_year
      FROM student s
      LEFT JOIN internship_data i ON s.student_id = i.student_id
      LEFT JOIN batch b ON s.batch_id = b.batch_id
      WHERE i.internship_id IS NULL
    `;
    const params = [];

    if (batchId) {
      query += " AND s.batch_id = $1";
      params.push(batchId);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createInternship,
  getInternships,
  getAllInternships,
  getInternshipsByBatch,
  getInternshipById,
  updateInternship,
  deleteInternship,
  getFile,
  getStudentsWithoutInternship
};
