import React, { useEffect, useRef, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { request } from "../services/api";

import { GiPlayButton } from "react-icons/gi";
import { FaDownload } from "react-icons/fa";

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
        if (!live) {
          return;
        }

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
  // SHOW DOWNLOAD TOAST
  // ==========================================================

  function showDownloadMessage(message) {
    setDownloadMessage(message);

    clearTimeout(downloadTimer.current);

    downloadTimer.current = setTimeout(() => {
      setDownloadMessage("");
    }, 3500);
  }

  // ==========================================================
  // DOWNLOAD MOVIE
  // ==========================================================

  function handleDownload() {
    if (!movie?.downloadable || !movie?.downloadUrl) {
      return;
    }

    // ========================================================
    // DOWNLOAD PAGE
    //
    // IMPORTANT:
    // This is checked BEFORE direct download.
    // ========================================================

    if (movie.downloadType === "page") {
      showDownloadMessage("Getting download page...");

      // ------------------------------------------------------
      // Redirect to the third-party download page.
      // ------------------------------------------------------

      window.setTimeout(() => {
        window.location.assign(movie.downloadUrl);
      }, 250);

      return;
    }

    // ========================================================
    // DIRECT DOWNLOAD
    // ========================================================

    if (movie.downloadType === "direct") {
      showDownloadMessage("Download started...");

      // ------------------------------------------------------
      // Hidden iframe keeps MoviesAdda open while requesting
      // the third-party direct download.
      // ------------------------------------------------------

      const iframe = document.createElement("iframe");

      iframe.style.display = "none";

      iframe.src = movie.downloadUrl;

      document.body.appendChild(iframe);

      window.setTimeout(() => {
        iframe.remove();
      }, 30000);

      return;
    }
  }

  // ==========================================================
  // WATCH MOVIE
  // ==========================================================

  function handleWatch() {
    if (!movie?.videoUrl) {
      return;
    }

    window.location.assign(movie.videoUrl);
  }

  // ==========================================================
  // DETERMINE WATCH AVAILABILITY
  // ==========================================================

  const isLegacyDownloadOnly =
    movie &&
    typeof movie.downloadable !== "boolean" &&
    movie.downloadOnly === true;

  const hasWatchUrl = Boolean(movie?.videoUrl?.trim()) && !isLegacyDownloadOnly;

  // ==========================================================
  // RENDER
  // ==========================================================

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
        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && <div className="empty">Loading movie…</div>}

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && <div className="notice error">{error}</div>}

        {/* ===================================================
            MOVIE
        =================================================== */}

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
                {/* =============================================
                    WATCH MOVIE

                    Only shown when a real Watch URL exists.
                ============================================= */}

                {hasWatchUrl && (
                  <button
                    type="button"
                    className="primary movie-watch"
                    onClick={handleWatch}
                  >
                    <GiPlayButton />
                    Watch Movie
                  </button>
                )}

                {/* =============================================
                    DOWNLOAD MOVIE
                ============================================= */}

                {movie.downloadable && movie.downloadUrl && (
                  <button
                    type="button"
                    className="primary movie-watch movie-download-button"
                    onClick={handleDownload}
                  >
                    <FaDownload />

                    {movie.downloadType === "page"
                      ? "Download Movie"
                      : "Download Movie"}
                  </button>
                )}

                {/* =============================================
                    BACK
                ============================================= */}

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
