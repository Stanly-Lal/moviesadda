import React, { useEffect, useRef, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { request } from "../services/api";

export default function Movie() {
  const { id } = useParams();

  const nav = useNavigate();

  const [movie, setMovie] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // DOWNLOAD TOAST
  // ==========================================================

  const [downloadMessage, setDownloadMessage] = useState("");

  const downloadTimer = useRef(null);

  // ==========================================================
  // LOAD MOVIE
  // ==========================================================

  useEffect(() => {
    let live = true;

    request(`/api/videos/${id}`)
      .then((data) => {
        if (live) {
          setMovie(data);
        }
      })
      .catch((e) => {
        if (live) {
          if (e.message === "Authentication required") {
            nav("/login", {
              replace: true,

              state: {
                from: `/movie/${id}`,
              },
            });
          } else {
            setError(e.message);
          }
        }
      })
      .finally(() => {
        if (live) {
          setLoading(false);
        }
      });

    return () => {
      live = false;
    };
  }, [id, nav]);

  // ==========================================================
  // CLEANUP TOAST TIMER
  // ==========================================================

  useEffect(() => {
    return () => {
      clearTimeout(downloadTimer.current);
    };
  }, []);

  // ==========================================================
  // DOWNLOAD MOVIE
  // ==========================================================

  function handleDownload() {
    if (!movie?.videoUrl) {
      return;
    }

    setDownloadMessage("Download started...");

    clearTimeout(downloadTimer.current);

    downloadTimer.current = setTimeout(() => {
      setDownloadMessage("");
    }, 3500);

    // ========================================================
    // TRIGGER EXTERNAL DOWNLOAD
    //
    // Hidden iframe keeps the current Movie page open.
    // The external server should return the file as:
    // Content-Disposition: attachment
    // ========================================================

    const iframe = document.createElement("iframe");

    iframe.style.display = "none";

    iframe.src = movie.videoUrl;

    document.body.appendChild(iframe);

    setTimeout(() => {
      iframe.remove();
    }, 30000);
  }

  return (
    <>
      <Header />

      {/* =====================================================
          DOWNLOAD TOAST
      ===================================================== */}

      {downloadMessage && (
        <div className="toast toast-success">
          <span>✓</span>

          <p>{downloadMessage}</p>

          <button
            type="button"
            onClick={() => setDownloadMessage("")}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <main className="movie-page container">
        {/* LOADING */}

        {loading && <div className="empty">Loading movie…</div>}

        {/* ERROR */}

        {error && <div className="notice error">{error}</div>}

        {/* MOVIE */}

        {movie && (
          <article className="movie-card">
            <div className="movie-poster">
              <img src={movie.posterUrl} alt={`${movie.title} poster`} />
            </div>

            <div className="movie-info">
              <p className="eyebrow">MoviesAdda</p>

              <h1>{movie.title}</h1>

              <p className="movie-date">
                Added{" "}
                {new Date(movie.createdAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <div className="movie-actions">
                {/* =================================================
                    DOWNLOAD MOVIE
                ================================================= */}

                {movie.downloadOnly ? (
                  <button
                    type="button"
                    className="primary movie-watch"
                    onClick={handleDownload}
                  >
                    ↓ Download Movie
                  </button>
                ) : (
                  /* ===============================================
                     NORMAL WATCH MOVIE
                  =============================================== */

                  <a
                    className="primary movie-watch"
                    href={movie.videoUrl}
                    rel="noopener noreferrer"
                  >
                    ▶ Watch Movie
                  </a>
                )}

                <Link className="movie-back" to="/">
                  ← Back to Movies
                </Link>
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </>
  );
}
