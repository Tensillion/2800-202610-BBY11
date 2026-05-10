import { Link, useNavigate } from "react-router-dom";
import type { SyntheticEvent } from "react";
import "../css/auth.css";

function LoginPage() {
	const navigate = useNavigate();
	function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
		e.preventDefault();
		navigate("/pet");
	}

	return (
		<>
			<div className="authentication-header">
				<img className="logo" src="../public/Logo.png" alt="Logo" />
				<Link className="nav-link" to="/signup">
					<button className="other-page-btn">Sign up</button>
				</Link>
			</div>
			<div className="authentication-container">
				<h1>Log In</h1>
				<form className="auth-form" onSubmit={handleSubmit}>
					<input className="auth-input" type="email" name="email" placeholder="Email" />
					<input className="auth-input" type="password" name="password" placeholder="Password" />
					<input className="auth-submit-btn" type="submit" value="Continue" />
				</form>
				<p className="sub-text">
					<a href="/resetPassword">Forgot Password? </a>.
				</p>
			</div>
		</>
	);
}
export default LoginPage;
