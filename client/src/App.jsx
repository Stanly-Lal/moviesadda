import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Movie from "./pages/Movie";
import MoviePlayer from "./pages/MoviePlayer";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* ==================================================
              PUBLIC
              ================================================== */}

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          {/* ==================================================
              ADMIN
              ================================================== */}

          <Route path="/admin/login/09" element={<AdminLogin />} />

          <Route path="/admin" element={<Admin />} />

          {/* ==================================================
              PROTECTED USER AREA
              ================================================== */}

          <Route element={<ProtectedRoute />}>
            <Route path="/movie/:id" element={<Movie />} />

            <Route path="/movieplayer/:id" element={<MoviePlayer />} />

            <Route path="/account" element={<Account />} />
          </Route>

          {/* ==================================================
              FALLBACK
              ================================================== */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
