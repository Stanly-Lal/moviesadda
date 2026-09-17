import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import Header from "../components/Header";
import VideoCard from "../components/VideoCard";
import Pagination from "../components/Pagination";
import InstallApp from "../components/InstallApp";
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
  // NAVIGATION / RESTORE CONTROL
  // ==========================================================

  const navigationRef = useRef("restore");

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

        // Search should go to top when the new results arrive
        navigationRef.current = "top";

        setQ(search);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [search, q]);

  // ==========================================================
  // FETCH VIDEOS
  // ==========================================================

  useEffect(() => {
    let live = true;

    setLoading(true);
    setError("");

    request(`/api/videos?page=${page}&limit=16&q=${encodeURIComponent(q)}`)
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
  // SCROLL / NAVIGATION CONTROL
  // ==========================================================

  useLayoutEffect(() => {
    if (loading) {
      return;
    }

    if (!data.items.length) {
      return;
    }

    const navigation = navigationRef.current;

    // ========================================================
    // PREV / NEXT
    //
    // Keep exact current scroll position.
    // ========================================================

    if (typeof navigation === "object" && navigation.type === "preserve") {
      const exactScrollPosition = navigation.scrollPosition;

      navigationRef.current = "normal";

      window.history.scrollRestoration = "manual";

      window.scrollTo(0, exactScrollPosition);

      requestAnimationFrame(() => {
        window.scrollTo(0, exactScrollPosition);

        requestAnimationFrame(() => {
          window.scrollTo(0, exactScrollPosition);
        });
      });

      return;
    }

    // ========================================================
    // DIRECT PAGE / ELLIPSIS
    //
    // IMPORTANT:
    //
    // We DO NOT scroll when the button is clicked.
    //
    // We wait until the new page data has arrived.
    // useLayoutEffect then moves to the top before the
    // browser paints the new page.
    // ========================================================

    if (navigation === "top") {
      navigationRef.current = "normal";

      window.history.scrollRestoration = "manual";

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      return;
    }

    // ========================================================
    // REFRESH / BACK RESTORATION
    // ========================================================

    if (navigation === "restore") {
      const key = getScrollKey(page, q);

      const savedPosition = sessionStorage.getItem(key);

      const targetPosition = savedPosition !== null ? Number(savedPosition) : 0;

      navigationRef.current = "normal";

      window.history.scrollRestoration = "manual";

      window.scrollTo({
        top: targetPosition,
        left: 0,
        behavior: "auto",
      });

      return;
    }
  }, [loading, data.items, page, q]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  function handlePageChange(newPage, navigationType = "top") {
    // ========================================================
    // DIRECT PAGE / ELLIPSIS
    // ========================================================

    if (navigationType === "top") {
      // IMPORTANT:
      //
      // Do NOT scroll here.
      //
      // The old page must stay exactly where it is while
      // the new page is being fetched.
      //
      // Once the new page arrives, useLayoutEffect will move
      // to the top before the new content is painted.

      navigationRef.current = "top";

      sessionStorage.setItem("homePage", String(newPage));

      sessionStorage.setItem(getScrollKey(newPage, q), "0");

      setPage(newPage);

      return;
    }

    // ========================================================
    // PREV / NEXT
    // ========================================================

    if (navigationType === "preserve") {
      // Capture exact current position
      const exactScrollPosition = window.scrollY;

      navigationRef.current = {
        type: "preserve",
        scrollPosition: exactScrollPosition,
      };

      sessionStorage.setItem("homePage", String(newPage));

      setPage(newPage);
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <Header search={search} setSearch={setSearch} />

      <main
        className="container home-container"
        style={{
          overflowAnchor: "none",
        }}
      >
        <div className="heading">
          <div>
            <p className="eyebrow">Movies Gallery</p>

            <h1>Watch, remember & share</h1>
          </div>

          <p className="count">{data.pagination.total || 0} videos</p>
        </div>

        {error && <div className="notice error">{error}</div>}

        {/* ==================================================
            KEEP THE CURRENT GRID DURING LOADING

            This is important for Prev/Next because it prevents
            the document height from collapsing.
            ================================================== */}

        {loading && !data.items.length ? (
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

      <InstallApp />

      <Footer />
    </>
  );
}
