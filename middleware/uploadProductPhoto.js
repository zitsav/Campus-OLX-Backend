// const multer = require("multer");
// const AppError = require("app-error");

// // Configure multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/image/posts");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });

// // Define file filter function
// const fileFilter = (req, file, cb) => {
//   // Check if the file is an image
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true); // Accept the file
//   } else {
//     cb(new Error("Not an image! Please upload an image."), false); // Reject the file
//   }
// };

// // Create multer upload instance
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
// });

// module.exports = upload.array("images");