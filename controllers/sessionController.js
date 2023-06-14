const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../config/generateToken");

// @desc    Login user

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
  
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  
    if (user.registrationCode || user.registrationCodeExpiration || user.isVerified == false) {
      res.status(401);
      throw new Error("Please complete the registration process and verify your email");
    }
  
    if (!(await user.comparePassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      enrollmentNo: user.enrollmentNo,
      semester: user.semester,
      branch: user.branch,
      contact: user.contact,
      upiId: user.upiId,
      email: user.email,
      token: generateToken(user._id),
    });
  });

  module.exports = { authUser };