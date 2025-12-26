const express = require("express");
const router = express.Router();
const {
  getExternalEvents,
  getExternalEvent,
  createExternalEvent,
  updateExternalEvent,
  deleteExternalEvent,
} = require("../controllers/externalEventsController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(getExternalEvents).post(protect, admin, createExternalEvent);
router
  .route("/:id")
  .get(getExternalEvent)
  .put(protect, admin, updateExternalEvent)
  .delete(protect, admin, deleteExternalEvent);

module.exports = router;