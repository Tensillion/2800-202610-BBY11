const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, "../COMP-2800/dist");

const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
  res.json({ fruits: ["mango", "apple"] });
});

//used specifically for backend.
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
