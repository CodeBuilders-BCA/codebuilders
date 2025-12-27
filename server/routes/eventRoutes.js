const express = require("express");
const router = express.Router();
const {
  createEvent,
  updateEvent,
  getEvents,
  getEventById,
  deleteEvent,
} = require("../controllers/eventController");

const { protect, admin } = require("../middleware/authMiddleware");

// ✅ Import your Cloudinary Middleware directly
const upload = require("../middleware/uploadMiddleware"); 

// Define upload configuration for Create/Update Event
// We use .fields() because the controller checks req.files.image
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 } 
]);

// --- Standard Event Routes ---

router.route("/")
  .get(getEvents)
  .post(protect, admin, uploadFields, createEvent);

router.route("/:id")
  .get(getEventById)
  .put(protect, admin, uploadFields, updateEvent)
  .delete(protect, admin, deleteEvent);

module.exports = router;