import express from "express";
import EachFood from "./EachFood/EachFood";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    //how could I make this connect to db
    const foods = await EachFood.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: "Failed to catch food:" + err });
  }
});

export default router;
