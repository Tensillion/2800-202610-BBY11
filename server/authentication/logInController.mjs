import Joi from "joi";

import { attemptLogin } from "./logInService.mjs";

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
