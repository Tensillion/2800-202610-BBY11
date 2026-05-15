require("dotenv").config();

//PlantNet API Imports
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

// server.js
const express = require("express");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const saltRoundsCount = 12;

const app = express();
const port = process.env.PORT || 3000;

const path = require("path");
const cors = require("cors");
const frontendPath = path.join(__dirname, "../COMP-2800/dist");

//SECRETS
const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY;
const MONGO_ATLAS_URL = process.env.MONGO_ATLAS_URL;

const MONGO_USERS_DB = process.env.MONGO_USERS_DB;
const MONGO_PLANTS_DB = process.env.MONGO_PLANTS_DB;

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
//END OF SECRETS

//DB STUFF
const database = new MongoClient(MONGO_ATLAS_URL, {});
const userCollection = database.db(MONGO_USERS_DB).collection("users");
const markerCollection = database.db(MONGO_USERS_DB).collection("markers");
const plantCollection = database.db(MONGO_PLANTS_DB).collection("plants");
const petCollection = database.db(MONGO_USERS_DB).collection("pets");

const corsOptions = {
	origin: ["http://localhost:5173"],
	credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//------------------ Gemini Route ------------------
async function registerGeminiRoutes() {
	const { default: askGeminiRouter } = await import("./gemini/askGeminiRoute.mjs");
	app.use(askGeminiRouter);
}

//------------------Pl@ntNet API------------------

// multer for handling file uploads for PlantNet API
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const plantCaptureLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 5, // 5 attempts per minute
	message: { error: "Too many captures attempts. Try again later." },
	standardHeaders: true,
	legacyHeaders: false,
});

app.get("/api", (req, res) => {
	res.json({ fruits: ["mango", "apple"] });
});

//Plant Data Endpoint
app.get("/plantData", async (req, res) => {
	let results = await plantCollection.find({}).toArray();

	res.json(results);
});

//Plant Search Endpoint, reusable for search bar and plant identification results
app.post("/plants/search", async (req, res) => {
	try {
		const { names = [], limit = 50, sortField = "name", sortOrder = 1 } = req.body;

		if (!Array.isArray(names) || names.length === 0) {
			return res.status(400).json({ error: "names must be a non-empty array" });
		}

		// Normalize names for case-insensitive matching
		const normalizedNames = names.map(n =>
			n
				.toLowerCase()
				.replace(/×/g, "x")
				.replace(/[^a-z0-9\s-]/g, " ")
				.replace(/\s+/g, " ")
				.trim()
		);

		// Build regex patterns for case-insensitive search (with escaping for special chars)
		const regexPatterns = normalizedNames.map(
			n => new RegExp(`^${n.replace(/[-\/\\^$*+?.()| [\\]{}]/g, "\\$&")}$`, "i")
		);

		// Search for plants matching any of the names
		const plants = await plantCollection
			.find({
				name: { $in: regexPatterns },
			})
			.sort({ [sortField]: sortOrder })
			.limit(limit)
			.toArray();

		res.json(plants);
	} catch (error) {
		console.error("Error searching plants:", error);
		res.status(500).json({ error: "Failed to search plants" });
	}
});

// accept a single image file upload (field name: "image")
app.post("/plantIdentification", plantCaptureLimiter, upload.single("image"), async (req, res) => {
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

const loginLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 5, // 5 attempts per minute
	message: { error: "Too many login attempts. Try again later." },
	standardHeaders: true,
	legacyHeaders: false,
});

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

	//Checks if email is already in use
	const user = await userCollection.findOne({ email }, { projection: { password: 0 } });
	if (user) {
		return res.status(409).json({ error: "Email is already in use" });
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

//---------------User Endpoints------------------

app.post("/users/getUserData", authRequired, async (req, res) => {
	const user = await userCollection.findOne(
		{ _id: new MongoClient.ObjectId(req.user.userId) },
		{ projection: { password: 0 } }
	);

	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}
	return res.json({ user });
});

//---------------Pet Endpoints------------------

const petTypes = ["Acorn", "Mushroom", "Berry"];

app.get("/petAPI/hasPet", authRequired, async (req, res) => {
	const pet = await petCollection.findOne({
		ownerId: new MongoClient.ObjectId(req.user.userId),
	});
	return res.json({ hasPet: !!pet });
});

app.get("/petAPI/getPet", authRequired, async (req, res) => {
	try {
		const pet = await petCollection.findOne({
			ownerId: req.user.userId,
		});
		return res.json({ pet });
	} catch (error) {
		console.error("Error fetching pet:", error);
		return res.status(500).json({ error: "Failed to fetch pet" });
	}
});

app.post("/petAPI/addPet", authRequired, async (req, res) => {
	const { name, type } = req.body;

	const schema = Joi.object({
		name: Joi.string().min(1).max(20).required(),
		type: Joi.string()
			.valid(...petTypes)
			.required(),
	});
	const { error } = schema.validate({ name, type });
	if (error) {
		return res.status(400).json({ error: error.details[0].message });
	}

	// Check if user already has a pet
	const existingPet = await petCollection.findOne({
		ownerId: req.user.userId,
	});

	if (existingPet) {
		return res.status(400).json({ error: "User already has a pet" });
	}

	const pet = {
		name,
		type,
		ownerId: req.user.userId,
	};

	await petCollection.insertOne(pet);

	return res.json({ message: "Pet added successfully" });
});

//Markers Endpoints
app.get("/markers", async (req, res) => {
	try {
		const markers = await markerCollection.find({}).toArray();
		res.json(markers);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to load markers" });
	}
});

app.post("/markers", authRequired, async (req, res) => {
	try {
		const { lat, lng, plantName } = req.body;
	    const userId = req.user.userId.toString();

		if (lat == null || lng == null) {
			return res.status(400).json({ error: "lat and lng required" });
		}

		const newMarker = {
			lat,
			lng,
			plantName,
			userId,
			createdAt: new Date(),
		};

		const result = await markerCollection.insertOne(newMarker);

		res.json({
			_id: result.insertedId,
			...newMarker,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to save marker" });
	}
});

app.delete("/markers/:id", async (req, res) => {
	try {
		const id = req.params.id;
		const requestingUserId = req.user.userId;

		await markerCollection.deleteOne({
			_id: new ObjectId(id),
		});

		res.json({ message: "Marker deleted" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to delete marker" });
	}
});

//used specifically for backend.
async function startServer() {
	try {
		await registerGeminiRoutes();
	} catch (error) {
		console.error("Failed to register Gemini routes:", error);
	}

	app.listen(port, () => {
		console.log(`Backend running on http://localhost:${port}`);
	});
}

startServer();
