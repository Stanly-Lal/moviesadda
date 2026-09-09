import React from "react";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import VideoCard from "../components/VideoCard";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";
import { request } from "../services/api";

export default function Home() {
  const [search, setSearch] = useState(""),
    [q, setQ] = useState(""),
    [page, setPage] = useState(1),
    [data, setData] = useState({ items: [], pagination: { totalPages: 1 } }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    request(`/api/videos?page=${page}&limit=12&q=${encodeURIComponent(q)}`)
      .then((x) => live && setData(x))
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false));
    return () => (live = false);
  }, [q, page]);
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
              {data.items.map((v) => (
                <VideoCard key={v._id} video={v} />
              ))}
            </section>
            <Pagination
              page={data.pagination.page}
              total={data.pagination.totalPages}
              onChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
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
