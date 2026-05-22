import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./css/index.css";
import Footer from "./Footer/Footer.tsx";
import LandingPage from "./LandingPage/LandingPage.tsx";
import CataloguePage from "./CataloguePage/CataloguePage/CataloguePage.tsx";
import CameraPage from "./CameraPage/CameraPage.tsx";
import MapPage from "./MapPage/MapPage.tsx";
import ProfilePage from "./ProfilePage/ProfilePage.tsx";
import LoginPage from "./LoginPage/LoginPage.tsx";
import SignUpPage from "./SignUpPage/SignUpPage.tsx";
import PetPage from "./PetPage/PetPage.tsx";
import CameraResultPage from "./CameraPage/ResultPage/CameraResultPage.tsx";
import PlantPage from "./PlantPage/PlantPage.tsx";
import GuestRoute from "./components/GuestRoute.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

import { AuthProvider } from "./context/AuthProvider.tsx";

document.documentElement.dataset.theme =
	localStorage.getItem("profileDarkMode") === "true" ? "dark" : "light";

/**
 * This is the main entry point of the application. It sets up the routing and renders the appropriate pages based on the URL and authentication state.
 * - The `AuthProvider` component provides authentication context to the entire app.
 * - `GuestRoute` and `ProtectedRoute` components are used to restrict access to certain routes based on whether the user is authenticated.
 * - Each route renders a specific page component, and the `Footer` is included on protected pages for consistent navigation.
 */
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					{/* Guest-only */}
					<Route
						path="/"
						element={
							<GuestRoute>
								<LandingPage />
							</GuestRoute>
						}
					/>

					<Route
						path="/signup"
						element={
							<GuestRoute>
								<SignUpPage />
							</GuestRoute>
						}
					/>
					<Route
						path="/login"
						element={
							<GuestRoute>
								<LoginPage />
							</GuestRoute>
						}
					/>

					{/* Protected */}

					<Route
						path="/profile"
						element={
							<ProtectedRoute>
								<ProfilePage />
								<Footer />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/map"
						element={
							<ProtectedRoute>
								<MapPage />
								<Footer />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/pet"
						element={
							<ProtectedRoute>
								<PetPage />
								<Footer />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/catalogue"
						element={
							<ProtectedRoute>
								<CataloguePage />
								<Footer />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/plants/:id"
						element={
							<ProtectedRoute>
								<PlantPage />
								<Footer />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/camera"
						element={
							<ProtectedRoute>
								<CameraPage />
								<Footer />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/camera/result"
						element={
							<ProtectedRoute>
								<CameraResultPage />
								<Footer />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	</StrictMode>
);
