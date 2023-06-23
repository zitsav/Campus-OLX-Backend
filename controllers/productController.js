const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const cloudinary = require('cloudinary').v2;
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../errors");

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort("createdAt");
  res.status(StatusCodes.OK).json({ count: products.length, products });
});

const getAllProductsOfUser = asyncHandler(async (req, res) => {
  const products = await Product.find({ createdBy: req.user._id }).sort(
    "createdAt"
  );
  res.status(StatusCodes.OK).json({ count: products.length, products });
});

const createProduct = async (req, res, next) => {
  try {
    // Get the product data from the request body
    const user = req.user;
    const { name, description, price, category, createdBy, isSold } = req.body;

    // Get the uploaded images from the request files
    const images = req.files;

    // Upload images to Cloudinary
    const uploadPromises = images.map((image) => {
      return cloudinary.uploader.upload(image.path, {
        folder: "products",
      });
    });

    // Wait for all images to be uploaded
    const uploadedImages = await Promise.all(uploadPromises);

    // Extract the publicIds and URLs of the uploaded images
    const imageUrls = uploadedImages.map((image) => {
      return { publicId: image.public_id, url: image.secure_url };
    });

    // Create the product
    const product = new Product({
      name,
      description,
      price,
      category,
      createdBy : user._id,
      isSold,
      images: imageUrls,
    });

    // Save the product to the database
    await product.save();

    // Return the product in the response
    res.status(201).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const productId = req.params.id;

    if (!user) {
      throw new BadRequestError("Something went wrong");
    }

    const product = await Product.findById(productId).populate("createdBy");

    if (!product) {
      throw new NotFoundError("Product does not exist");
    }

    if (product.createdBy._id.toString() !== user._id.toString()) {
      throw new UnauthenticatedError(
        "User is not permitted to delete this product"
      );
    }

    // Delete images from Cloudinary
    const deletePromises = product.images.map((image) => {
      return cloudinary.uploader.destroy(image.publicId);
    });

    // Wait for all images to be deleted
    await Promise.all(deletePromises);

    // Delete the product from the database
    await product.remove();

    res.status(StatusCodes.OK).json({ message: "Product deleted successfully" });
  } catch (error) {
    // Handle the error and send an appropriate response
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});



const editProduct = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const {
      params: { id: productId },
      body: updatedData,
    } = req;

    if (!user) {
      throw new BadRequestError("Something went wrong");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product does not exist");
    }

    if (product.createdBy.toString() !== user._id.toString()) {
      throw new UnauthenticatedError(
        "User is not permitted to edit this product"
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    );
    res.status(StatusCodes.OK).json({ product: updatedProduct });
  } catch (error) {
    // Handle the error and send an appropriate response
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
});



module.exports = {
  getAllProducts,
  getAllProductsOfUser,
  deleteProduct,
  editProduct,
  createProduct,
};
