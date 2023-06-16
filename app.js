const express = require("express");
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");
const connectDB = require('./db/connect');
connectDB();
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const {authentication} = require("./middleware/authentication");
const productRoutes = require("./routes/productRoutes")

dotenv.config();
const app = express();

app.use(express.json()); //to accept JSON data

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
