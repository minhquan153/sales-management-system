import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const isInvalidId = (id) => !mongoose.isValidObjectId(id);

const restoreStock = async (items) => {
  await Promise.all(
    items.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      }),
    ),
  );
};

const populateOrder = (query) =>
  query
    .populate("customer", "name phone email address")
    .populate("items.product", "name category")
    .populate("createdBy", "name email role");

export const createOrder = async (req, res) => {
  const reducedItems = [];
  let orderCreated = false;

  try {
    const { customer, items } = req.body;

    if (!customer || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer and at least one product are required",
      });
    }

    if (isInvalidId(customer)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customerExists = await Customer.exists({ _id: customer });

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const quantitiesByProduct = new Map();

    for (const item of items) {
      if (
        !item.product ||
        isInvalidId(item.product) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each item must have a valid product ID and positive integer quantity",
        });
      }

      const productId = item.product.toString();
      const currentQuantity = quantitiesByProduct.get(productId) || 0;

      quantitiesByProduct.set(
        productId,
        currentQuantity + item.quantity,
      );
    }

    const productIds = [...quantitiesByProduct.keys()];
    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more products were not found",
      });
    }

    const orderItems = products.map((product) => {
      const quantity = quantitiesByProduct.get(
        product._id.toString(),
      );

      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        subtotal: product.price * quantity,
      };
    });

    for (const item of orderItems) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
      );

      if (result.modifiedCount === 0) {
        await restoreStock(reducedItems);

        return res.status(400).json({
          success: false,
          message: `Not enough stock for product: ${item.name}`,
        });
      }

      reducedItems.push(item);
    }

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.subtotal,
      0,
    );

    let order = await Order.create({
      customer,
      items: orderItems,
      totalAmount,
      createdBy: req.user._id,
    });

    orderCreated = true;
    order = await populateOrder(Order.findById(order._id));

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: { order },
    });
  } catch (error) {
    if (!orderCreated && reducedItems.length > 0) {
      await restoreStock(reducedItems);
    }

    console.error("Create order error:", error.message);

    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message:
        error.name === "ValidationError"
          ? error.message
          : "Server error",
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await populateOrder(
      Order.find().sort({ createdAt: -1 }),
    );

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders },
    });
  } catch (error) {
    console.error("Get orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await populateOrder(
      Order.findById(req.params.id),
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error("Get order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const { status } = req.body;
    const allowedStatuses = ["pending", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be pending, completed or cancelled",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "cancelled" && status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "A cancelled order cannot be reopened",
      });
    }

    if (order.status !== "cancelled" && status === "cancelled") {
      await restoreStock(order.items);
    }

    order.status = status;
    await order.save();

    const populatedOrder = await populateOrder(
      Order.findById(order._id),
    );

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: { order: populatedOrder },
    });
  } catch (error) {
    console.error("Update order status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
