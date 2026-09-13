import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import VideoCard from "../components/VideoCard";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";
import { request } from "../services/api";

export default function Home() {
  // Restore the last Home page from sessionStorage
  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem("homePage");

    return savedPage ? Number(savedPage) : 1;
  });

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  const [data, setData] = useState({
    items: [],
    pagination: {
      totalPages: 1,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Determines whether the initial position should be restored
  const initialRestore = useRef(true);

  // ---------------------------------------
  // SAVE SCROLL POSITION
  // ---------------------------------------

  useEffect(() => {
    function handleScroll() {
      sessionStorage.setItem(
        "homeScrollPosition",
        window.scrollY.toString()
      );
    }

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ---------------------------------------
  // SEARCH
  // ---------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== q) {
        // Search always starts from page 1
        setPage(1);

        // Save page 1
        sessionStorage.setItem("homePage", "1");

        // Search starts from top
        sessionStorage.setItem(
          "homeScrollPosition",
          "0"
        );

        // Do not restore old scroll position
        initialRestore.current = false;
      }

      setQ(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // ---------------------------------------
  // FETCH VIDEOS
  // ---------------------------------------

  useEffect(() => {
    let live = true;

    setLoading(true);
    setError("");

    request(
      `/api/videos?page=${page}&limit=12&q=${encodeURIComponent(q)}`
    )
      .then((x) => {
        if (live) {
          setData(x);
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

  // ---------------------------------------
  // RESTORE PAGE + SCROLL POSITION
  // ---------------------------------------

  useEffect(() => {
    if (!initialRestore.current) {
      return;
    }

    if (loading) {
      return;
    }

    if (!data.items.length) {
      return;
    }

    const savedScroll = sessionStorage.getItem(
      "homeScrollPosition"
    );

    if (savedScroll === null) {
      initialRestore.current = false;
      return;
    }

    // Wait until the movie cards have fully rendered
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: Number(savedScroll),
          behavior: "instant",
        });

        initialRestore.current = false;
      });
    });
  }, [loading, data.items]);

  // ---------------------------------------
  // PAGINATION
  // ---------------------------------------

  function handlePageChange(newPage) {
    // Pagination should NOT restore old position
    initialRestore.current = false;

    // Save the new page
    sessionStorage.setItem(
      "homePage",
      newPage.toString()
    );

    // New pagination page starts at top
    sessionStorage.setItem(
      "homeScrollPosition",
      "0"
    );

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <>
      <Header
        search={search}
        setSearch={setSearch}
      />

      <main className="container">
        <div className="heading">
          <div>
            <p className="eyebrow">
              Movies Gallery
            </p>

            <h1>
              Watch, remember & share
            </h1>
          </div>

          <p className="count">
            {data.pagination.total || 0} videos
          </p>
        </div>

        {error && (
          <div className="notice error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="empty">
            Loading videos…
          </div>
        ) : data.items.length ? (
          <>
            <section className="grid">
              {data.items.map((v) => (
                <VideoCard
                  key={v._id}
                  video={v}
                  page={page}
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
          <div className="empty">
            No videos found.
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}