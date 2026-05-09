import { Link, useNavigate } from "react-router-dom";
import type { SyntheticEvent } from "react";
import "../css/auth.css";

function SignUpPage() {
	const navigate = useNavigate();
	function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
		e.preventDefault();
		navigate("/pet");
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
					<input className="auth-input" type="text" name="username" placeholder="Username" />
					<input className="auth-input" type="email" name="email" placeholder="Email" />
					<input className="auth-input" type="password" name="password" placeholder="Password" />
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
