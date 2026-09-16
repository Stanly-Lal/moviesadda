import React, { useEffect, useState } from "react";

/* ============================================================
   RESPONSIVE PAGINATION LOGIC
   ============================================================ */

function getPages(current, total, siblingCount) {
  /*
    siblingCount controls the number of page
    buttons around the current page.

    0 = 2 middle page buttons
    1 = 3 middle page buttons
    2 = 5 middle page buttons
  */

  const middlePageCount = siblingCount === 0 ? 2 : siblingCount * 2 + 1;

  if (total <= middlePageCount + 4) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const firstPage = 1;
  const lastPage = total;

  let start;
  let end;

  if (siblingCount === 0) {
    start = Math.max(2, current - 1);

    end = start + 1;

    if (end >= total) {
      end = total - 1;

      start = Math.max(2, end - 1);
    }
  } else {
    start = Math.max(2, current - siblingCount);

    end = Math.min(total - 1, current + siblingCount);

    if (end - start + 1 < middlePageCount) {
      if (start === 2) {
        end = Math.min(total - 1, start + middlePageCount - 1);
      } else if (end === total - 1) {
        start = Math.max(2, end - middlePageCount + 1);
      }
    }
  }

  const pages = [];

  pages.push(firstPage);

  if (start > 2) {
    pages.push({
      type: "ellipsis",
      direction: "left",
    });
  } else {
    for (let i = 2; i < start; i++) {
      pages.push(i);
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < total - 1) {
    pages.push({
      type: "ellipsis",
      direction: "right",
    });
  } else {
    for (let i = end + 1; i < total; i++) {
      pages.push(i);
    }
  }

  pages.push(lastPage);

  return pages;
}

/* ============================================================
   RESPONSIVE SIBLING COUNT
   ============================================================ */

function getSiblingCount(width) {
  /*
    <= 320px:
    1 … 8 9 … 50
  */

  if (width <= 320) {
    return 0;
  }

  /*
    321px - 872px:
    1 … 7 8 9 … 50
  */

  if (width <= 872) {
    return 1;
  }

  /*
    Desktop:
    1 … 6 7 8 9 10 … 50
  */

  return 2;
}

/* ============================================================
   ELLIPSIS JUMP
   ============================================================ */

function getEllipsisTarget(current, total, direction) {
  const jump = Math.max(3, Math.ceil(total / 10));

  if (direction === "left") {
    return Math.max(1, current - jump);
  }

  return Math.min(total, current + jump);
}

/* ============================================================
   PAGINATION COMPONENT
   ============================================================ */

export default function Pagination({ page, total, onChange }) {
  const [siblingCount, setSiblingCount] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }

    return getSiblingCount(window.innerWidth);
  });

  useEffect(() => {
    function handleResize() {
      setSiblingCount(getSiblingCount(window.innerWidth));
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (total <= 1) {
    return null;
  }

  const visiblePages = getPages(page, total, siblingCount);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination-prev"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="Go to previous page"
      >
        <span className="pagination-arrow">←</span>

        <span className="pagination-label">Prev</span>
      </button>

      {visiblePages.map((item, index) => {
        if (typeof item === "object") {
          const targetPage = getEllipsisTarget(page, total, item.direction);

          return (
            <button
              key={`${item.direction}-${index}`}
              type="button"
              className="pagination-ellipsis"
              onClick={() => onChange(targetPage)}
              aria-label={
                item.direction === "left"
                  ? `Go backward to page ${targetPage}`
                  : `Go forward to page ${targetPage}`
              }
              title={
                item.direction === "left"
                  ? `Go back to page ${targetPage}`
                  : `Go forward to page ${targetPage}`
              }
            >
              …
            </button>
          );
        }

        return (
          <button
            key={item}
            type="button"
            className={item === page ? "active" : ""}
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Go to page ${item}`}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        className="pagination-next"
        disabled={page === total}
        onClick={() => onChange(page + 1)}
        aria-label="Go to next page"
      >
        <span className="pagination-label">Next</span>

        <span className="pagination-arrow">→</span>
      </button>
    </nav>
  );
}
