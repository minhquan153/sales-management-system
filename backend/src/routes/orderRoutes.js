import express from "express";
import {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getOrders)
  .post(createOrder);

router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

export default router;
