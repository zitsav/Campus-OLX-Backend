const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const path = require('path');
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../errors");

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort("createdAt");

  const formattedProducts = products.map((product) => {
    const { __v, _id, category, createdAt, createdBy, description, images, isSold, name, price} = product;

    const formattedImages = images.map((image) => {
      const { publicId, url } = image;
      return { publicId, url };
    });

    return {
      __v,
      _id,
      category,
      createdAt,
      createdBy,
      description,
      images: formattedImages,
      isSold,
      name,
      price,
    };
  });

  res.status(StatusCodes.OK).json({ count: formattedProducts.length, products: formattedProducts });
});

const getProductById = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);

  if (!product) {
    res.status(StatusCodes.NOT_FOUND).json({ message: 'Product not found' });
    return;
  }

  const { __v, _id, category, createdAt, createdBy, description, images, isSold, name, price } = product;

  // const formattedImages = images.map((image) => {
  //   const { publicId, url } = image;
  //   return { publicId, url };
  // });

  const formattedProduct = {
    __v,
    _id,
    category,
    createdAt,
    createdBy,
    description,
    images,
    isSold,
    name,
    price,
  };

  res.status(StatusCodes.OK).json(formattedProduct);
});

const getAllProductsOfUser = asyncHandler(async (req, res) => {
  const products = await Product.find({ createdBy: req.user._id }).sort(
    "createdAt"
  );
  res.status(StatusCodes.OK).json({ count: products.length, products });
});

const createProduct = async (req, res, next) => {
  console.log(req)
  try {
    const userId = req.user._id

    const product = await Product.create({ ...req.body, createdBy: userId });

    res.status(StatusCodes.CREATED).json({
        __v: product.__v,
        _id: product._id,
        category: product.category,
        createdAt: product.createdAt,
        createdBy: product.createdBy._id,
        description: product.description,
        images: product.images,
        isSold: product.isSold,
        name: product.name,
        price: product.price
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
    // const deletePromises = product.images.map((image) => {
    //   return cloudinary.uploader.destroy(image.publicId);
    // });

    // Wait for all images to be deleted
    // await Promise.all(deletePromises);

    // Delete the product from the database
    await product.remove();

    res.status(StatusCodes.OK).json({ message: "Product deleted successfully" });
  } catch (error) {
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

    const formattedProduct = {
      isSold: updatedProduct.isSold,
      _id: updatedProduct._id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      category: updatedProduct.category,
      price: updatedProduct.price,
      images: updatedProduct.images,
      createdBy: updatedProduct.createdBy,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
      __v: updatedProduct.__v,
    };

    res.status(StatusCodes.OK).json(formattedProduct);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new BadRequestError("Image files not found");
  }

  console.log(req);

  const imageFiles = req.files.image;

  try {
    const uploadPromises = imageFiles.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        use_filename: true,
        folder: 'sample-uploads'
      });
      // Delete the temporary file
      fs.unlinkSync(file.tempFilePath);
      return {
        publicId: result.public_id,
        url: result.secure_url,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);
    console.log(uploadedImages)
    res.status(StatusCodes.OK).json(uploadedImages);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

const searchByCategory = asyncHandler(async (req, res) => {
  const { category } = req.query;
  console.log(req.query);
  if (!category) {
    throw new BadRequestError("Category parameter is required");
  }

  const products = await Product.find({ category }).sort("createdAt");

  res.status(StatusCodes.OK).json({ count: products.length, products });
})

module.exports = {
  getAllProducts,
  getAllProductsOfUser,
  deleteProduct,
  editProduct,
  createProduct,
  uploadProductImage,
  searchByCategory,
  getProductById
};