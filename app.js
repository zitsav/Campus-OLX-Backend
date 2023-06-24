const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
require('express-async-errors');
const cloudinary = require('cloudinary').v2
cloudinary.config({
  cloud_name:"drkrjzxjz",
  api_key:"836592262896224",
  api_secret:"PMF75CM2mymuK_5mQHUGf4eI5Qs"
})
const fileUpload = require('express-fileupload')
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const productRoutes = require("./routes/productRoutes")
const userRoutes = require("./routes/userRoutes");
const connectDB = require('./db/connect');
connectDB();
const app = express();

app.use(express.static('./public'))
app.use(express.json());
app.use(fileUpload({useTempFiles: true}))

app.get("/", (req, res) => {
  res.send("API is running");
});

// app.get("/api/test", (req, res) => {
//   res.send("Hello");
// })

app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes)

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server is running on port ${PORT}`.bold));
