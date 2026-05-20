import { Router } from "express";
import { askGeminiController } from "./askGeminiController.mjs";
import { rateLimit } from "express-rate-limit";

const router = Router();

const aiRateLimitter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 5, // 5 attempts per minute
	message: { error: "Too many AI requests. Try again later." },
	standardHeaders: true,
	legacyHeaders: false,
});

router.post("/ask-gemini", aiRateLimitter, askGeminiController);

export default router;
