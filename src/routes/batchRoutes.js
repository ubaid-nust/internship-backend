const express = require("express");
const router = express.Router();
const { addBatch, getBatches, deleteBatch, updateBatch } = require("../controllers/batchController");
const auth = require("../middleware/authMiddleware");

// POST /api/batches - Create new batch
router.post("/",auth(["admin"]), addBatch);

// GET /api/batches - Get all batches
router.get("/",auth(["admin"]), getBatches);

// DELETE /api/batches/:id - Delete batch
router.delete("/:id",auth(["admin"]), deleteBatch);

// ✅ Update Batch API
router.put("/:batch_id", auth(["admin"]), updateBatch);

module.exports = router;