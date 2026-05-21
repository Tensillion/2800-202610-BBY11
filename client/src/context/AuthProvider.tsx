import { useEffect, useState } from "react";
import type { User } from "./AuthContext";
import { AuthContext } from "./AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Provider for managing authentication state
 *	Generated from Copilot, modified by Tyson Nguyen
 *
 * @author https://copilot.microsoft.com
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function validate() {
			if (!token) {
				setLoading(false);
				return;
			}

			try {
				//CHANGE URL FOR PRODUCTION
				const res = await fetch(`${BACKEND_URL}/authentication/status`, {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (!res.ok) {
					logout();
					setLoading(false);
					return;
				}

				const data = await res.json();
				setUser(data.user);
			} catch {
				logout();
				setLoading(false);
				return;
			}

			setLoading(false);
		}

		validate();
	}, [token]);

	function login(nextToken: string) {
		localStorage.setItem("token", nextToken);
		setToken(nextToken);
	}

	function logout() {
		localStorage.removeItem("token");
		sessionStorage.clear();
		setToken(null);
		setUser(null);
	}

	return (
		<AuthContext.Provider value={{ user, token, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
