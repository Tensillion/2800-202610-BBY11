import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_USERS_DB = process.env.MONGO_USERS_DB;

const userCollection = () => global.database.db(MONGO_USERS_DB).collection("users");

async function attemptLogin(email, password) {
	const users = userCollection();
	const user = await users.findOne({ email });
	if (!user) {
		return { status: 401, body: { error: "Invalid email or password" } };
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		return { status: 401, body: { error: "Invalid email or password" } };
	}

	const token = jwt.sign(
		{
			userId: user._id.toString(),
			username: user.username,
			email: user.email,
			userType: user.user_type,
			plants: user.plants,
		},
		JWT_SECRET,
		{ expiresIn: "7d" }
	);

	return { status: 200, body: { message: "Login successful", token } };
}

export { attemptLogin };
