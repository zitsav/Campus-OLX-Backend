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

    if (updatedData.password) {
      throw new BadRequestError("Cannot update password through this endpoint");
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
    throw new BadRequestError("Image file not found");
  }

  const imageFile = req.files.image;

  try {
    const user = req.user;

    // Delete the existing profile picture if it exist
    if (user.profilePicture && user.profilePicture.publicId) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId);
    }

    // Upload the new profile picture
    const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      use_filename: true,
      folder: 'profile-pictures'
    });

    const image = {
      publicId: result.public_id,
      url: result.secure_url
    };

    // Delete the temporary file
    fs.unlinkSync(imageFile.tempFilePath);

    // Update the user's profile picture
    user.profilePicture = image;
    await user.save();

    res.status(StatusCodes.OK).json({ image: { profilePicture: image } });
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
