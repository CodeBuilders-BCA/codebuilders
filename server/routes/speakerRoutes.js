const express = require("express");
const router = express.Router();
const {
  getSpeakers,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
} = require("../controllers/speakerController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // 👈 Import Multer

router.route("/")
  .get(getSpeakers)
  .post(protect, admin, upload.single("image"), createSpeaker); // 👈 Added upload middleware

router
  .route("/:id")
  .put(protect, admin, upload.single("image"), updateSpeaker)   // 👈 Added upload middleware
  .delete(protect, admin, deleteSpeaker);

module.exports = router;