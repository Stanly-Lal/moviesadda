import React, { useEffect, useRef, useState } from "react";

import Header from "../components/Header";
import VideoCard from "../components/VideoCard";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";

import { request } from "../services/api";

export default function Home() {
  // ==========================================================
  // PAGE
  // ==========================================================

  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem("homePage");

    return savedPage ? Number(savedPage) : 1;
  });

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  // ==========================================================
  // DATA
  // ==========================================================

  const [data, setData] = useState({
    items: [],
    pagination: {
      totalPages: 1,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // RESTORE CONTROL
  // ==========================================================

  const hasRestoredRef = useRef(false);

  // ==========================================================
  // BROWSER SCROLL RESTORATION
  // ==========================================================

  useEffect(() => {
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);

  // ==========================================================
  // SCROLL STORAGE KEY
  // ==========================================================

  function getScrollKey(pageNumber, searchQuery) {
    return `homeScroll_${searchQuery || "all"}_page_${pageNumber}`;
  }

  // ==========================================================
  // SAVE SCROLL POSITION
  // ==========================================================

  useEffect(() => {
    function saveScrollPosition() {
      const key = getScrollKey(page, q);

      sessionStorage.setItem(key, String(window.scrollY));
    }

    window.addEventListener("scroll", saveScrollPosition, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", saveScrollPosition);
    };
  }, [page, q]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== q) {
        // New search starts on page 1
        setPage(1);

        sessionStorage.setItem("homePage", "1");

        // Search starts at top
        hasRestoredRef.current = true;

        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant",
        });

        setQ(search);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search, q]);

  // ==========================================================
  // FETCH VIDEOS
  // ==========================================================

  useEffect(() => {
    let live = true;

    setLoading(true);
    setError("");

    request(`/api/videos?page=${page}&limit=12&q=${encodeURIComponent(q)}`)
      .then((result) => {
        if (live) {
          setData(result);
        }
      })
      .catch((e) => {
        if (live) {
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
  }, [page, q]);

  // ==========================================================
  // RESTORE SCROLL POSITION
  // ==========================================================

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!data.items.length) {
      return;
    }

    if (hasRestoredRef.current) {
      return;
    }

    const key = getScrollKey(page, q);

    const savedPosition = sessionStorage.getItem(key);

    const targetPosition = savedPosition !== null ? Number(savedPosition) : 0;

    // Mark as restored before scrolling
    hasRestoredRef.current = true;

    // Instant restoration for:
    // Refresh
    // Movie → Back
    window.scrollTo({
      top: targetPosition,
      left: 0,
      behavior: "instant",
    });
  }, [loading, data.items, page, q]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  function handlePageChange(newPage) {
    // Save new page
    sessionStorage.setItem("homePage", String(newPage));

    // New page starts at top
    sessionStorage.setItem(getScrollKey(newPage, q), "0");

    // Don't restore previous page position
    hasRestoredRef.current = true;

    setPage(newPage);

    // Smooth scroll ONLY for pagination
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <Header search={search} setSearch={setSearch} />

      <main className="container">
        <div className="heading">
          <div>
            <p className="eyebrow">Movies Gallery</p>

            <h1>Watch, remember & share</h1>
          </div>

          <p className="count">{data.pagination.total || 0} videos</p>
        </div>

        {error && <div className="notice error">{error}</div>}

        {loading ? (
          <div className="empty">Loading videos…</div>
        ) : data.items.length ? (
          <>
            <section className="grid">
              {data.items.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  page={page}
                  searchQuery={q}
                />
              ))}
            </section>

            <Pagination
              page={data.pagination.page}
              total={data.pagination.totalPages}
              onChange={handlePageChange}
            />
          </>
        ) : (
          <div className="empty">No videos found.</div>
        )}
      </main>

      <Footer />
    </>
  );
}
