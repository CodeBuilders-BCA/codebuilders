const express = require("express");
const router = express.Router();

// 1. Controller Import
const {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/teamMemberController");
// 2. Auth Middleware Import
const { protect, admin } = require("../middleware/authMiddleware");

// 3. Cloudinary Upload Middleware Import
const upload = require("../middleware/uploadMiddleware");

// ==================================================================
// ROUTES
// ==================================================================

// Route: /api/team-members
router.route("/")
  .get(getTeamMembers) // ✅ Public: Everyone can see team members
  .post(
    protect, 
    admin, 
    upload.single("image"), // ✅ Middleware: Handles Image Upload to Cloudinary
    createTeamMember
  );

// Route: /api/team-members/:id
router.route("/:id")
  .put(
    protect, 
    admin, 
    upload.single("image"), // ✅ Middleware: Handles Image Upload on Update
    updateTeamMember
  )
  .delete(protect, admin, deleteTeamMember);

module.exports = router;