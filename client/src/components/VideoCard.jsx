import React from "react";
import { Link } from "react-router-dom";
import { GiPlayButton } from "react-icons/gi";

export default function VideoCard({ video, page, searchQuery }) {
  function handleClick() {
    // ========================================================
    // SAVE PAGE
    // ========================================================

    sessionStorage.setItem("homePage", String(page));

    // ========================================================
    // SAVE EXACT SCROLL POSITION
    // ========================================================

    const key = `homeScroll_${searchQuery || "all"}_page_${page}`;

    sessionStorage.setItem(key, String(window.scrollY));
  }

  return (
    <Link className="card" to={`/movie/${video._id}`} onClick={handleClick}>
      <div className="poster">
        <img
          src={video.posterUrl}
          alt={`${video.title} poster`}
          loading="eager"
        />

        <div className="play">
          <GiPlayButton />
        </div>
      </div>

      <div className="card-body">
        <h3>{video.title}</h3>

        <time dateTime={video.createdAt}>
          Added{" "}
          {new Intl.DateTimeFormat(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(new Date(video.createdAt))}
        </time>
      </div>
    </Link>
  );
}
