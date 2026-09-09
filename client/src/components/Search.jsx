import React from "react";
import { LiaSearchSolid } from "react-icons/lia";

export default function Search({ value, onChange }) {
  return (
    <label className="search">
      <span>
        <LiaSearchSolid />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search movies by exact name..."
        aria-label="Search movies"
      />
    </label>
  );
}
