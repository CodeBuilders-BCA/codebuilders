const express = require("express");
const router = express.Router();
const {
  createEvent,
  updateEvent,
  getEvents,
  getEventById,
  deleteEvent,
  getEventMemories,
  uploadEventMemories,
  deleteEventMemory,
  sendCertificates, // 👈 Added import
} = require("../controllers/eventController");

const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); 

// Define which fields contain files for Create/Update Event
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 }, 
  { name: 'certFile', maxCount: 1 }
]);

// --- Standard Event Routes ---

router.route("/")
  .get(getEvents)
  .post(protect, admin, uploadFields, createEvent);

router.route("/:id")
  .get(getEventById)
  .put(protect, admin, uploadFields, updateEvent)
  .delete(protect, admin, deleteEvent);

// --- 📸 Memories / Gallery Routes ---

router.route("/:id/memories")
  .get(getEventMemories) 
  .post(
    protect, 
    admin, 
    upload.array('images', 10), 
    uploadEventMemories
  );

router.route("/:id/memories/:imageId")
  .delete(protect, admin, deleteEventMemory);

// --- 🎓 Certificate Routes ---

// 👇 NEW: Route to trigger bulk certificate emails
router.post("/:id/certificates/send", protect, admin, sendCertificates);

module.exports = router;