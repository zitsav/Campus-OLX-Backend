const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../config/generateToken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');

// @desc    Register a new user

const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    enrollmentNo,
    semester,
    branch,
    contact,
    upiId,
    email,
    password,
  } = req.body;

  if (
    !name ||
    !enrollmentNo ||
    !semester ||
    !branch ||
    !contact ||
    !email ||
    !password
  ) {
    res.status(400);
    throw new Error('Please fill all the fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Generate a 6-digit alphanumeric code
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();

  const user = await User.create({
    name,
    enrollmentNo,
    semester,
    branch,
    contact,
    upiId,
    email,
    password,
    registrationCode: code, // Add the code as an attribute of the user
    registrationCodeExpiration: Date.now() + 10 * 60 * 1000, // Set the code expiration time to 10 minutes from now
  });

  if (user) {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'grievanceportaliiita4@gmail.com',
        pass: 'bryoccqsbhkhnhah',
      },
    });

    // Prepare the email message
    const mailOptions = {
      from: 'Campus OLX',
      to: email,
      subject: 'Registration Confirmation',
      text: `Your verification code is: ${code}. It will expire in 10 minutes.`,
    };

    //@desc Send the email
    await transporter.sendMail(mailOptions);

    // Schedule deletion of the user after 10 minutes
    setTimeout(async () => {
      const user = await User.findById(user._id);
      if (user && !user.isVerified) {
        // Delete the user from the database
        await user.remove();
        console.log(`Deleted user with ID ${user._id}`);
      }
    }, 10 * 60 * 1000);

    res.status(201).json({
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
  } else {
    res.status(400);
    throw new Error('Failed to create User');
  }
});


// @desc    Verify the otp

const verifyCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.registrationCode !== code) {
    res.status(400);
    throw new Error('Invalid verification code');
  }

  if (user.registrationCodeExpiration < Date.now()) {
    res.status(400);
    throw new Error('Verification code has expired');
  }

  //  Clear the registration code and expiration once it's verified
  user.isVerified = true;
  user.registrationCode = undefined;
  user.registrationCodeExpiration = undefined;
  await user.save();

  res.status(200).json({ message: 'Verification successful' });
});


const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.registrationCode || user.registrationCodeExpiration || user.isVerified == false) {
    res.status(401);
    throw new Error("Please complete the regi sendResetTokenToEmail(user.email, resetToken);ation process and verify your email");
  }

  // Generate a reset token (8-digit alphanumeric code)
  const resetToken = crypto.randomBytes(4).toString('hex').toUpperCase();
  const resetTokenExpiration = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

  // Save the hashed reset token and expiration time to the user object
  user.resetPasswordToken = resetToken;
  user.resetPasswordTokenExpiration = resetTokenExpiration;
  await user.save();

  // Send the reset token to the user's email (implement the email sending logic using nodemailer)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'grievanceportaliiita4@gmail.com',
      pass: 'bryoccqsbhkhnhah',
    },
  });

  // Define the email options
  const mailOptions = {
    from: 'Campus OLX',
    to: email,
    subject: 'Password Reset',
    text: `Your password reset token is: ${resetToken}`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({ message: 'Reset token sent to email' });
});

// @desc reset password

const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.registrationCode || user.registrationCodeExpiration || user.isVerified === false) {
    res.status(401);
    throw new Error("Please complete the registration process and verify your email");
  }

  if (!token || user.resetPasswordToken !== token || user.resetPasswordTokenExpiration < Date.now()) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Set the new hashed password and clear the reset token and expiration
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiration = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successful' });
});

// @desc    Delete user

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
   // Delete user's images from Cloudinary
   const deletePromises = user.profilePicture.map((image) => {
    return cloudinary.uploader.destroy(image.publicId);
  });

  // Wait for all images to be deleted
  await Promise.all(deletePromises);

  await user.remove();

  res.json({ message: "User deleted" });
});

// Middleware to refresh token if it expires before verification
const refreshExpiredToken = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the database
    const user = await User.findOne({ email });

    if (user && !user.isVerified) {
      // If the user exists but is not verified yet, refresh the token and send it in the response
      res.status(200).json({ token: generateToken(user._id) });
    } else {
      next();
    }
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
};


// @TODO: Micellaneous conroller functions to be added here

module.exports = { registerUser, verifyCode, resetPassword, forgotPassword, deleteUser, refreshExpiredToken };