import Link from "next/link";
import "./Pagination.css";

/** The page numbers to show: always the first and last, the current one and its neighbours, with gaps between. */
export function pageList(page: number, total: number): (number | "gap")[] {
  const keep = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const p of [...keep].sort((a, b) => a - b)) {
    if (p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

/** Links to the pages of a long list. `hrefFor` builds each page's URL. */
export function Pagination({ page, total, hrefFor }: { page: number; total: number; hrefFor: (page: number) => string }) {
  if (total <= 1) return null;
  return (
    <nav className="ui-pages" aria-label="Pages">
      <Link className="ui-page" href={hrefFor(Math.max(1, page - 1))} aria-disabled={page === 1 || undefined} aria-label="Previous page">
        ‹
      </Link>
      {pageList(page, total).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="ui-pages-gap" aria-hidden>
            …
          </span>
        ) : (
          <Link key={p} className="ui-page" href={hrefFor(p)} aria-current={p === page ? "page" : undefined}>
            {p}
          </Link>
        ),
      )}
      <Link className="ui-page" href={hrefFor(Math.min(total, page + 1))} aria-disabled={page === total || undefined} aria-label="Next page">
        ›
      </Link>
    </nav>
  );
}
