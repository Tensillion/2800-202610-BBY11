import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./css/index.css";
import LandingPage from "./LandingPage/LandingPage.tsx";
import CollectionPage from "./CollectionPage/CollectionPage.tsx";
import CameraPage from "./CameraPage/CameraPage.tsx";
import MapPage from "./MapPage/MapPage.tsx";
import ProfilePage from "./ProfilePage/ProfilePage.tsx";
import LoginPage from "./LoginPage/LoginPage.tsx";
import SignUpPage from "./SignUpPage/SignUpPage.tsx";
import PetPage from "./PetPage/PetPage.tsx";
import SettingsPage from "./SettingsPage/SettingsPage.tsx";
import ItemPage from "./ItemPage/ItemPage.tsx";
import CameraResultPage from "./CameraPage/ResultPage/CameraResultPage.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			{/* //landing page doesn't have footer/ auth based rendering of footer */}
			<Routes>
				{/* Landing page */}
				<Route path="/" element={<LandingPage />} />

				{/* Auth based pages */}
				<Route path="/signup" element={<SignUpPage />} />
				<Route path="/login" element={<LoginPage />} />

				{/* Main app pages */}
				<Route path="/pet" element={<PetPage />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/map" element={<MapPage />} />
				<Route path="/collection" element={<CollectionPage />} />
				<Route path="/camera">
					<Route index element={<CameraPage />} />
					<Route path="result" element={<CameraResultPage />} />
				</Route>

				<Route path="/settings" element={<SettingsPage />} />
				<Route path="/item" element={<ItemPage />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>
);
