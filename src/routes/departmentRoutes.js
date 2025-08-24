const express = require("express");
const router = express.Router(); 
const { 
  addDepartment, 
  getDepartments,
  editDepartment,
  deleteDepartmentHandler
} = require("../controllers/departmentController");
const auth = require("../middleware/authMiddleware");

// POST - Create department
router.post("/",auth(["admin"]), addDepartment);

// NEW: GET - Get all departments
router.get("/",auth(["admin"]), getDepartments);

// PUT - Update department
router.put("/:dept_id", auth(["admin"]), editDepartment);

// DELETE - Delete department
router.delete("/:dept_id", auth(["admin"]), deleteDepartmentHandler);

module.exports = router;