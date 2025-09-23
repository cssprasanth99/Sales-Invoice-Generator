const express = require("express");
const {
  parseInvoiceFromText,
  generateRemainderEmail,
  getDashboardSummary,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/parse-text", protect, parseInvoiceFromText);
router.post("/generate-remainder", protect, generateRemainderEmail);
router.get("/dashboard-summary", protect, getDashboardSummary);

module.exports = router;
