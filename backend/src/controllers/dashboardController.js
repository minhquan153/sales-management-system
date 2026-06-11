import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const getDashboard = async (req, res) => {
  try {
    const [
      revenueResult,
      totalOrders,
      totalProducts,
      lowStockCount,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      Order.aggregate([
        {
          $match: { status: "completed" },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),
      Order.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Product.find({ stock: { $lte: 5 } })
        .sort({ stock: 1 })
        .limit(5),
      Order.find()
        .populate("customer", "name phone")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue: revenueResult[0]?.totalRevenue || 0,
          totalOrders,
          totalProducts,
          lowStockCount,
        },
        lowStockProducts,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
