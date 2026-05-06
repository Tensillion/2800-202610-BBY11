import { Routes, Route } from "react-router-dom";

import LandingPage from "../LandingPage/LandingPage";
import CameraPage from "../CameraPage/CameraPage";
import MapPage from "../MapPage/MapPage";
import PetPage from "../PetPage/PetPage";
import SigninPage from "../SigninPage/SigninPage";
import LoginPage from "../LoginPage/LoginPage";
import ProfilePage from "../ProfilePage/ProfilePage";
import SettingsPage from "../SettingsPage/SettingsPage";
import CollectionPage from "../CollectionPage/CollectionPage";

/**
 * Put all the pages in the app here, and then use <Route> to link them together.
 *
 * @returns The app
 */
export default function App() {
	return (
		<>
			<Routes>
				<Route path="/" element={<LandingPage />} />

				{/* Authentication Routes */}
				<Route path="/signin" element={<SigninPage />} />
				<Route path="/login" element={<LoginPage />} />

				{/* Main App Routes */}
				<Route path="/map" element={<MapPage />} />
				<Route path="/camera" element={<CameraPage />} />
				<Route path="/pet" element={<PetPage />} />
				<Route path="/collection" element={<CollectionPage />} />
				<Route path="/profile" element={<ProfilePage />} />

				{/* Settings Route */}
				<Route path="/settings" element={<SettingsPage />} />
			</Routes>
		</>
	);
}
