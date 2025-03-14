import { Router } from "express";
import { refreshToken, signIn, signUp } from "../controllers/authController";

const router = Router();

router.post("/register", signUp);
router.post("/login", signIn);
router.post("/refresh-token", refreshToken);

export default router;
