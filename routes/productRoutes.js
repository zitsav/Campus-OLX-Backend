const express = require("express");
const { protect } = require("../middleware/authentication");
const {
  getAllProducts,
  getAllProductsOfUser,
  deleteProduct,
  editProduct,
  createProduct
} = require('../controllers/productController');

const router = express.Router();

// Apply protect middleware to the routes that require authentication
router.route("/").get(getAllProducts).post(protect, createProduct);
router.route("/user").get(protect, getAllProductsOfUser);
router.route("/:id").put(protect, editProduct).delete(protect, deleteProduct);

module.exports = router;
