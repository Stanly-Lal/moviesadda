// import React, { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import App from "./App";
// import "./styles/global.css";
// import { initializeInstallPrompt } from "./utils/installPrompt";

// // Initialize the PWA install prompt BEFORE React starts.
// initializeInstallPrompt();

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </StrictMode>,
// );

import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
import { initializeInstallPrompt } from "./utils/installPrompt";

// ==========================================================
// INITIALIZE PWA INSTALL PROMPT
// ==========================================================

initializeInstallPrompt();

// ==========================================================
// DETECT INSTALLED PWA
// ==========================================================

const isInstalledPWA =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

// ==========================================================
// PWA-ONLY ZOOM PREVENTION
// ==========================================================

if (isInstalledPWA) {
  // --------------------------------------------------------
  // Disable browser viewport zoom
  // --------------------------------------------------------

  const viewport = document.querySelector('meta[name="viewport"]');

  if (viewport) {
    viewport.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
    );
  }

  // --------------------------------------------------------
  // Prevent pinch-to-zoom
  // --------------------------------------------------------

  document.addEventListener(
    "touchmove",
    (event) => {
      // Two or more fingers = pinch gesture
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    },
    {
      passive: false,
    },
  );

  // --------------------------------------------------------
  // Prevent double-tap zoom
  // --------------------------------------------------------

  let lastTouchEnd = 0;

  document.addEventListener(
    "touchend",
    (event) => {
      const now = Date.now();

      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }

      lastTouchEnd = now;
    },
    {
      passive: false,
    },
  );
}

// ==========================================================
// START REACT
// ==========================================================

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
