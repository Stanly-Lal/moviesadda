import React, { useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",

  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
  "Foreign User",
];

export default function Register() {
  const nav = useNavigate();
  const location = useLocation();

  const { registerUser } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    state: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);

  const from = location.state?.from || "/";

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();

    setBusy(true);
    setError("");

    try {
      await registerUser(form);

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
        <form className="auth-card register-card" onSubmit={submit}>
          <p className="eyebrow">MoviesAdda</p>

          <h1>Create account</h1>

          {error && <div className="notice error">{error}</div>}

          <div className="name-fields">
            <input
              required
              maxLength={50}
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />

            <input
              maxLength={50}
              placeholder="Last name (optional)"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </div>

          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={10}
              placeholder="Password (min 10 characters)"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
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

          <select
            required
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
          >
            <option value="">Select your state</option>

            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <button className="primary" disabled={busy} type="submit">
            {busy ? "Creating account…" : "Create account"}
          </button>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" state={{ from }}>
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </>
  );
}
