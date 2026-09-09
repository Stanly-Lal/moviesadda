import React, { useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();

  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);

  const from = location.state?.from || "/";

  async function submit(e) {
    e.preventDefault();

    setBusy(true);
    setError("");

    try {
      await loginUser(email, password);

      nav(from, {
        replace: true,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />

      <main className="auth-page">
        <form className="auth-card" onSubmit={submit}>
          <p className="eyebrow">MoviesAdda</p>

          <h1>Welcome User !</h1>

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
              minLength={10}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button className="primary" disabled={busy} type="submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link
              to="/register"
              state={{
                from,
              }}
            >
              Create one
            </Link>
          </p>
        </form>
      </main>
    </>
  );
}
