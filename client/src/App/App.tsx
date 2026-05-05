import { Routes, Route } from "react-router-dom";

import LandingPage from "../LandingPage/LandingPage";
import CameraPage from "../CameraPage/CameraPage";
import MapPage from "../MapPage/MapPage";
import PetPage from "../PetPage/PetPage";
import SigninPage from "../SigninPage/SigninPage";
import LoginPage from "../LoginPage/LoginPage";
import SettingsPage from "../SettingsPage/SettingsPage";
import CollectionPage from "../CollectionPage/CollectionPage";
import Footer from "../Footer/Footer";

export default function App() {
	return (
		<>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/map" element={<MapPage />} />
				<Route path="/camera" element={<CameraPage />} />
				<Route path="/pet" element={<PetPage />} />
				<Route path="/collection" element={<CollectionPage />} />
				<Route path="/signin" element={<SigninPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/settings" element={<SettingsPage />} />
			</Routes>

			<Footer />
		</>
	);
}
