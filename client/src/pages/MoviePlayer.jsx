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
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="player-error">
        <h2>Loading movie…</h2>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="player-error">
        <h2>Unable to load movie</h2>

        <p>{error}</p>

        <button type="button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  // ==========================================================
  // MOVIE NOT FOUND
  // ==========================================================

  if (!movie) {
    return (
      <div className="player-error">
        <h2>Movie not found</h2>

        <button type="button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  // ==========================================================
  // VIDEO URL CHECK
  // ==========================================================

  if (!movie.videoUrl) {
    return (
      <div className="player-error">
        <h2>Video not available</h2>

        <button type="button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  // ==========================================================
  // PLAYER
  // ==========================================================

  return (
    <div className="movie-player-page">
      {/* =====================================================
          BACK BUTTON
          ===================================================== */}

      <button
        type="button"
        className="player-back-button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        ←
      </button>

      {/* =====================================================
          VIDEO IFRAME
          ===================================================== */}

      <iframe
        src={movie.videoUrl}
        title={movie.title || "Movie Player"}
        className="movie-player-iframe"
        frameBorder="0"
        allowFullScreen
        allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
      />
    </div>
  );
}
