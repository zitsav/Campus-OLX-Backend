const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../config/cloudinary");
const dotenv = require("dotenv");
dotenv.config();

// @desc    Update user details

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, contact, enrollmentNo, semester, upiId } = req.body;

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update the user's details
  user.name = name || user.name;
  user.contact = contact || user.contact;
  user.enrollmentNo = enrollmentNo || user.enrollmentNo;
  user.semester = semester || user.semester;
  user.upiId = upiId || user.upiId;

  try {
    // Check if a file is uploaded
    if (req.file) {
      // Delete existing profile picture from Cloudinary if it exists
      if (user.profilePicture.publicId) {
        await cloudinary.uploader.destroy(user.profilePicture.publicId);
      }

      // Upload the new profile picture to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path,{
        folder: "profilePictures",
      });

      // Update the profile picture information in the user document
      user.profilePicture = {
        publicId: result.public_id,
        url: result.secure_url,
      };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      contact: updatedUser.contact,
      enrollmentNo: updatedUser.enrollmentNo,
      semester: updatedUser.semester,
      upiId: updatedUser.upiId,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture,
      // Include other fields you want to return in the response if necessary
    });
  } catch (error) {
    res.status(500).json({ error: "Error in updating" });
  }
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
    name: user.name,
    email: user.email,
    contact: user.contact,
    enrollmentNo: user.enrollmentNo,
    semester: user.semester,
    upiId: user.upiId,
    profilePicture: user.profilePicture,
    // @TODO Include other profile information you want to return
  });
});

module.exports = { updateUser, getCurrentUserProfile };
