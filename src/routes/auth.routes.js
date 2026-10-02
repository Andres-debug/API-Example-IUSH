import { Router } from "express";
import { login, register, welcomeEmail } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/welcome", welcomeEmail);

export default router;
