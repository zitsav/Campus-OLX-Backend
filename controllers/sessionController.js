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

  if (
    user.registrationCode ||
    user.registrationCodeExpiration ||
    user.isVerified == false
  ) {
    res.status(401);
    throw new Error(
      "Please complete the registration process and verify your email"
    );
  }

  if (!(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  // res.header('Authorization', generateToken(user._id));
  res.json({
    _id: user._id,
    name: user.name,
    enrollmentNo: user.enrollmentNo,
    semester: user.semester,
    branch: user.branch,
    contact: user.contact,
    upiId: user.upiId,
    email: user.email,
    profilePicture: user.profilePicture,
    token: generateToken(user._id),
  });
});

// @desc logout user

const logoutUser = async (req, res) => {
  try {
    const { user } = req;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized access!" });
    }

    // @TODO implement delete token from db

    //delete cookie from frontend
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};  

module.exports = { authUser, logoutUser };
