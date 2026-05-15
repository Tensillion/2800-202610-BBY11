import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./css/index.css";
import LandingPage from "./LandingPage/LandingPage.tsx";
import CollectionPage from "./CollectionPage/CollectionPage/CollectionPage.tsx";
import CameraPage from "./CameraPage/CameraPage.tsx";
import MapPage from "./MapPage/MapPage.tsx";
import ProfilePage from "./ProfilePage/ProfilePage.tsx";
import LoginPage from "./LoginPage/LoginPage.tsx";
import SignUpPage from "./SignUpPage/SignUpPage.tsx";
import PetPage from "./PetPage/PetPage.tsx";
import SettingsPage from "./SettingsPage/SettingsPage.tsx";
import ItemPage from "./ItemPage/ItemPage.tsx";
import CameraResultPage from "./CameraPage/ResultPage/CameraResultPage.tsx";

import GuestRoute from "./components/GuestRoute.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

import { AuthProvider } from "./context/AuthProvider.tsx";

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
							</ProtectedRoute>
						}
					/>
					<Route
						path="/map"
						element={
							<ProtectedRoute>
								<MapPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/pet"
						element={
							<ProtectedRoute>
								<PetPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/collection"
						element={
							<ProtectedRoute>
								<CollectionPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/settings"
						element={
							<ProtectedRoute>
								<SettingsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/item"
						element={
							<ProtectedRoute>
								<ItemPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/camera"
						element={
							<ProtectedRoute>
								<CameraPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/camera/result"
						element={
							<ProtectedRoute>
								<CameraResultPage />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	</StrictMode>
);
