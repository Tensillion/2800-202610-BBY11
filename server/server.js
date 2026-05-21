require("dotenv").config();

//PlantNet API Imports
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

// server.js
const express = require("express");
const rateLimit = require("express-rate-limit");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { MongoClient, ObjectId } = require("mongodb");

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
const JWT_SECRET = process.env.JWT_SECRET;

if (!PLANTNET_API_KEY || !MONGO_ATLAS_URL || !MONGO_USERS_DB || !MONGO_PLANTS_DB || !JWT_SECRET) {
	console.error("Missing required environment variables. Please check your .env file.");
	process.exit(1);
}

//END OF SECRETS

//DB STUFF
const database = new MongoClient(MONGO_ATLAS_URL, {});
global.database = database;
const userCollection = database.db(MONGO_USERS_DB).collection("users");
const markerCollection = database.db(MONGO_USERS_DB).collection("markers");
const plantCollection = database.db(MONGO_PLANTS_DB).collection("plants");
const petCollection = database.db(MONGO_USERS_DB).collection("pets");
const hatCollection = database.db(MONGO_USERS_DB).collection("hats");

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
		const { names = [], limit = 50, sortField = "scientific_name", sortOrder = 1 } = req.body;

		const allowedSortFields = ["scientific_name", "common_names", "genus"];

		if (!Array.isArray(names) || names.length === 0) {
			return res.status(400).json({ error: "names must be a non-empty array" });
		}

		if (limit < 1 || limit > 100) {
			return res.status(400).json({ error: "limit must be between 1 and 100" });
		}

		if (!allowedSortFields.includes(sortField)) {
			return res
				.status(400)
				.json({ error: `sortField must be one of: ${allowedSortFields.join(", ")}` });
		}

		if (![1, -1].includes(sortOrder)) {
			return res.status(400).json({ error: "sortOrder must be 1 (asc) or -1 (desc)" });
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

		const searchableFields = ["scientific_name", "common_names", "parts"];

		// Search for plants matching any of the names
		const plants = await plantCollection
			.find({
				$or: searchableFields.map(field => ({ [field]: { $in: regexPatterns } })),
			})
			.sort({ [sortField]: sortOrder })
			.limit(limit)
			.toArray();

		res.json(
			plants.map(plant => ({
				...plant,
				name: plant.scientific_name ?? null,
				scientific_name: plant.scientific_name ?? null,
				common_names: plant.common_names ?? [],
				parts: plant.parts ?? [],
			}))
		);
	} catch (error) {
		console.error("Error searching plants:", error);
		res.status(500).json({ error: "Failed to search plants" });
	}
});

app.get("/plants/search", async (req, res) => {
	try {
		const q = req.query.q?.trim();
		if (!q) return res.json([]);

		const results = await plantCollection
			.find({
				common_names: { $regex: q, $options: "i" },
			})
			.limit(8)
			.project({ common_names: 1, scientific_name: 1, edible: 1 })
			.toArray();

		res.json(results);
	} catch (err) {
		console.error("Plant autocomplete error:", err);
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

async function registerAuthenticationRoutes() {
	const { default: signUpRouter } = await import("./authentication/signUpRoute.mjs");
	const { default: loginRouter } = await import("./authentication/loginRoute.mjs");
	app.use(signUpRouter);
	app.use(loginRouter);
}

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
		{ _id: new ObjectId(req.user.userId) },
		{ projection: { password: 0 } }
	);

	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}
	return res.json({
		user,
		plants: user.plants ?? [],
	});
});

app.patch("/users/profile/username", authRequired, async (req, res) => {
	const schema = Joi.object({
		username: Joi.string().alphanum().min(3).max(30).required(),
	});
	const { error, value } = schema.validate(req.body);

	if (await userCollection.findOne({ username: value.username })) {
		return res.status(400).json({ error: "Username already taken" });
	}

	if (error) {
		return res.status(400).json({ error: error.details[0].message });
	}

	const result = await userCollection.findOneAndUpdate(
		{ _id: new ObjectId(req.user.userId) },
		{ $set: { username: value.username } },
		{ returnDocument: "after", projection: { password: 0 } }
	);

	if (!result) {
		return res.status(404).json({ error: "User not found" });
	}

	const token = jwt.sign(
		{
			userId: result._id.toString(),
			username: result.username,
			email: result.email,
			userType: result.user_type,
			plants: result.plants ?? [],
		},
		JWT_SECRET,
		{ expiresIn: "7d" }
	);

	return res.json({
		message: "Username updated",
		token,
		user: {
			username: result.username,
			email: result.email,
			userType: result.user_type,
		},
	});
});

