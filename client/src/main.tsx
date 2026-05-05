import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared_css/index.css";
import App from "./App/App.tsx";
import CameraPage from "./CameraPage/CameraPage.tsx";
import MapPage from "./MapPage/MapPage.tsx";
import PetPage from "./PetPage/PetPage.tsx";
import SigninPage from "./SigninPage/SigninPage.tsx";
import LoginPage from "./LoginPage/LoginPage.tsx";
import SettingsPage from "./SettingsPage/SettingsPage.tsx";
import CollectionPage from "./CollectionPage/CollectionPage.tsx";
import Footer from "./Footer/Footer.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <MapPage />
    <PetPage />
    <CollectionPage />
    <CameraPage />
    <SigninPage />
    <LoginPage />
    <SettingsPage />
    <Footer />
  </StrictMode>,
);
