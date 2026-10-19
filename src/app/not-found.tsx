import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap" style={{ paddingTop: 48, paddingBottom: 64 }}>
      <div className="m-card m-empty" style={{ maxWidth: 560, margin: "0 auto" }}>
        <b>We could not find that page</b>
        <span>It may have been removed, or the link is wrong.</span>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 18 }}>
          <Link className="m-btn m-btn-o" href="/forums">Go to the forums</Link>
          <Link className="m-btn m-btn-s" href="/deals">Visit the Deal Room</Link>
        </div>
      </div>
    </div>
  );
}
