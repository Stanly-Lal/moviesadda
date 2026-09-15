import React, { useEffect, useState } from "react";

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [message, setMessage] = useState("");
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("moviesaddaInstallDismissed");

    if (dismissed === "true") {
      return;
    }

    const standalone = window.matchMedia("(display-mode: standalone)").matches;

    const iosStandalone = window.navigator.standalone === true;

    if (standalone || iosStandalone) {
      setInstalled(true);
      return;
    }

    const userAgent =
      window.navigator.userAgent ||
      window.navigator.vendor ||
      window.opera ||
      "";

    const ios = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

    setIsIOS(ios);
  }, []);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();

      setDeferredPrompt(event);
      setShowBanner(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  useEffect(() => {
    function handleInstalled() {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      setMessage("");
    }

    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();

        const result = await deferredPrompt.userChoice;

        if (result.outcome === "accepted") {
          setMessage("MoviesAdda is being installed.");
        }

        setDeferredPrompt(null);
        setShowBanner(false);
      } catch (error) {
        console.error("PWA installation failed:", error);

        setMessage(
          "Installation could not be started. Please try again from your browser menu.",
        );
      }

      return;
    }

    if (isIOS) {
      setMessage(
        "In Safari, tap the Share button and choose “Add to Home Screen”.",
      );

      return;
    }

    setMessage(
      "App installation isn't available in this browser right now. You can still use MoviesAdda normally.",
    );
  }

  function handleDismiss() {
    setShowBanner(false);

    sessionStorage.setItem("moviesaddaInstallDismissed", "true");
  }

  if (installed) {
    return null;
  }

  if (message) {
    return (
      <section className="install-app-section">
        <div className="install-app-message">
          <div className="install-app-content">
            <div className="install-app-icon">▶</div>

            <div>
              <h3>MoviesAdda</h3>
              <p>{message}</p>
            </div>
          </div>

          <button
            type="button"
            className="install-app-close"
            onClick={() => setMessage("")}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </section>
    );
  }

  if (!showBanner) {
    return null;
  }

  return (
    <section className="install-app-section">
      <div className="install-app-banner">
        <div className="install-app-content">
          <div className="install-app-icon">▶</div>

          <div className="install-app-text">
            <h3>Get MoviesAdda as an app</h3>

            <p>Faster access and a better fullscreen experience.</p>
          </div>
        </div>

        <div className="install-app-actions">
          <button
            type="button"
            className="install-app-button"
            onClick={handleInstall}
          >
            Install App
          </button>

          <button
            type="button"
            className="install-app-close"
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
          >
            ×
          </button>
        </div>
      </div>
    </section>
  );
}
