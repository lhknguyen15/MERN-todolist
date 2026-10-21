import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { verifyCsrfToken } from "../middlewares/csrfMiddleware";

const router = Router();

router.use(authenticateToken);
router.get("/", getCategories);
router.post("/", verifyCsrfToken, createCategory);
router.put("/:id", verifyCsrfToken, updateCategory);
router.delete("/:id", verifyCsrfToken, deleteCategory);

export default router;
