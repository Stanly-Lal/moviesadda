import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
const C = createContext();
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("moviesadda-theme") || "dark",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("moviesadda-theme", theme);
  }, [theme]);
  return (
    <C.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </C.Provider>
  );
}
export const useTheme = () => useContext(C);
