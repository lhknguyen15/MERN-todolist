import { Router } from "express";
import { signIn, signUp } from "../controllers/authController";

const router = Router();

router.post("/register", signUp);
router.post("/login", signIn);

export default router;
