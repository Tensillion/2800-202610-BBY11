const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to block access if a user is already authenticated
 *	Generated from Copilot, modified by Tyson Nguyen
 *
 * @author https://copilot.microsoft.com
 */
function blockIfAuthenticated(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return next();
	}

	const token = authHeader.split(" ")[1];

	try {
		jwt.verify(token, JWT_SECRET);
		return res.status(400).json({ error: "You are already logged in" });
	} catch {
		return next();
	}
}

module.exports = blockIfAuthenticated;
