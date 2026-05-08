<<<<<<< HEAD
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./css/index.css";
import LandingPage from "./LandingPage/LandingPage.tsx";
import Footer from "./Footer/Footer.tsx";
import CollectionPage from "./CollectionPage/CollectionPage.tsx";
import CameraPage from "./CameraPage/CameraPage.tsx";
import MapPage from "./MapPage/MapPage.tsx";
import ProfilePage from "./ProfilePage/ProfilePage.tsx";
import LoginPage from "./LoginPage/LoginPage.tsx";
import SignUpPage from "./SignUpPage/SignUpPage.tsx";
import PetPage from "./PetPage/PetPage.tsx";
import SettingsPage from "./SettingsPage/SettingsPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {/* //landing page doesn't have footer/ auth based rendering of footer */}
      <Footer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignUpPage />} />
        <Route path="/pet" element={<PetPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
=======
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
>>>>>>> 4734e9578a60c15e40b2c7b09d96764fc54ac709
);
