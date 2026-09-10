import React from "react";
import { Link } from "react-router-dom";
import { GiPlayButton } from "react-icons/gi";

export default function VideoCard({ video }) {
  return (
    <Link className="card" to={`/movie/${video._id}`}>
      <div className="poster">
        <img
          src={video.posterUrl}
          alt={`${video.title} poster`}
          loading="lazy"
        />

        <div className="play"><GiPlayButton /></div>
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
