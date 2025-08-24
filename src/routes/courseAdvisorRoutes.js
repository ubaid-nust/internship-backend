const express = require("express");
const router = express.Router();
const {
  addCourseAdvisor,
  getCourseAdvisors,
  getCourseAdvisor,
  updateCourseAdvisor,
  deleteCourseAdvisor,
  getAdvisorProfile
} = require("../controllers/courseAdvisorController");

const auth = require("../middleware/authMiddleware");

// Only admin can manage advisors
router.get("/me",auth(["course_advisor"]), getAdvisorProfile);
router.post("/", auth(["admin"]), addCourseAdvisor);
router.get("/", getCourseAdvisors);
router.get("/:id", auth(["admin", "course_advisor"]), getCourseAdvisor);
router.put("/:id", auth(["admin"]), updateCourseAdvisor);
router.delete("/:id", auth(["admin"]), deleteCourseAdvisor);

module.exports = router;
