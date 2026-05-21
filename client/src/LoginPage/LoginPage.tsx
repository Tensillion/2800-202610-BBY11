import { Link, useNavigate } from "react-router-dom";
import type { SyntheticEvent } from "react";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "../css/auth.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Authentication page for users to log in to their account
 *
 * @returns React component Log-in page
 *
 * @author Tyson Nguyen
 */
function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login } = useContext(AuthContext);

	const navigate = useNavigate();
	async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
		e.preventDefault();

		//CHANGE URL FOR PRODUCTION
		const response = await fetch(`${BACKEND_URL}/authentication/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const data = await response.json();
		console.log(data);

		if (response.ok) {
			login(data.token);
			navigate("/pet");
		} else {
			alert(`Login failed: ${data.message}`);
		}
	}

	return (
		<section id="login-page">
			<div className="authentication-header">
				<img className="logo" src="/Logo.png" alt="Logo" />
				<Link className="nav-link" to="/signup">
					<button className="other-page-btn">Sign up</button>
				</Link>
			</div>
			<div className="authentication-container">
				<h1>Log In</h1>
				<form className="auth-form" onSubmit={handleSubmit}>
					<input
						className="auth-input"
						type="email"
						name="email"
						placeholder="Email"
						value={email}
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
					/>
					<input className="auth-submit-btn" type="submit" value="Continue" />
				</form>
				<p className="sub-text">
					<a href="/resetPassword">Forgot Password? </a>.
				</p>
			</div>
		</section>
	);
}
export default LoginPage;
