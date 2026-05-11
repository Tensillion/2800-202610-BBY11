import Footer from "../Footer/Footer";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 *A profile page that shows the user's profile information.
 *
 * @returns a profile page react component.
 *
 * @author Tyson Nguyen
 */
export default function ProfilePage() {
	const { logout } = useContext(AuthContext);
	const navigate = useNavigate();

	function handleLogout() {
		logout();
		navigate("/login");
	}

	return (
		<>
			<div>PROFILE PAGE</div>
			<button onClick={handleLogout}>Logout</button>
			<Footer />
		</>
	);
}
