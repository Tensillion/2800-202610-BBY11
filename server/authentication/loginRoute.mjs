import { Router } from "express";
import { logInController } from "./logInController.mjs";
import { rateLimit } from "express-rate-limit";
import blockIfAuthenticated from "../Middleware/blockIfAuthenticated.js";

const router = Router();

const loginRateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 5, // 5 attempts per minute
	message: { error: "Too many login attempts. Try again later." },
	standardHeaders: true,
	legacyHeaders: false,
});

router.post("/authentication/login", blockIfAuthenticated, loginRateLimiter, logInController);

export default router;
