import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../services/api";
import Header from "../components/Header.jsx";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const nav = useNavigate();
  const { refreshUser } = useAuth();

  async function submit(e) {
    e.preventDefault();

    setBusy(true);
    setError("");

    try {
      await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Update AuthContext immediately after admin login
      await refreshUser();

      nav("/admin");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="head">
      <Header />

      <main className="auth-page">
        <form className="auth-card" onSubmit={submit}>
          <p className="eyebrow">Secure access</p>

          <h1>Admin Login</h1>

          {error && <div className="notice error">{error}</div>}

          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength="10"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button className="primary" disabled={busy} type="submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    </div>
  );
}
