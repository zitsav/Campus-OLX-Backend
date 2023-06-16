const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// @desc    Update user details

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, contact, enrollmentNo, semester, upiId } =
    req.body;

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update the user's details
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.contact = contact || user.contact;
  user.enrollmentNo = enrollmentNo || user.enrollmentNo;
  user.semester = semester || user.semester;
  user.upiId = upiId || user.upiId;

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    contact: updatedUser.contact,
    enrollmentNo: updatedUser.enrollmentNo,
    semester: updatedUser.semester,
    upiId: updatedUser.upiId,
    email: updatedUser.email,

    // Include other fields you want to return in the response if necessary
  });
});

// @desc    Get current user details

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    contact: user.contact,
    enrollmentNo: user.enrollmentNo,
    semester: user.semester,
    upiId: user.upiId,

    // @TODO Include other profile information you want to return
  });
});

// @TODO implement other controllers like profile picture upload

module.exports = { updateUser, getCurrentUserProfile };