app.patch("/users/profile/password", authRequired, async (req, res) => {
	const schema = Joi.object({
		currentPassword: Joi.string().min(6).required(),
		newPassword: Joi.string().min(6).required(),
	});
	const { error, value } = schema.validate(req.body);

	if (error) {
		return res.status(400).json({ error: error.details[0].message });
	}

	const user = await userCollection.findOne({ _id: new ObjectId(req.user.userId) });

	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}

	const isMatch = await bcrypt.compare(value.currentPassword, user.password);

	if (!isMatch) {
		return res.status(401).json({ error: "Current password is incorrect" });
	}

	const salt = await bcrypt.genSalt(12);
	const hashedPassword = await bcrypt.hash(value.newPassword, salt);

	await userCollection.updateOne(
		{ _id: new ObjectId(req.user.userId) },
		{ $set: { password: hashedPassword } }
	);

	return res.json({ message: "Password updated" });
});

app.post("/users/addPlant", authRequired, async (req, res) => {
	const { scientificNameWithoutAuthor } = req.body;

	if (!scientificNameWithoutAuthor) {
		return res.status(400).json({ error: "scientificNameWithoutAuthor is required" });
	}

	// Validate that the plant is not already in the user's collection
	const user = await userCollection.findOne(
		{ _id: new ObjectId(req.user.userId) },
		{ projection: { plants: 1 } }
	);

	if (user.plants && user.plants.includes(scientificNameWithoutAuthor)) {
		return res.status(400).json({ error: "Plant already in user's collection" });
	}

	//Add to user's plant collection
	await userCollection.updateOne(
		{ _id: new ObjectId(req.user.userId) },
		{ $addToSet: { plants: scientificNameWithoutAuthor } }
	);

	return res.json({
		message: "Plant added successfully",
		plant: scientificNameWithoutAuthor,
	});
});

//---------------Pet Endpoints------------------

const petTypes = ["Acorn", "Mushroom", "Berry"];
const petTitles = [
	"Captain",
	"Super",
	"The Great",
	"The Goat",
	"Master",
	"Forest Guardian",
	"Ancient",
	"Massive",
	"Tiny Tyrant",
];

