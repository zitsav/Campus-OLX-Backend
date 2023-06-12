const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../config/generateToken");

// @desc    Register a new user

const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    enrollmentNo,
    semester,
    branch,
    contact,
    upiId,
    email,
    password,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !enrollmentNo ||
    !semester ||
    !branch ||
    !contact ||
    !email ||
    !password
  ) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    //if user already exists
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    firstName,
    lastName,
    enrollmentNo,
    semester,
    branch,
    contact,
    upiId,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
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
  } else {
    res.status(400);
    throw new Error("Failed to create User");
  }
});

// @desc    Login user

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
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
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

module.exports = { registerUser, authUser };
