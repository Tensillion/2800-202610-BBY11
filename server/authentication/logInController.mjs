import Joi from "joi";

import { attemptLogin } from "./logInService.mjs";

/**
 * Validates the login credentials provided in the request body
 * @param {*} body passed in request body, should contain email and password fields
 *
 * @returns the validated email and password if valid, otherwise an error message
 *
 * @author Tyson Nguyen
 */
function validateLogInCredentials(body) {
	if (!body || typeof body !== "object") {
		return { error: "Request body must be a JSON object" };
	}

	const schema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(6).required(),
	});

	const { error } = schema.validate(body);
	if (error) {
		return { error: error.details[0].message };
	}

	return { email: body.email, password: body.password };
}

/**
 * Handles the login request, validating the credentials and attempting to log in the user
 *
 * @param {*} req the request object containing the login credentials in the body
 * @param {*} res the response object used to send back the result of the login attempt
 *
 * @returns response with status 200 and user data if login is successful, otherwise an error message with appropriate status code
 *
 * @author Tyson Nguyen
 */
export async function logInController(req, res) {
	const validationResult = validateLogInCredentials(req.body);

	if (validationResult.error) {
		return res.status(400).json({ error: validationResult.error });
	}

	try {
		const { email, password } = validationResult;
		const result = await attemptLogin(email, password);
		return res.status(result.status || 200).json(result.body || {});
	} catch (err) {
		console.error("Login error:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
}
