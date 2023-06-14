const express = require("express");
const { protect,auth} = require("../middleware/authentication");
const { allUsers } = require("../controllers/searchController");
const {authUser,logoutUser} = require("../controllers/sessionController");
const {
  registerUser,
  verifyCode,
  resetPassword,
  forgotPassword,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.route("/").post(registerUser);
router.route("/verify").post(verifyCode);
router.post("/login", authUser);
router.route("/forgotpassword").post(forgotPassword);
router.route("/reset").post(resetPassword);
router.route("/").get(protect, allUsers);
router.delete("/:id",protect, deleteUser);
router.post("/logout",protect,logoutUser);

module.exports = router;
