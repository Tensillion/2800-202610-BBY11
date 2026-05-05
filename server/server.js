const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, "../COMP-2800/dist");

require("dotenv").config();
console.log("Mongo URI:", process.env.MONGODB_URI);
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const plantSchema = new mongoose.Schema({
  name: String,
  type: String,
  evolutionOne: String,
  evolutionTwo: String,
  fact: String,
});

const Plant = mongoose.model("Plant", plantSchema);
const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));

app.get("/plants", async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const testPlant = new Plant({
  name: "Blackberry",
  type: "Berry Vine",
  evolutionOne: "Wild Berry",
  evolutionTwo: "King Bramble",
  fact: "Common in Vancouver during summer",
});

testPlant
  .save()
  .then(() => console.log("Plant saved"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Foraging app backend is running");
});

//used specifically for backend.
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
