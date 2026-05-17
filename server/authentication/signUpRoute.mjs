import { Router } from "express";
import { signUpController } from "./signUpController.mjs";
import { rateLimit } from "express-rate-limit";
import blockIfAuthenticated from "../Middleware/blockIfAuthenticated.js";

const router = Router();

const signUpRateLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 5,
	message: { error: "Too many signup attempts. Try again later." },
	standardHeaders: true,
	legacyHeaders: false,
});

router.post("/authentication/signup", blockIfAuthenticated, signUpRateLimiter, signUpController);

export default router;
