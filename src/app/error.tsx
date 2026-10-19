"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap" style={{ paddingTop: 48, paddingBottom: 64 }}>
      <div className="m-card m-empty" style={{ maxWidth: 560, margin: "0 auto" }}>
        <b>Something went wrong</b>
        <span>{process.env.NODE_ENV === "development" ? error.message : "Please try again in a moment."}</span>
        <button className="m-btn m-btn-o" type="button" onClick={reset} style={{ marginTop: 18 }}>
          Try again
        </button>
      </div>
    </div>
  );
}
