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
import SettingsPage from "./SettingsPage/SettingsPage.tsx";
import CameraResultPage from "./CameraPage/ResultPage/CameraResultPage.tsx";
import PlantPage from "./PlantPage/PlantPage.tsx";
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
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
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
  </StrictMode>,
);
