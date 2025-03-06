import { Router } from "express";
import { refreshToken, signIn, signUp } from "../controllers/authController";

const router = Router();
router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/refresh-token", refreshToken);

export default Router;
