const express = require('express');
// const {protect} = require('../middleware/authentication');
const {registerUser,authUser} = require('../controllers/userController');
const router = express.Router();

router.route("/").post(registerUser);
router.post("/login", authUser);

module.exports = router;