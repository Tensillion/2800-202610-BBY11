import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Only renders children if user is authenticated,
 *  otherwise redirects to login
 *
 * @param children The component(s) to render if authenticated
 * @returns The children if authenticated, otherwise a redirect to login
 *
 * @author Tyson Nguyen
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { token, loading } = useContext(AuthContext);

	if (loading) return null;

	if (!token) return <Navigate to="/login" replace />;

	return children;
}
