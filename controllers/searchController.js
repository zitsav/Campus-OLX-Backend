const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @desc    Get user profile

const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
    ? {
        $or: [
          { firstName: { $regex: req.query.search, $options: "i" } },
          { lastName: { $regex: req.query.search, $options: "i" } },
          { enrollmentNo: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
  })

module.exports = { allUsers };