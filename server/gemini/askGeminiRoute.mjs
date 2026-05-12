import { Router } from "express";
import { askGeminiController } from "./askGeminiController.mjs";

const router = Router();

router.post("/ask-gemini", askGeminiController);

export default router;
