import mongoose from "mongoose";
import Product from "../models/Product.js";

const isInvalidId = (id) => !mongoose.isValidObjectId(id);

export const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, description } = req.body;

    if (
      !name ||
      !category ||
      price === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, category, price and stock are required",
      });
    }

    const product = await Product.create({
      name,
      category,
      price,
      stock,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product },
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message:
        error.name === "ValidationError"
          ? error.message
          : "Server error",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const search = req.query.search?.trim();

    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: { products },
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    console.error("Get product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "price",
      "stock",
      "description",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message:
        error.name === "ValidationError"
          ? error.message
          : "Server error",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};