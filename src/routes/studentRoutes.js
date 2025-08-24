const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  addStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  uploadCV,
  deleteCV,
  downloadCV,
  openCV,
  getStudentProfile
} = require("../controllers/studentController");

const auth = require("../middleware/authMiddleware");

// setup multer upload (store in memory)
const upload = multer({ storage: multer.memoryStorage() });

router.get("/me",auth(["student"]), getStudentProfile);
router.post("/", auth(["admin"]), addStudent);
router.get("/", auth(["admin"]), getStudents);
router.get("/:id", auth(["admin", "student"]), getStudent);
router.put("/:id", auth(["admin", "student"]), updateStudent);
router.delete("/:id", auth(["admin"]), deleteStudent);

// CV management
router.post("/:id/cv", auth(["student"]), upload.single("cv"), uploadCV);
router.delete("/:id/cv", auth(["student"]), deleteCV);
router.get("/:id/cv/download", auth(["admin", "student"]), downloadCV);
router.get("/:id/cv/open", auth(["admin", "student"]), openCV);

module.exports = router;
