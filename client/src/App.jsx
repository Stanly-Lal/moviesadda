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

import ProtectedRoute from "./components/ProtectedRoute";
import TempVideo from "./pages/TempVideo";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* PUBLIC */}

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          {/* ADMIN */}

          <Route path="/admin/login/09" element={<AdminLogin />} />

          <Route path="/admin" element={<Admin />} />

          {/* PROTECTED USER AREA */}

          <Route element={<ProtectedRoute />}>
            <Route path="/movie/:id" element={<Movie />} />

            <Route path="/account" element={<Account />} />
            <Route path="/temp" element={<TempVideo />} />
          </Route>

          {/* FALLBACK */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
