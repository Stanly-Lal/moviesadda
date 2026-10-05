import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import "../styles/global.css";

import { request } from "../services/api";

export default function MoviePlayer() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [movie, setMovie] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD MOVIE
  // ==========================================================

  useEffect(() => {
    let live = true;

    setLoading(true);
    setError("");

    request(`/api/videos/${id}`)
      .then((data) => {
        if (live) {
          setMovie(data);
        }
      })
      .catch((e) => {
        if (!live) {
          return;
        }

        if (e.message === "Authentication required") {
          navigate("/login", {
            replace: true,
            state: {
              from: `/movieplayer/${id}`,
            },
          });

          return;
        }

        setError(e.message);
      })
      .finally(() => {
        if (live) {
          setLoading(false);
        }
      });

    return () => {
      live = false;
    };
  }, [id, navigate]);

  // ==========================================================
  // LOADING / ERROR
  // ==========================================================

  if (loading) {
    return (
      <div className="movie-player-page">
        <button
          type="button"
          className="player-back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ←
        </button>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-player-page">
        <button
          type="button"
          className="player-back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ←
        </button>

        <div className="player-error">{error || "Video not found"}</div>
      </div>
    );
  }

  // ==========================================================
  // PLAYER SETTINGS
  // ==========================================================

  const sandboxEnabled = movie.sandboxEnabled === true;

  const orientationLock = movie.orientationLock === true;

  // ==========================================================
  // REFERRER POLICY
  //
  // Existing videos without this field automatically use
  // no-referrer.
  // ==========================================================

  const referrerPolicy =
    movie.referrerPolicy === "strict-origin-when-cross-origin"
      ? "strict-origin-when-cross-origin"
      : "no-referrer";

  // ==========================================================
  // IFRAME ALLOW ATTRIBUTE
  // ==========================================================

  const allowAttribute = [
    "fullscreen",
    "autoplay",
    "encrypted-media",
    "picture-in-picture",
    ...(orientationLock ? ["orientation-lock"] : []),
  ].join("; ");

  // ==========================================================
  // SANDBOX
  // ==========================================================

  const sandboxAttribute = sandboxEnabled
    ? "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
    : undefined;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="movie-player-page">
      <button
        type="button"
        className="player-back-button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        ←
      </button>

      <iframe
        src={movie.videoUrl}
        title={movie.title || "Movie Player"}
        className="movie-player-iframe"
        frameBorder="0"
        allowFullScreen
        allow={allowAttribute}
        referrerPolicy={referrerPolicy}
        sandbox={sandboxAttribute}
      />
    </div>
  );
}
