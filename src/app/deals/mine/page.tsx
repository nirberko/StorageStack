import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { decideRequest, setDealStatus, withdrawRequest } from "@/app/actions/deal-page";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Verified } from "@/components/Verified";
import { DealCard, type DealCardData } from "@/components/deals/DealCard";
import { SubmitButton } from "@/components/deals/page/SubmitButton";
import { getViewer } from "@/lib/auth";
import { DEAL_TYPES, PROPERTY_BY_ID } from "@/lib/config";
import { count, money, timeAgo } from "@/lib/format";
import { DEAL_CARD_SELECT, getDealMarks } from "@/lib/queries/deals";
import { createClient } from "@/lib/supabase/server";
import { AUTHOR_FIELDS, type Author } from "@/lib/types";

export const metadata: Metadata = { title: "My deals and requests" };

const STATUS = {
  pending: { label: "Waiting", color: "#8A5A12", bg: "#FBF1DD" },
  approved: { label: "Approved", color: "#17603F", bg: "#DDF3E8" },
  declined: { label: "Declined", color: "#A82A2A", bg: "#FCE5E5" },
} as const;

function StatusBadge({ status }: { status: keyof typeof STATUS }) {
  const s = STATUS[status];
  return (
    <span className="m-badge" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

export default async function MyDealsPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/deals/mine");
  const supabase = await createClient();

  const [mineRes, sentRes, savedRes] = await Promise.all([
    supabase
      .from("deals")
      .select(`*, deal_requests(*, requester:profiles!deal_requests_user_id_fkey(${AUTHOR_FIELDS}))`)
      .eq("poster_id", viewer.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("deal_requests")
      .select(`*, deal:deals(id, title, city, state, type, status, poster:profiles!deals_poster_id_fkey(full_name))`)
      .eq("user_id", viewer.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("deal_saves")
      .select(`created_at, deal:deals(${DEAL_CARD_SELECT})`)
      .eq("user_id", viewer.id)
      .order("created_at", { ascending: false }),
  ]);
  if (mineRes.error) throw new Error(mineRes.error.message);

  const mine = mineRes.data ?? [];
  const sent = (sentRes.data ?? []).filter((r) => r.deal);
  const saved = (savedRes.data ?? []).map((s) => s.deal as unknown as DealCardData | null).filter((d): d is DealCardData => !!d);
  const marks = await getDealMarks(supabase, viewer.id, saved.map((d) => d.id));
  const pendingTotal = mine.reduce((n, d) => n + d.deal_requests.filter((r) => r.status === "pending").length, 0);

  return (
    <div className="wrap" style={{ paddingTop: 22, paddingBottom: 64 }}>
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#5E6B7E" }}>
        <Link href="/deals" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5E6B7E" }}>
          <Icon name="back" size={16} strokeWidth={2.2} />
          Deal Room
        </Link>
        <span aria-hidden="true">/</span>
        <span style={{ color: "#0F1B2D" }}>My deals</span>
      </nav>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap", marginTop: 12 }}>
        <div style={{ flex: "1 1 420px" }}>
          <h1 style={{ fontSize: 36, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.03em" }}>My deals and requests</h1>
          <p style={{ marginTop: 8, fontSize: 16, color: "#5E6B7E" }}>
            {pendingTotal > 0
              ? `${pendingTotal} ${pendingTotal === 1 ? "member is" : "members are"} waiting for you to approve or decline.`
              : "Approve who sees your address and documents, and keep track of deals you asked about."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="m-btn m-btn-s" href="/deals/alerts">
            <Icon name="bell" size={17} />
            Deal alerts
          </Link>
          <Link className="m-btn m-btn-o" href="/deals/new">
            <Icon name="plus" size={18} strokeWidth={2.4} />
            Post a deal
          </Link>
        </div>
      </div>

      <h2 className="x-h2" style={{ marginTop: 32 }}>
        Deals you posted <span style={{ color: "#5E6B7E", fontWeight: 700 }}>{mine.length}</span>
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 14 }}>
        {mine.length === 0 && (
          <div className="m-card m-empty">
            <b>You have not posted a deal yet</b>
            <span>Selling, raising money, looking for a partner or a loan? It takes about 5 minutes.</span>
            <Link className="m-btn m-btn-o" href="/deals/new" style={{ marginTop: 18 }}>
              Post a deal
            </Link>
          </div>
        )}
        {mine.map((d) => {
          const t = DEAL_TYPES[d.type];
          const requests = [...d.deal_requests].sort((a, b) => (a.status === "pending" ? -1 : 0) - (b.status === "pending" ? -1 : 0) || b.created_at.localeCompare(a.created_at));
          return (
            <section key={d.id} className="m-card" style={{ padding: 24 }} aria-label={d.title}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 420px", minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="d-pill" style={{ background: t.tint, color: t.ink }}>
                      <span className="d-dot" style={{ background: t.dot }} />
                      {t.name}
                    </span>
                    <span className="d-pill" style={{ background: d.status === "live" ? "#DDF3E8" : "#E6EBF3", color: d.status === "live" ? "#17603F" : "#4A576B" }}>
                      {d.status === "live" ? "Live" : "Closed"}
                    </span>
                  </div>
                  <Link className="m-title" href={`/deals/${d.id}`} style={{ display: "block", marginTop: 10 }}>
                    {d.title}
                  </Link>
                  <p style={{ marginTop: 4, fontSize: 13, color: "#5E6B7E", fontWeight: 600 }}>
                    {d.city}, {d.state} · {PROPERTY_BY_ID[d.property_type].name} · posted {timeAgo(d.created_at)} · {count(d.views)} views · {d.interest_count} interested
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link className="m-btn m-btn-s" href={`/deals/${d.id}`}>
                    View
                  </Link>
                  <form action={setDealStatus.bind(null, d.id, d.status === "live" ? "closed" : "live")}>
                    <SubmitButton className="m-btn m-btn-line" pendingText="Saving…">
                      {d.status === "live" ? "Mark as closed" : "Reopen"}
                    </SubmitButton>
                  </form>
                </div>
              </div>

              <div style={{ marginTop: 18, borderTop: "1px solid #EEF1F5", paddingTop: 6 }}>
                {requests.length === 0 && <p className="x-sub" style={{ paddingTop: 12 }}>No requests yet. Share your deal in the forum to get it in front of more members.</p>}
                {requests.map((r) => {
                  const p = r.requester as Author | null;
                  return (
                    <div key={r.user_id} className="p-row" style={{ flexWrap: "wrap", alignItems: "flex-start" }}>
                      <Avatar name={p?.full_name ?? "?"} color={p?.avatar_color ?? "#E6EBF3"} size={40} radius={13} fontSize={13} />
                      <span style={{ flex: "1 1 260px", minWidth: 0, lineHeight: 1.4 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {p ? (
                            <Link href={`/u/${p.id}`} style={{ fontWeight: 800, fontSize: 15 }}>
                              {p.full_name}
                            </Link>
                          ) : (
                            <b>Former member</b>
                          )}
                          {p?.verified && <Verified size={15} />}
                          <StatusBadge status={r.status} />
                        </span>
                        <span style={{ display: "block", fontSize: 13, color: "#5E6B7E" }}>
                          {p?.headline ? `${p.headline} · ` : ""}
                          {timeAgo(r.created_at)}
                          {r.amount ? ` · thinking of ${money(r.amount)}` : ""}
                        </span>
                        {r.message && <span style={{ display: "block", marginTop: 6, fontSize: 14, color: "#334155" }}>{r.message}</span>}
                      </span>
                      <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {r.status !== "approved" && (
                          <form action={decideRequest.bind(null, d.id, r.user_id, "approved")}>
                            <SubmitButton className="m-btn m-btn-n" style={{ minHeight: 40, fontSize: 14 }} pendingText="…">
                              Approve
                            </SubmitButton>
                          </form>
                        )}
                        {r.status !== "declined" && (
                          <form action={decideRequest.bind(null, d.id, r.user_id, r.status === "approved" ? "pending" : "declined")}>
                            <SubmitButton className="m-btn m-btn-s" style={{ minHeight: 40, fontSize: 14 }} pendingText="…">
                              {r.status === "approved" ? "Remove access" : "Decline"}
                            </SubmitButton>
                          </form>
                        )}
                        {r.status === "declined" && (
                          <form action={decideRequest.bind(null, d.id, r.user_id, "pending")}>
                            <SubmitButton className="m-btn m-btn-g" style={{ minHeight: 40, fontSize: 14 }} pendingText="…">
                              Undo
                            </SubmitButton>
                          </form>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <h2 className="x-h2" style={{ marginTop: 36 }}>
        Requests you sent <span style={{ color: "#5E6B7E", fontWeight: 700 }}>{sent.length}</span>
      </h2>
      <div className="m-card" style={{ padding: "8px 24px", marginTop: 14 }}>
        {sent.length === 0 && <p className="x-sub" style={{ padding: "14px 0" }}>When you ask about a deal it shows up here with its status.</p>}
        {sent.map((r) => {
          const d = r.deal!;
          const t = DEAL_TYPES[d.type];
          return (
            <div key={r.deal_id} className="p-row" style={{ flexWrap: "wrap" }}>
              <span className="m-ic" style={{ width: 40, height: 40, borderRadius: 12, background: t.tint }}>
                <Icon d={t.icon} size={18} stroke={t.dot} />
              </span>
              <span style={{ flex: "1 1 280px", minWidth: 0, lineHeight: 1.4 }}>
                <Link href={`/deals/${d.id}`} style={{ fontWeight: 800, fontSize: 15 }}>
                  {d.title}
                </Link>
                <span style={{ display: "block", fontSize: 13, color: "#5E6B7E" }}>
                  {t.name} · {d.city}, {d.state} · {(d.poster as { full_name: string } | null)?.full_name ?? "Former member"} · sent {timeAgo(r.created_at)}
                  {d.status === "closed" ? " · deal closed" : ""}
                </span>
              </span>
              <StatusBadge status={r.status} />
              {r.status === "approved" && (
                <Link className="m-btn m-btn-s" href={`/deals/${d.id}#docs`} style={{ minHeight: 40, fontSize: 14 }}>
                  See documents
                </Link>
              )}
              <form action={withdrawRequest.bind(null, d.id)}>
                <SubmitButton className="m-btn m-btn-g" style={{ minHeight: 40, fontSize: 14 }} pendingText="…">
                  Withdraw
                </SubmitButton>
              </form>
            </div>
          );
        })}
      </div>

      <h2 className="x-h2" style={{ marginTop: 36 }}>
        Saved deals <span style={{ color: "#5E6B7E", fontWeight: 700 }}>{saved.length}</span>
      </h2>
      <div style={{ marginTop: 14 }}>
        {saved.length === 0 ? (
          <div className="m-card m-empty">
            <b>No saved deals yet</b>
            <span>Tap the bookmark on any deal to keep it here.</span>
          </div>
        ) : (
          <div className="d-grid">
            {saved.map((d) => (
              <DealCard key={d.id} deal={d} saved requested={marks.requested.has(d.id)} viewerId={viewer.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
