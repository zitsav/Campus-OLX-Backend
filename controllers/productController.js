const User = require('../models/User');
const Product = require('../models/Product');
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError, UnauthenticatedError } = require("../errors");

const getAllProducts = async (req, res) => {
  const products = await Product.find().sort("createdAt");
  res.status(StatusCodes.OK).json({ count: products.length, products });
};

const getAllProductsOfUser = async (req, res) => {
  const products = await Product.find({ createdBy: req.user._id }).sort("createdAt");
  res.status(StatusCodes.OK).json({ count: products.length, products });
};

const createProduct = async (req, res) => {
  req.body.createdBy = req.user._id;
  const user = req.user;
  if (!user) {
    throw new BadRequestError("Something went wrong");
  }
  const product = await Product.create(req.body);
  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
    try {
      const user = req.user;
      const {
        params: { id: productId },
      } = req;
  
      if (!user) {
        throw new BadRequestError("Something went wrong");
      }
      console.log(user._id)

      const product = await Product.findById(productId);
      if (!product) {
        throw new BadRequestError("Product does not exist");
      }
      console.log(product.createdBy)

      if (product.createdBy.toString() !== user._id.toString()) {
        throw new UnauthenticatedError("User is not permitted to delete this product");
      }
      
      await Product.deleteOne({ _id: productId });
      res.status(StatusCodes.OK).json({ product });
    } catch (error) {
      // Handle the error and send an appropriate response
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};
  

const editProduct = async (req, res) => {
    try {
      const user = req.user;
      const {
        params: { id: productId },
        body: updatedData
      } = req;
      
      if (!user) {
        throw new BadRequestError("Something went wrong");
      }
      
      const product = await Product.findById(productId);
      if (!product) {
        throw new NotFoundError("Product does not exist");
      }
      
      if (product.createdBy.toString() !== user._id.toString()) {
        throw new UnauthenticatedError("User is not permitted to edit this product");
      }
      
      const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
      res.status(StatusCodes.OK).json({ product: updatedProduct });
    } catch (error) {
      // Handle the error and send an appropriate response
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};  

module.exports = {
  getAllProducts,
  getAllProductsOfUser,
  deleteProduct,
  editProduct,
  createProduct
};
