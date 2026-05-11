import { createContext } from "react";

/**
 * Context for managing authentication state, including user information, token, loading state, and logout function.
 *	Generated from Copilot, modified by Tyson Nguyen
 *
 * @author https://copilot.microsoft.com
 */

/**
 * Interface for the user object
 */
export interface User {
	username: string;
	email: string;
	userType: string;
}

/**
 * Interface for the authentication context type
 */
interface AuthContextType {
	user: User | null;
	token: string | null;
	loading: boolean;
	login: (token: string) => void;
	logout: () => void;
}

/**
 * Context for managing authentication state
 */
export const AuthContext = createContext<AuthContextType>({
	user: null,
	token: null,
	loading: true,
	login: () => {},
	logout: () => {},
});
