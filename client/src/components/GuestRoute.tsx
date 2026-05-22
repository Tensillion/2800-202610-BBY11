import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Only renders children if user is not authenticated,
 *  otherwise redirects to the pet page
 *
 * @param children The component(s) to render if not authenticated
 *
 * @returns The children if not authenticated, otherwise a redirect to the pet page
 *
 * @author Tyson Nguyen
 */
export default function GuestRoute({ children }: { children: React.ReactNode }) {
	const { token, loading } = useContext(AuthContext);

	if (loading) return null;

	if (token) return <Navigate to="/pet" replace />;

	return children;
}
