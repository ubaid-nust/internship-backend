const express = require("express");
const router = express.Router();
// const archiver = require("archiver");
// const path = require("path");
const controller = require("../controllers/internshipController");
const { uploadFields } = require("../utils/fileHandler");
const auth = require("../middleware/authMiddleware");

// ===============================
// Student Internship Management
// ===============================

// Add internship (with files like survey form etc.)
router.post(
  "/",
  auth(["student"]),
  uploadFields,
  controller.createInternship
);

// Update internship
router.put(
  "/:id",
  auth(["student"]),
  uploadFields,
  controller.updateInternship
);

// Delete internship
router.delete(
  "/:id",
  auth(["student"]),
  controller.deleteInternship
);

// Get internships of logged-in student
router.get(
  "/",
  auth(["student"]),
  controller.getInternships
);

// ===============================
// Course Advisor Access
// ===============================

// Advisor can see internships of their batch students
router.get(
  "/advisor",
  auth(["course_advisor"]),
  controller.getInternshipsByBatch
);

// ===============================
// Admin Access
// ===============================

// Admin can see all internships (optional, if you want this global view)
router.get(
  "/all",
  auth(["admin", "course_advisor"]),
  controller.getAllInternships
);

// ===============================
// File Access
// ===============================

// Student → only own files
// Advisor → only batch student files
// Admin → any file
router.get(
  "/:id/files/:type",
  controller.getFile
);

// Get students without internship
router.get(
  "/no-internship",
  auth(["admin", "course_advisor"]),
  controller.getStudentsWithoutInternship
);

module.exports = router;