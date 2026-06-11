import mongoose from "mongoose";
import Customer from "../models/Customer.js";

const isInvalidId = (id) => !mongoose.isValidObjectId(id);

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const customer = await Customer.create({
      name,
      phone,
      email,
      address,
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: { customer },
    });
  } catch (error) {
    console.error("Create customer error:", error.message);

    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message:
        error.name === "ValidationError"
          ? error.message
          : "Server error",
    });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: customers.length,
      data: { customers },
    });
  } catch (error) {
    console.error("Get customers error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    console.error("Get customer error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const allowedFields = ["name", "phone", "email", "address"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: { customer },
    });
  } catch (error) {
    console.error("Update customer error:", error.message);

    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message:
        error.name === "ValidationError"
          ? error.message
          : "Server error",
    });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
