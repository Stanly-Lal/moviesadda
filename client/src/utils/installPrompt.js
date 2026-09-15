let deferredInstallPrompt = null;

const listeners = new Set();

export function initializeInstallPrompt() {
  if (window.__moviesaddaInstallPromptInitialized) {
    return;
  }

  window.__moviesaddaInstallPromptInitialized = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();

    deferredInstallPrompt = event;

    listeners.forEach((listener) => {
      listener(event);
    });
  });
}

export function getInstallPrompt() {
  return deferredInstallPrompt;
}

export function subscribeToInstallPrompt(listener) {
  listeners.add(listener);

  // If the event already happened before the component
  // subscribed, immediately give it to the component.
  if (deferredInstallPrompt) {
    listener(deferredInstallPrompt);
  }

  return () => {
    listeners.delete(listener);
  };
}

export function clearInstallPrompt() {
  deferredInstallPrompt = null;
}
