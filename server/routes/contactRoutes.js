const express = require("express");
const router = express.Router();
const { 
  submitContactForm, 
  getAllMessages, 
  deleteMessage 
} = require("../controllers/contactController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public route to send message
router.post("/", submitContactForm);

// Admin routes to view and delete messages
router.get("/", protect, admin, getAllMessages);
router.delete("/:id", protect, admin, deleteMessage);

module.exports = router;