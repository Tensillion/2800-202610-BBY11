import { useNavigate } from 'react-router-dom';
import type { SyntheticEvent } from 'react';

function SignUpPage() {
	const navigate = useNavigate();
	function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
		e.preventDefault();
		navigate('/pet');
	}

	return (
		<>
			<h1>Sign Up</h1>
			<form onSubmit={handleSubmit}>
				<input type="text" name="username" placeholder="Username" />
				<input type="email" name="email" placeholder="Email" />
				<input type="password" name="password" placeholder="Password" />
				<input type="submit" value="Submit" />
			</form>
		</>
	);
}
export default SignUpPage;
