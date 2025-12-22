const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, deleteMessage } = require("../controllers/messageController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public route to send message
router.post("/", sendMessage);

// Admin routes to view/delete
router.get("/", protect, admin, getMessages);
router.delete("/:id", protect, admin, deleteMessage);

module.exports = router;