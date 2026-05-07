import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import LandingPage from './LandingPage/LandingPage';
import SigninPage from './SigninPage/SigninPage';
import LoginPage from './LoginPage/LoginPage';
import MapPage from './MapPage/MapPage';

import CameraPage from './CameraPage/CameraPage';
import CameraResultPage from './CameraPage/ResultPage/CameraResultPage';

import PetPage from './PetPage/PetPage';
import CollectionPage from './CollectionPage/CollectionPage';
import ProfilePage from './ProfilePage/ProfilePage';
import SettingsPage from './SettingsPage/SettingsPage';

import './css/index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />

				{/* Authentication Routes */}
				<Route path="/signin" element={<SigninPage />} />
				<Route path="/login" element={<LoginPage />} />

				{/* Main App Routes */}
				<Route path="/map" element={<MapPage />} />
				<Route path="/camera">
					<Route index element={<CameraPage />} />
					<Route path="result" element={<CameraResultPage />} />
				</Route>
				<Route path="/pet" element={<PetPage />} />
				<Route path="/collection" element={<CollectionPage />} />
				<Route path="/profile" element={<ProfilePage />} />

				{/* Settings Route */}
				<Route path="/settings" element={<SettingsPage />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>
);