app.get("/petAPI/hasPet", authRequired, async (req, res) => {
	const pet = await petCollection.findOne({
		ownerId: req.user.userId,
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
		xp: 0,
		level: 1,
		happiness: 100,
		food: 5,
		hat: null,
		lastupdate: Date.now() / 1000,
		decayrate: 0.001,
		ownerId: req.user.userId,
	};

	await petCollection.insertOne(pet);

	return res.json({
		message: "Pet added successfully",
		pet,
	});
});

app.post("/petAPI/updatePet", authRequired, async (req, res) => {
	const pet = await petCollection.findOne({
		ownerId: req.user.userId,
	});

	if (!pet) {
		return res.status(404).json({ error: "Pet not found" });
	}

	const { xp = 0, happiness = 0, food = 0 } = req.body;

	const now = Date.now() / 1000;
	const elapsed = now - pet.lastupdate;

	let decayedHappiness = pet.happiness - elapsed * pet.decayrate;
	decayedHappiness = Math.max(0, Math.min(decayedHappiness, 100));

	let finalHappiness = decayedHappiness + happiness;
	finalHappiness = Math.max(0, Math.min(finalHappiness, 100));

	let newXP = pet.xp + xp;
	let newLevel = pet.level;
	let hasNewHat = false;

	//To ensure that food is always added, even if pet.food is undefined / NaN
	let newFood;
	if (pet.food !== null && !isNaN(pet.food)) {
		newFood = pet.food + food;
	}

	if (newXP >= 100) {
		newLevel += Math.floor(newXP / 100);
		newXP = newXP % 100;

		// For every 5 levels gained, give the user a new hat (random)

		if (newLevel % 5 === 0) {
			console.log("Congratulations! Your pet leveled up and you received a new hat!");
			const hatTypes = ["cap", "kankan", "rain", "top"];
			const randomHat = hatTypes[Math.floor(Math.random() * hatTypes.length)];
			const randomHue = Math.floor(Math.random() * 361);

			const newHat = {
				type: randomHat,
				hue: randomHue,
				ownerId: req.user.userId,
			};

			hasNewHat = true;
			await hatCollection.insertOne(newHat);
		}
	}

	await petCollection.updateOne(
		{ _id: pet._id },
		{
			$set: {
				happiness: finalHappiness,
				xp: newXP,
				level: newLevel,
				lastupdate: now,
				food: newFood,
			},
		}
	);

	if (hasNewHat) {
		return res.json({
			message: "Pet updated successfully and you received a new hat!",
			newHat: true,
			pet: {
				...pet,
				happiness: finalHappiness,
				xp: newXP,
				level: newLevel,
				lastupdate: now,
				food: newFood,
			},
		});
	}

	return res.json({
		message: "Pet updated successfully",
		pet: {
			...pet,
			happiness: finalHappiness,
			xp: newXP,
			level: newLevel,
			lastupdate: now,
			food: pet.food + food,
		},
	});
});

app.post("/petAPI/setHat", authRequired, async (req, res) => {
	const hatTypes = ["cap", "kankan", "rain", "top"];
	const { hat } = req.body;

	if (hat !== null && (!hat || !hatTypes.includes(hat.type))) {
		return res.status(400).json({ error: "Invalid hat type" });
	}

	const pet = await petCollection.findOne({
		ownerId: req.user.userId,
	});

	if (!pet) {
		return res.status(404).json({ error: "Pet not found" });
	}

	await petCollection.updateOne(
		{ _id: pet._id },
		{
			$set: {
				hat,
			},
		}
	);

	return res.json({
		message: "Pet hat updated successfully",
		pet: {
			...pet,
			hat,
		},
	});
});

//Hats Sub-Endpoints

// Get all hats owned by the user
async function getOwnedHats(req, res) {
	const hat = await hatCollection
		.find({
			ownerId: req.user.userId,
		})
		.sort({ _id: -1 })
		.toArray();
	return res.json({ hat });
}

app.get("/petAPI/hat/getHats", authRequired, getOwnedHats);
app.post("/petAPI/hat/getHats", authRequired, getOwnedHats);

// Add a new hat to the user's collection
app.post("/petAPI/hat/add", authRequired, async (req, res) => {
	const { hatType, hue } = req.body;
	const hatTypes = ["cap", "kankan", "rain", "top"];

	if (!hatType || !hatTypes.includes(hatType)) {
		return res.status(400).json({ error: "Invalid hat type" });
	}

	if (hue !== undefined && (typeof hue !== "number" || hue < 0 || hue > 360)) {
		return res.status(400).json({ error: "Hue must be a number between 0 and 360" });
	}

	const newHat = {
		type: hatType,
		hue: hue !== undefined ? hue : 0,
		ownerId: req.user.userId,
	};

	await hatCollection.insertOne(newHat);
	return res.json({ message: "Hat added successfully", hat: newHat });
});

app.post("/petAPI/easterEgg", authRequired, async (req, res) => {
	try {
		const pet = await petCollection.findOne({
			ownerId: req.user.userId,
		});

		if (!pet) {
			return res.status(404).json({
				error: "Pet not found",
			});
		}

		if (pet.easterEggFound) {
			return res.status(400).json({
				error: "You already found this secret!",
			});
		}

		const randomTitle = petTitles[Math.floor(Math.random() * petTitles.length)];

		const updatedName = `${randomTitle} ${pet.name}`;

		await petCollection.updateOne(
			{ _id: pet._id },
			{
				$set: {
					name: updatedName,
					easterEggFound: true,
				},
			}
		);

		res.json({
			message: "Secret discovered!",
			newName: updatedName,
		});
	} catch (err) {
		console.error(err);

		res.status(500).json({
			error: "Failed to activate easter egg",
		});
	}
});

//---------------- Markers Endpoints ----------------

app.get("/markers", async (req, res) => {
	try {
		const markers = await markerCollection.find({}).toArray();
		const enriched = await Promise.all(
			markers.map(async m => {
				if (m.plantName || !m.plantId) return m;
				try {
					const plant = await plantCollection.findOne(
						{ _id: new ObjectId(m.plantId) },
						{ projection: { common_names: 1 } }
					);
					return { ...m, plantName: plant?.common_names?.[0] ?? null };
				} catch {
					return m;
				}
			})
		);

		res.json(enriched);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to load markers" });
	}
});

app.get("/markers/mine", authRequired, async (req, res) => {
	try {
		const markers = await markerCollection.find({ userId: req.user.userId.toString() }).toArray();
		res.json(markers);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to load your markers" });
	}
});

app.post("/markers", authRequired, async (req, res) => {
	try {
		const { lat, lng, plantName, plantId, edible } = req.body;
		const userId = req.user.userId.toString();

		if (lat == null || lng == null) {
			return res.status(400).json({ error: "lat and lng required" });
		}

		const newMarker = {
			lat,
			lng,
			plantName,
			plantId,
			edible: edible ?? null,
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

app.delete("/markers/:id", authRequired, async (req, res) => {
	try {
		const id = req.params.id;
		const requestingUserId = req.user.userId;

		const marker = await markerCollection.findOne({ _id: new ObjectId(id) });

		if (!marker) {
			return res.status(404).json({ error: "Marker not found" });
		}

		if (marker.userId !== requestingUserId.toString()) {
			return res.status(403).json({ error: "Not authorized to delete this marker" });
		}

		await markerCollection.deleteOne({ _id: new ObjectId(id) });
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
		await registerAuthenticationRoutes();
	} catch (error) {
		console.error("Failed to register routes:", error);
	}

	app.listen(port, () => {
		console.log(`Backend running on http://localhost:${port}`);
	});
}

startServer();
