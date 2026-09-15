import React, { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./styles/global.css";

import { initializeInstallPrompt } from "./utils/installPrompt";

// Initialize the PWA install prompt BEFORE React starts.
initializeInstallPrompt();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
