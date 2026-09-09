import React from "react";

import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const nav = useNavigate();

  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  async function handleLogout() {
    nav("/", {
      replace: true,
    });

    await logout();
  }

  const initial =
    user.firstName?.charAt(0)?.toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "?";

  return (
    <>
      <Header />

      <main className="auth-page">
        <section className="account-card">
          <div
            className="account-avatar"
            style={{
              background: user.avatarColor || "var(--accent)",
            }}
          >
            {initial}
          </div>

          <p className="eyebrow">My account</p>

          <h1>
            {user.firstName} {user.lastName}
          </h1>

          <div className="account-details">
            <div>
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>

            <div>
              <span>State</span>
              <strong>{user.state}</strong>
            </div>
          </div>

          <button className="primary" onClick={handleLogout}>
            Logout
          </button>
        </section>
      </main>
    </>
  );
}
