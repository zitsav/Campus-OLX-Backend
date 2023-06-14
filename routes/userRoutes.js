const express = require('express');
const {protect} = require('../middleware/authentication');
const {registerUser,authUser, verifyCode, resetPassword, forgotPassword} = require('../controllers/userController');
const { allUsers } = require('../controllers/searchController');
const router = express.Router();

router.route("/").post(registerUser);
router.route("/verify").post(verifyCode)
router.post("/login", authUser);
router.route("/forgotpassword").post(forgotPassword)
router.route("/reset").post(resetPassword)
router.route("/").get(protect, allUsers);

module.exports = router;