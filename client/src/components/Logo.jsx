import React from "react";

export default function Logo() {
  return (
    <div className="brand" aria-label="MoviesAdda">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="5" y="5" width="54" height="54" rx="15" />
        <path d="M27 22v20l17-10z" fill="#e11d48" />
        <path
          d="M17 14l4 8M31 14l4 8M45 14l4 8"
          stroke="#e11d48"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span>
        Movies<span>Adda</span>
      </span>
    </div>
  );
}
