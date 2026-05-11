const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to check if a user is authenticated
 *	Generated from Copilot, modified by Tyson Nguyen
 *
 * @author https://copilot.microsoft.com
 */
function authRequired(req, res, next) {
	const authHeader = req.headers.authorization; // "Bearer <token>"

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Missing or invalid Authorization header" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const payload = jwt.verify(token, JWT_SECRET);
		req.user = payload; // attach decoded token to request
		next();
	} catch (err) {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
}

module.exports = authRequired;
