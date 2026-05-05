import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared_css/index.css";
import App from "./App/App.tsx";
import CameraPage from "./CameraPage/CameraPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <CameraPage />
  </StrictMode>,
);
