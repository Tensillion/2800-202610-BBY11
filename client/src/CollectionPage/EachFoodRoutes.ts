import express from "express";
import EachFood from "./EachFood/EachFood";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const foods = await EachFood.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch foods" });
  }
});

export default router;