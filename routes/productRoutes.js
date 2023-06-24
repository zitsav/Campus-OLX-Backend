const express = require("express");
const { protect } = require("../middleware/authentication");

const {
  getAllProducts,
  getAllProductsOfUser,
  deleteProduct,
  editProduct,
  createProduct,
  uploadProductImage
} = require('../controllers/productController');

const router = express.Router();

// Apply protect middleware to the routes that require authentication
router.route("/").get(getAllProducts).post(protect, createProduct);
router.route("/:id").put(protect, editProduct).delete(protect, deleteProduct);
router.post("/upload", protect, uploadProductImage);

router.get("/user", protect, getAllProductsOfUser);

module.exports = router;