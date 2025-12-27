const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// 'protect' and 'admin' middlewares are required for all these routes
router.route("/")
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router.route("/:id")
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;