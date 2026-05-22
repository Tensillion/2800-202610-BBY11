import Joi from "joi";

import { attemptSignUp } from "./signUpService.mjs";

function validateSignUpCredentials(body) {
	if (!body || typeof body !== "object") {
		return { error: "Request body must be a JSON object" };
	}

	const schema = Joi.object({
		username: Joi.string().alphanum().min(3).max(30).required(),
		email: Joi.string().email().required(),
		password: Joi.string().min(6).required(),
	});

	const { error } = schema.validate(body);
	if (error) {
		return { error: error.details[0].message };
	}

	return { username: body.username, email: body.email, password: body.password };
}

export async function signUpController(req, res) {
	const validationResult = validateSignUpCredentials(req.body);

	if (validationResult.error) {
		return res.status(400).json({ error: validationResult.error });
	}

	try {
		const { username, email, password } = validationResult;

		const result = await attemptSignUp(username, email, password);

		return res.status(result.status || 200).json(result.body || {});
	} catch (err) {
		console.error("Sign up error:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
}
