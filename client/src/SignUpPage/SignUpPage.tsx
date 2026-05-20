import { Link, useNavigate } from "react-router-dom";
import type { SyntheticEvent } from "react";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "../css/auth.css";

const BACKEND_URL = "http://localhost:3000";

/**
 * Authentication page for users to sign up for a new account
 *
 * @returns React component Sign-up page
 *
 * @author Tyson Nguyen
 */
function SignUpPage() {
	const navigate = useNavigate();
	const { login } = useContext(AuthContext);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
		e.preventDefault();

		//CHANGE URL FOR PRODUCTION
		const response = await fetch(`${BACKEND_URL}/authentication/signup`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, email, password }),
		});

		const data = await response.json();
		console.log(data);

		if (response.ok) {
			login(data.token);
			navigate("/pet");
		} else {
			alert(`Sign up failed: ${data.message}`);
		}
	}

	return (
		<>
			<div className="authentication-header">
				<img className="logo" src="../public/Logo.png" alt="Logo" />
				<Link className="nav-link" to="/login">
					<button className="other-page-btn">Log in</button>
				</Link>
			</div>
			<div className="authentication-container">
				<h1>Sign Up</h1>
				<form className="auth-form" onSubmit={handleSubmit}>
					<input
						className="auth-input"
						type="text"
						name="username"
						value={username}
						placeholder="Username"
						onChange={e => setUsername(e.target.value)}
						required
						minLength={3}
						maxLength={20}
						pattern="^[a-zA-Z0-9_]+$"
						title="Username must be 3-20 characters long and can only contain letters, numbers, and underscores."
					/>
					<input
						className="auth-input"
						type="email"
						name="email"
						value={email}
						placeholder="Email"
						onChange={e => setEmail(e.target.value)}
						required
					/>
					<input
						className="auth-input"
						type="password"
						name="password"
						placeholder="Password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
						minLength={6}
						title="Password must be at least 6 characters long."
					/>
					<input className="auth-submit-btn" type="submit" value="Submit" />
				</form>
				<p className="sub-text">
					By signing up, you agree to our <a href="/terms">Terms</a> and{" "}
					<a href="/privacy">Privacy Policy</a>.
				</p>
			</div>
		</>
	);
}
export default SignUpPage;
