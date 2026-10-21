import Link from "next/link";
import { Icon } from "@/components/Icon";
import { count, plural } from "@/lib/format";
import type { Dashboard } from "@/lib/queries/home";

type Props = Pick<Dashboard, "pending" | "alerts" | "savedDeals"> & { dealsPosted: number };

/** "2 requests to approve", linking to My deals. */
export function PendingRow({ pending, className }: { pending: Dashboard["pending"]; className?: string }) {
  return (
    <Link className={`h-deal hot${className ? ` ${className}` : ""}`} href="/deals/mine">
      <span className="m-ic" style={{ width: 40, height: 40, borderRadius: 12, background: "#C2470A", color: "#fff", fontWeight: 800, fontSize: 15 }}>
        {count(pending.count)}
      </span>
      <span style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
        <b style={{ display: "block", fontSize: 14 }}>Requests to approve</b>
        {pending.dealTitle && (
          <span style={{ display: "block", fontSize: 13, color: "#5E6B7E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {pending.dealTitle}
          </span>
        )}
      </span>
      <Icon name="chevron" size={18} stroke="#B5440A" style={{ flex: "none" }} />
    </Link>
  );
}

/** Shortcuts into the Deal Room: requests waiting on the viewer, their alerts and saved deals. */
export function YourDeals({ pending, alerts, savedDeals, dealsPosted }: Props) {
  const empty = dealsPosted === 0 && pending.count === 0 && alerts === 0 && savedDeals === 0;

  return (
    <section className="m-card" style={{ padding: 22 }} aria-labelledby="deals-title">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <h2 id="deals-title" style={{ flex: 1, fontSize: 17, fontWeight: 800 }}>
          Your deals
        </h2>
        <Link className="h-link" href="/deals">
          Deal Room ›
        </Link>
      </div>

      {empty ? (
        <div style={{ textAlign: "center", padding: "6px 4px 2px" }}>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: "#4A576B" }}>
            Post a facility, a raise or a loan request, or get told when a deal like the one you want is posted.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 14 }}>
            <Link className="m-btn m-btn-o" href="/deals/new">
              Post a deal
            </Link>
            <Link className="m-btn m-btn-line" href="/deals/alerts">
              Set up an alert
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* On phones this row leads the page instead (see Dashboard). */}
          {pending.count > 0 && <PendingRow pending={pending} className="m-hide-sm" />}
          <Link className="h-deal" href="/deals/alerts">
            <span className="m-ic" style={{ width: 40, height: 40, borderRadius: 12, background: "#E6EBF3" }}>
              <Icon name="bell" size={18} stroke="#0B1F3A" />
            </span>
            <span style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
              <b style={{ display: "block", fontSize: 14 }}>Deal alerts</b>
              <span style={{ display: "block", fontSize: 13, color: "#5E6B7E" }}>
                {alerts > 0 ? `${plural(alerts, "alert")} set` : "Get told when a matching deal is posted"}
              </span>
            </span>
            <Icon name="chevron" size={18} stroke="#5E6B7E" style={{ flex: "none" }} />
          </Link>
          {/* Saved deals are listed on My deals. */}
          <Link className="h-deal" href={savedDeals > 0 ? "/deals/mine" : "/deals"}>
            <span className="m-ic" style={{ width: 40, height: 40, borderRadius: 12, background: "#F3F5F9" }}>
              <Icon name="bookmark" size={18} stroke="#0B1F3A" />
            </span>
            <span style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
              <b style={{ display: "block", fontSize: 14 }}>{plural(savedDeals, "saved deal")}</b>
              <span style={{ display: "block", fontSize: 13, color: "#5E6B7E" }}>
                {savedDeals > 0 ? "Pick up where you left off" : "Tap the bookmark on any deal to keep it"}
              </span>
            </span>
            <Icon name="chevron" size={18} stroke="#5E6B7E" style={{ flex: "none" }} />
          </Link>
        </div>
      )}
    </section>
  );
}
