import React from "react";

function pages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const a = [1];
  if (current > 4) a.push("…");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  )
    a.push(i);
  if (current < total - 3) a.push("…");
  a.push(total);
  return a;
}
export default function Pagination({ page, total, onChange }) {
  if (total <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>
        ← Prev
      </button>
      {pages(page, total).map((p, i) =>
        p === "…" ? (
          <span key={i}>…</span>
        ) : (
          <button
            key={p}
            className={p === page ? "active" : ""}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button disabled={page === total} onClick={() => onChange(page + 1)}>
        Next →
      </button>
    </nav>
  );
}
