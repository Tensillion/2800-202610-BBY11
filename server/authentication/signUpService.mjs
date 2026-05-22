import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const saltRoundsCount = 12;

const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_USERS_DB = process.env.MONGO_USERS_DB;

const userCollection = () => global.database.db(MONGO_USERS_DB).collection("users");

/**
 * Attempts to sign up a new user with the provided credentials
 *
 * @param {*} username the username for the new user
 * @param {*} email the email for the new user
 * @param {*} password the password for the new user
 *
 * @returns if sign-up is successful, returns an object with status 201 and a body containing a success message and JWT token
 *
 * @author Tyson Nguyen
 */
async function attemptSignUp(username, email, password) {
	const users = userCollection();

	const existing = await users.findOne({ email }, { projection: { password: 0 } });
	if (existing) {
		return { status: 409, body: { error: "Email is already in use" } };
	}

	const salt = await bcrypt.genSalt(saltRoundsCount);
	const hashedPassword = await bcrypt.hash(password, salt);

	const result = await users.insertOne({
		username,
		email,
		password: hashedPassword,
		user_type: "user",
		plants: [],
	});
	const userId = result.insertedId;

	const token = jwt.sign(
		{ userId: userId.toString(), username, email, userType: "user", plants: [] },
		JWT_SECRET,
		{ expiresIn: "7d" }
	);

	return { status: 201, body: { message: "User created and logged in successfully", token } };
}

export { attemptSignUp };
