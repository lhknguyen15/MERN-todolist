import { Router } from "express";
import { refreshToken, signIn, signUp } from "../controllers/authController";

const router = Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/refresh-token", refreshToken);

export default router;
