const express = require("express");
const router = express.Router();
const {
  registerForEvent,
  getTicketByToken, 
  getEventRegistrations,
  getAllRegistrations,
  checkInRegistration,
  updateAttendance,
  deleteRegistration,
} = require("../controllers/registrationController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public: Register for an event
router.post("/", registerForEvent);

// Public: View Ticket Details (for the frontend Ticket View page)
router.get("/ticket/:tokenId", getTicketByToken);

// Check-in (Protected for Admin/Volunteer use)
router.put("/checkin/:tokenId", protect, checkInRegistration);

// Admin/Volunteer Routes
router.get("/", protect, getAllRegistrations);
router.get("/event/:eventId", protect, getEventRegistrations);
router.put("/:id/attendance", protect, updateAttendance); 
router.delete("/:id", protect, admin, deleteRegistration);

module.exports = router;