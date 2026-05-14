require("dotenv").config();

//PlantNet API Imports
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

// server.js
const express = require("express");
const session = require("express-session");
const rateLimit = require("express-rate-limit");

const jwt = require("jsonwebtoken");

const { MongoClient } = require("mongodb");
const MongoStore = require("connect-mongo");

const bcrypt = require("bcrypt");
const Joi = require("joi");

const saltRoundsCount = 12;
const expireTime = 1000 * 60 * 60 * 24 * 7; // 1 week

const app = express();
const port = process.env.PORT || 3000;

const path = require("path");
const cors = require("cors");
const frontendPath = path.join(__dirname, "../COMP-2800/dist");

//SECRETS
const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY;

const MONGO_URL = process.env.MONGO_URL;
const MONGO_ATLAS_URL = process.env.MONGO_ATLAS_URL;
const MONGO_USERS_DB = process.env.MONGO_USERS_DB;
const MONGO_SESSION_SECRET = process.env.MONGO_SESSION_SECRET;

const NODE_SESSION_SECRET = process.env.NODE_SESSION_SECRET;

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
//END OF SECRETS

//DB STUFF
const database = new MongoClient(MONGO_ATLAS_URL, {});
const userCollection = database.db(MONGO_USERS_DB).collection("users");

var mongoStore = MongoStore.create({
	mongoUrl: MONGO_URL,
	crypto: {
		secret: MONGO_SESSION_SECRET,
	},
});

app.use(
	session({
		secret: NODE_SESSION_SECRET,
		store: mongoStore,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: false, // Set to true if using HTTPS
			sameSite: "lax",
			maxAge: expireTime,
		},
	})
);

const corsOptions = {
	origin: ["http://localhost:5173"],
	credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// multer for handling file uploads for PlantNet API
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

app.get("/api", (req, res) => {
	res.json({ fruits: ["mango", "apple"] });
});

//Plant Data Endpoint
app.get("/plantData", (req, res) => {
	res.json(
		JSON.parse(fs.readFileSync(path.join(__dirname, "uploads/bc_plant_edibility.json"), "utf-8"))
	);
});

// accept a single image file upload (field name: "image")
app.post("/plantIdentification", upload.single("image"), async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded (field name must be "image")' });
	}

	const filePath = req.file.path;
	const formData = new FormData();
	formData.append("organs", "auto");
	formData.append("images", fs.createReadStream(filePath));

	const project = "all";
	try {
		const headers = formData.getHeaders ? formData.getHeaders() : {};
		const response = await axios.post(
			`https://my-api.plantnet.org/v2/identify/${project}?api-key=${PLANTNET_API_KEY}`,
			formData,
			{ headers, maxContentLength: Infinity, maxBodyLength: Infinity }
		);

		const json = response.data;

		// cleanup uploaded file
		fs.unlink(filePath, err => {
			if (err) console.warn("Failed to remove temp upload:", err.message);
		});

		return res.json(json);
	} catch (error) {
		console.error("Error calling PlantNet API:", error);
		// cleanup uploaded file
		fs.unlink(filePath, err => {
			if (err) console.warn("Failed to remove temp upload:", err.message);
		});
		return res.status(500).json({ error: "Identification failed" });
	}
});

//---------------Authentication Endpoints------------------
const authRequired = require("./Middleware/authMiddleware");
const blockIfAuthenticated = require("./Middleware/blockIfAuthenticated");

app.post("/authentication/signup", blockIfAuthenticated, async (req, res) => {
	let { username, email, password } = req.body;

	const schema = Joi.object({
		username: Joi.string().alphanum().min(3).max(30).required(),
		email: Joi.string().email().required(),
		password: Joi.string().min(6).required(),
	});

	const { error } = schema.validate({ username, email, password });
	if (error) {
		return res.status(400).json({ error: error.details[0].message });
	}

	const saltRounds = bcrypt.genSaltSync(saltRoundsCount);
	const hashedPassword = bcrypt.hashSync(password, saltRounds);

	await userCollection.insertOne({ username, email, password: hashedPassword, user_type: "user" });

	//Log the user in immediately after signing up

	const token = jwt.sign({ username: username, email: email, userType: "user" }, JWT_SECRET, {
		expiresIn: "7d",
	});

	return res.json({ message: "User created and logged in successfully", token });
});

const loginLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 5, // 5 attempts per minute
	message: { error: "Too many login attempts. Try again later." },
	standardHeaders: true,
	legacyHeaders: false,
});

app.post("/authentication/login", loginLimiter, blockIfAuthenticated, async (req, res) => {
	let { email, password } = req.body;

	const schema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(6).required(),
	});

	const { error } = schema.validate({ email, password });
	if (error) {
		return res.status(400).json({ error: error.details[0].message });
	}

	const user = await userCollection.findOne({ email });
	if (!user) {
		return res.status(401).json({ error: "Invalid email or password" });
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		return res.status(401).json({ error: "Invalid email or password" });
	}

	const token = jwt.sign(
		{ userId: user._id, username: user.username, userType: user.user_type },
		JWT_SECRET,
		{
			expiresIn: "7d",
		}
	);

	return res.json({ message: "Login successful", token });
});

app.get("/authentication/status", authRequired, (req, res) => {
	res.json({
		user: {
			username: req.user.username,
			email: req.user.email,
			userType: req.user.userType,
		},
	});
});

//used specifically for backend.
app.listen(port, () => {
	console.log(`Backend running on http://localhost:${port}`);
});
