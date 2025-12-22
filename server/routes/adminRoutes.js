const express = require("express");
const router = express.Router();
const {
  getAdminOverview,
  getVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// 👇 Apply security to ALL routes below this line automatically
router.use(protect);
router.use(admin);

// Dashboard Stats (No need to type protect, admin again)
router.get("/overview", getAdminOverview);

// Volunteer Management
router.route("/volunteers")
  .get(getVolunteers)
  .post(createVolunteer);

router.route("/volunteers/:id")
  .put(updateVolunteer)
  .delete(deleteVolunteer);

module.exports = router;