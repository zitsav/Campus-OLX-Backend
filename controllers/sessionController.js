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

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  let oldTokens = user.tokens || [];

  //check for previous tokens and remove them if they are older than 24 hours
  if (oldTokens.length) {
    oldTokens = oldTokens.filter((t) => {
      const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
      if (timeDiff < 86400) {
        return t;
      }
    });
  }

  // will support multple sessions as we'll be storing multiple tokens
  await User.findByIdAndUpdate(user._id, {
    tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
  });

  const userInfo = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    enrollmentNo: user.enrollmentNo,
    semester: user.semester,
    branch: user.branch,
    contact: user.contact,
    upiId: user.upiId,
    email: user.email,
  };

  res.json({ success: true, user: userInfo, token });
});

module.exports = { authUser };