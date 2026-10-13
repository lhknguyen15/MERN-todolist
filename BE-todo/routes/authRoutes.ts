import { Router } from "express";
import {
  getCurrentUser,
  getCsrfToken,
  logoutUser,
  refreshSession,
  signIn,
  signUp,
} from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { verifyCsrfToken } from "../middlewares/csrfMiddleware";

const router = Router();

router.post("/register", signUp);
router.post("/login", signIn);
router.get("/csrf", getCsrfToken);
router.post("/refresh", verifyCsrfToken, refreshSession);
router.post("/logout", verifyCsrfToken, logoutUser);
router.get("/me", authenticateToken, getCurrentUser);

export default router;
