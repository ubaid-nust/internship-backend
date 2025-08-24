const pool = require("../config/db"); // <-- add this at top
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  updateStudentCV,
  deleteStudent,
  getStudentCV,
} = require("../models/studentModel");
const bcrypt = require("bcryptjs");

// Create
const addStudent = async (req, res) => {
  try {
    const { login_id, password, student_name, registration_number, batch_id } =
      req.body;
    const admin_id = req.user?.admin_id;

    if (
      !login_id ||
      !password ||
      !student_name ||
      !registration_number ||
      !batch_id
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!admin_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Admin not logged in" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await createStudent(
      login_id,
      hashedPassword,
      student_name,
      registration_number,
      batch_id,
      admin_id
    );

    res.status(201).json({
      message: "Student created successfully",
      student: newStudent,
    });
  } catch (err) {
    console.error(err);

    if (err.code === "23505") {
      if (err.constraint === "student_login_id_key") {
        return res.status(409).json({ error: "Login ID already exists" });
      }
      if (err.constraint === "student_registration_number_key") {
        return res
          .status(409)
          .json({ error: "Registration number already exists" });
      }
    }

    if (err.code === "23503") {
      return res.status(400).json({ error: "Invalid batch ID" });
    }

    res.status(500).json({ error: "Server error" });
  }
};

// Get all students
const getStudents = async (req, res) => {
  try {
    const students = await getAllStudents();

    const safeStudents = students.map((s) => {
      const plain = s.toObject ? s.toObject() : { ...s };

      // ✅ capture flag before deleting
      const hasCV = s.cv && s.cv.buffer ? true : false;

      delete plain.password;
      delete plain.cv;
      delete plain.cv_mimetype;

      return {
        ...plain,
        cv: hasCV, // ✅ now frontend will see true/false
      };
    });

    res.status(200).json(safeStudents);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single student by ID
const getStudent = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const student = await getStudentById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const plain = student.toObject ? student.toObject() : { ...student };
    const hasCV = student.cv && student.cv.buffer ? true : false;

    delete plain.password;
    delete plain.cv;
    delete plain.cv_mimetype;

    plain.cv = hasCV;
    res.status(200).json(plain);
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update
const updateStudentHandler = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const { login_id, student_name, registration_number, batch_id, password } =
      req.body;

    const existingStudent = await getStudentById(studentId);
    if (!existingStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    let passwordToSave = existingStudent.password;
    if (password && password.trim() !== "") {
      passwordToSave = await bcrypt.hash(password, 10);
    }

    const updatePayload = {
      login_id,
      password: passwordToSave,
      student_name,
      registration_number,
      batch_id,
    };

    const updated = await updateStudent(studentId, updatePayload);
    if (!updated) {
      return res
        .status(404)
        .json({ error: "Student not found or not updated" });
    }

    const fullStudent = await getStudentById(studentId);
    if (fullStudent) {
      delete fullStudent.password;
      delete fullStudent.cv;
      delete fullStudent.cv_mimetype;
    }

    res.status(200).json({ student: fullStudent });
  } catch (err) {
    console.error("updateStudentHandler error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Upload CV
const uploadCV = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId)) return res.status(400).json({ error: "Invalid student ID" });

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Invalid file type. Only PDF, DOC, and DOCX are allowed" });
    }

    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: "File too large. Maximum size is 5MB" });
    }

    const updatedStudent = await updateStudentCV(
      studentId,
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname   // ✅ save original filename
    );

    res.status(200).json({ message: "CV uploaded successfully", student: updatedStudent });
  } catch (err) {
    console.error("uploadCV error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
// controllers/studentController.js
const deleteStudentHandler = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId))
      return res.status(400).json({ error: "Invalid student ID" });

    // auth(["admin"]) already enforced; no need to read req.admin
    const deletedStudent = await deleteStudent(studentId);
    if (!deletedStudent)
      return res.status(404).json({ error: "Student not found" });

    res.status(200).json({
      message: "Student deleted successfully",
      student: deletedStudent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Download CV
const downloadCV = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId)) return res.status(400).json({ error: "Invalid student ID" });

    const student = await getStudentById(studentId);
    if (!student || !student.cv) return res.status(404).json({ error: "CV not found for this student" });

    const contentType = student.cv_mimetype || "application/octet-stream";
    const filename = student.cv_filename || `${student.student_name}_CV`;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.end(student.cv);  // ✅ raw buffer, no corruption
  } catch (err) {
    console.error("downloadCV error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Open CV inline
const openCV = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const student = await getStudentCV(studentId);
    if (!student || !student.cv) {
      return res.status(404).json({ error: "CV not found for this student" });
    }

    const contentType = student.cv_mimetype || "application/pdf";
    res.setHeader("Content-Type", contentType);

    if (contentType === "application/pdf") {
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${student.student_name}_CV.pdf"`
      );
    } else {
      const extension = contentType.includes("document") ? "docx" : "doc";
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${student.student_name}_CV.${extension}"`
      );
    }

    res.send(student.cv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete CV
const deleteCV = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId))
      return res.status(400).json({ error: "Invalid student ID" });

    const student = await updateStudentCV(studentId, null, null);
    if (!student) return res.status(404).json({ error: "Student not found" });

    res.status(200).json({ message: "CV deleted successfully", student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.student_id; // <-- use student_id from JWT
    const result = await pool.query(
      "SELECT student_id, student_name, registration_number, batch_id FROM student WHERE student_id = $1",
      [studentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  addStudent,
  getStudents,
  getStudent,
  updateStudent: updateStudentHandler,
  deleteStudent: deleteStudentHandler,
  uploadCV,
  downloadCV,
  openCV,
  deleteCV,
  getStudentProfile,
};
