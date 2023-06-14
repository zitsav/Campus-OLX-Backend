const express = require("express");
const { protect } = require("../middleware/authentication");
const {
  registerUser,
  verifyCode,
  resetPassword,
  forgotPassword,
  deleteUser,
} = require("../controllers/authController");

const router = express.Router();

router.route("/").post(registerUser);
router.route("/verify").post(verifyCode);
router.route("/forgotpassword").post(forgotPassword);
router.route("/reset").post(resetPassword);
router.delete("/:id",protect, deleteUser);

// @TODO: ditribute routes according to controllers

module.exports = router;
