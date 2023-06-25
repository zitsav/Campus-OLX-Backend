const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const path = require('path');
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../errors");
dotenv.config();

// @desc    Update user details

const updateUser = asyncHandler(async (req, res, next) => {
  try {
    const { user } = req;
    const { id: userId } = req.params;
    const updatedData = req.body;

    if (!user) {
      throw new BadRequestError("Something went wrong");
    }

    const foundUser = await User.findOneAndUpdate(
      { _id: userId },
      updatedData,
      { new: true }
    );

    if (!foundUser) {
      throw new NotFoundError("User does not exist");
    }

    if (foundUser._id.toString() !== user._id.toString()) {
      throw new UnauthenticatedError("User is not permitted to edit this profile");
    }

    res.status(StatusCodes.OK).json({ user: foundUser });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new BadRequestError("Image files not found");
  }

  const imageFiles = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

  try {
    const uploadPromises = imageFiles.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        use_filename: true,
        folder: 'sample-uploads'
      });
      // Delete the temporary file
      fs.unlinkSync(file.tempFilePath);
      return {
        publicId: result.public_id,
        url: result.secure_url
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    const profilePicture = uploadedImages[0]; // Assuming only one profile picture is uploaded

    res.status(StatusCodes.OK).json({ profilePicture });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
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

module.exports = { updateUser, getCurrentUserProfile, uploadProfilePicture };
