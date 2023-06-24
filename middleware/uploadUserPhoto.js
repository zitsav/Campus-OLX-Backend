// const multer = require("multer");
// const AppError = require("app-error");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/image/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new AppError("Not an image! Please upload an image.", 400), false);
//   }
// };

// const upload = multer({
//     storage: multerStorage,
//     fileFilter: multerFilter
// });

// module.exports = upload.single("profilePicture");