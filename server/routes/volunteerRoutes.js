const express = require("express");
const router = express.Router();
const {
  getVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getVolunteerProfile, 
} = require("../controllers/volunteerController");
const { protect, admin } = require("../middleware/authMiddleware");

// 👇 VOLUNTEER ROUTE (Must be before /:id)
// This allows the Volunteer Panel to fetch "My Profile"
router.get("/me", protect, getVolunteerProfile);

// 👇 ADMIN ROUTES
// These allow Admins to see all volunteers and add new ones
router.route("/")
  .get(protect, admin, getVolunteers)
  .post(protect, admin, createVolunteer);

router.route("/:id")
  .put(protect, admin, updateVolunteer)
  .delete(protect, admin, deleteVolunteer);

module.exports = router;