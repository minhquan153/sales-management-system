import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";
import {
  authorize,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getProducts)
  .post(authorize("admin"), createProduct);

router
  .route("/:id")
  .get(getProductById)
  .put(authorize("admin"), updateProduct)
  .delete(authorize("admin"), deleteProduct);

export default router;