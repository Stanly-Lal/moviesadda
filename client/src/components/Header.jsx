import React, { useRef } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { FaUser, FaStar } from "react-icons/fa";

import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import Search from "./Search";

import { useAuth } from "../context/AuthContext";

export default function Header({ search, setSearch }) {
  const { pathname } = useLocation();

  const navigate = useNavigate();

  const { user } = useAuth();

  // ========================================
  // SECRET ADMIN SEQUENCE
  // ========================================

  const stage = useRef(0);
  const clickCount = useRef(0);
  const pauseStartedAt = useRef(null);

  const firstTimer = useRef(null);

  const pauseTimer = useRef(null);

  const finalTimer = useRef(null);

  const resetSequence = () => {
    stage.current = 0;
    clickCount.current = 0;
    pauseStartedAt.current = null;

    clearTimeout(firstTimer.current);

    clearTimeout(pauseTimer.current);

    clearTimeout(finalTimer.current);
  };

  const handleLogoClick = () => {
    // -------------------------------
    // FIRST STAGE: 9 CLICKS
    // -------------------------------

    if (stage.current === 0) {
      clickCount.current += 1;

      navigate("/");

      clearTimeout(firstTimer.current);

      firstTimer.current = setTimeout(() => {
        resetSequence();
      }, 3000);

      if (clickCount.current === 9) {
        stage.current = 1;
        clickCount.current = 0;

        pauseStartedAt.current = Date.now();

        clearTimeout(firstTimer.current);

        pauseTimer.current = setTimeout(() => {
          resetSequence();
        }, 9000);
      }

      return;
    }

    // -------------------------------
    // PAUSE STAGE: 4–9 SECONDS
    // -------------------------------

    if (stage.current === 1) {
      const elapsed = Date.now() - pauseStartedAt.current;

      if (elapsed < 4000) {
        resetSequence();
        navigate("/");
        return;
      }

      if (elapsed > 9000) {
        resetSequence();
        navigate("/");
        return;
      }

      stage.current = 2;
      clickCount.current = 1;

      clearTimeout(pauseTimer.current);

      finalTimer.current = setTimeout(() => {
        resetSequence();
      }, 5000);

      navigate("/");
      return;
    }

    // -------------------------------
    // FINAL STAGE: 4 CLICKS
    // -------------------------------

    if (stage.current === 2) {
      clickCount.current += 1;

      clearTimeout(finalTimer.current);

      if (clickCount.current === 4) {
        resetSequence();

        navigate("/admin/login/09");

        return;
      }

      finalTimer.current = setTimeout(() => {
        resetSequence();
      }, 5000);

      navigate("/");
    }
  };

  // ========================================
  // USER ICON
  // ========================================

  function handleUserClick() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "admin") {
      navigate("/admin");
      return;
    }

    navigate("/account");
  }

  const avatarInitial = user?.firstName?.charAt(0)?.toUpperCase();

  return (
    <header>
      <div className="nav">
        {/* LOGO */}

        <div
          className="logo-link"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleLogoClick();
            }
          }}
        >
          <Logo />
        </div>

        {/* DESKTOP SEARCH */}

        <div
          className={`desktop-search ${
            pathname === "/" 
              ? ""
              : "headerHidden"
          }`}
        >
          <Search value={search} onChange={setSearch} />
        </div>

        {/* ACTIONS */}

        <div className="actions">
          <ThemeToggle />
          <button
            type="button"
            className={user ? "user-btn user-avatar" : "user-btn"}
            onClick={handleUserClick}
            aria-label={user ? "Open account" : "Login or register"}
            style={
              user
                ? {
                    background: user.avatarColor || "var(--accent)",
                  }
                : undefined
            }
          >
            {user ? (
              user.role === "admin" ? (
                <FaStar style={{ color: "#ffc800" }} />
              ) : (
                avatarInitial || "?"
              )
            ) : (
              <FaUser />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH */}

      <div
        className={
          pathname === "/"
            ? "mobile-search"
            : "headerHidden"
        }
      >
        <Search value={search} onChange={setSearch} />
      </div>
    </header>
  );
}
