import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Verified } from "@/components/Verified";
import { ConnectButton } from "@/components/deals/DealButtons";
import { DealCard, type DealCardData } from "@/components/deals/DealCard";
import { ThreadCard } from "@/components/forum/ThreadCard";
import { FollowPersonButton } from "@/components/profile/FollowPersonButton";
import { getViewer } from "@/lib/auth";
import { PARTNER_KINDS } from "@/lib/config";
import { count, timeAgo } from "@/lib/format";
import { DEAL_CARD_SELECT, getDealMarks } from "@/lib/queries/deals";
import { getThreadMarks, THREAD_CARD_SELECT, toCard } from "@/lib/queries/forum";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TABS = [
  { id: "discussions", label: "Discussions" },
  { id: "replies", label: "Replies" },
  { id: "deals", label: "Deals" },
];

async function loadProfile(id: string) {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const profile = await loadProfile((await params).id);
  return { title: profile ? profile.full_name : "Member not found" };
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: rawTab } = await searchParams;
  const tab = TABS.some((t) => t.id === rawTab) ? rawTab! : "discussions";
  const profile = await loadProfile(id);
  if (!profile) notFound();

  const supabase = await createClient();
  const viewer = await getViewer();
  const isSelf = viewer?.id === id;

  const [followersRes, followingRes, viewerFollowRes, partnerRes, connectedRes, threadCountRes, replyCountRes, dealCountRes] = await Promise.all([
    supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("followee_id", id),
    supabase.from("follows").select("followee_id", { count: "exact", head: true }).eq("follower_id", id),
    viewer && !isSelf
      ? supabase.from("follows").select("followee_id").eq("follower_id", viewer.id).eq("followee_id", id).maybeSingle()
      : null,
    supabase.from("capital_partners").select("*").eq("profile_id", id).maybeSingle(),
    viewer && !isSelf
      ? supabase.from("partner_connections").select("partner_id").eq("partner_id", id).eq("user_id", viewer.id).maybeSingle()
      : null,
    supabase.from("threads").select("id", { count: "exact", head: true }).eq("author_id", id),
    supabase.from("replies").select("id", { count: "exact", head: true }).eq("author_id", id),
    supabase.from("deals").select("id", { count: "exact", head: true }).eq("poster_id", id).eq("status", "live"),
  ]);

  const counts = { discussions: threadCountRes.count ?? 0, replies: replyCountRes.count ?? 0, deals: dealCountRes.count ?? 0 };
  const partner = partnerRes.data;
  const kind = partner ? PARTNER_KINDS[partner.kind] ?? PARTNER_KINDS.Investor : null;
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  let body: React.ReactNode = null;
  if (tab === "discussions") {
    const { data, error } = await supabase
      .from("threads")
      .select(THREAD_CARD_SELECT)
      .eq("author_id", id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const threads = (data ?? []).map((r: any) => toCard(r));
    const marks = await getThreadMarks(supabase, viewer?.id, threads.map((t) => t.id));
    body = threads.length ? (
      threads.map((t) => <ThreadCard key={t.id} thread={t} liked={marks.liked.has(t.id)} saved={marks.saved.has(t.id)} />)
    ) : (
      <Empty title="No discussions yet" text={isSelf ? "Start one in the forums." : `${profile.full_name} has not started a discussion yet.`} />
    );
  } else if (tab === "replies") {
    const { data, error } = await supabase
      .from("replies")
      .select("id, body, created_at, is_answer, thread:threads(id, title)")
      .eq("author_id", id)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    body = data?.length ? (
      <div className="m-card" style={{ padding: "8px 24px" }}>
        {data.map((r) => (
          <div key={r.id} className="x-q" style={{ display: "block" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 13, color: "#5E6B7E" }}>
              <Icon name="reply" size={15} />
              <span>Replied {timeAgo(r.created_at)} in</span>
              {r.thread && (
                <Link href={`/forums/${r.thread.id}#reply-${r.id}`} style={{ fontWeight: 800, color: "#0F1B2D" }}>
                  {r.thread.title}
                </Link>
              )}
              {r.is_answer && (
                <span className="m-badge" style={{ color: "#17603F", background: "#DDF3E8" }}>
                  <Icon name="check" size={13} strokeWidth={3} />
                  Accepted answer
                </span>
              )}
            </div>
            <p className="m-ex" style={{ marginTop: 8, color: "#1E2B3F" }}>
              {r.body}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <Empty title="No replies yet" text={isSelf ? "Help someone out in the forums." : `${profile.full_name} has not replied to anything yet.`} />
    );
  } else {
    const { data, error } = await supabase
      .from("deals")
      .select(DEAL_CARD_SELECT)
      .eq("poster_id", id)
      .eq("status", "live")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const deals = (data ?? []) as unknown as DealCardData[];
    const marks = await getDealMarks(supabase, viewer?.id, deals.map((d) => d.id));
    body = deals.length ? (
      <div className="d-grid">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} saved={marks.saved.has(d.id)} requested={marks.requested.has(d.id)} viewerId={viewer?.id} />
        ))}
      </div>
    ) : (
      <Empty title="No live deals" text={isSelf ? "Post one in the Deal Room." : `${profile.full_name} has no deals in the Deal Room right now.`} />
    );
  }

  return (
    <>
      <div className="wrap" style={{ paddingTop: 24 }}>
        <section className="m-hero" style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center" }}>
          <svg width="520" height="300" viewBox="0 0 520 300" aria-hidden="true" style={{ position: "absolute", right: -60, top: -40 }}>
            <defs>
              <radialGradient id="uGlow" cx="0.6" cy="0.4" r="0.6">
                <stop offset="0" stopColor="#F26B1D" stopOpacity="0.35" />
                <stop offset="1" stopColor="#F26B1D" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="520" height="300" fill="url(#uGlow)" />
          </svg>
          <span style={{ position: "relative", borderRadius: 30, boxShadow: "0 0 0 4px rgba(255,255,255,0.12)" }}>
            <Avatar name={profile.full_name} color={profile.avatar_color} size={104} radius={30} fontSize={34} />
          </span>
          <div style={{ position: "relative", flex: "1 1 420px", minWidth: 0 }}>
            <h1 style={{ margin: 0, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {profile.full_name}
              {profile.verified && <Verified size={28} />}
            </h1>
            <p style={{ marginTop: 8 }}>
              {[profile.headline, profile.location && !profile.headline.includes(profile.location) ? profile.location : ""]
                .filter(Boolean)
                .join(" · ") || "Member"}
              <span style={{ display: "block", fontSize: 14, marginTop: 2 }}>Member since {memberSince}</span>
            </p>
            {profile.bio && (
              <p style={{ marginTop: 14, fontSize: 15, color: "#E3E9F2", maxWidth: 640 }}>{profile.bio}</p>
            )}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22, alignItems: "center" }}>
              {isSelf ? (
                <>
                  <Link className="m-btn m-btn-w" href="/settings">
                    Edit profile
                  </Link>
                  <span style={{ fontSize: 14, color: "#C5D1E3" }}>
                    <b style={{ color: "#fff" }}>{count(followersRes.count ?? 0)}</b> {followersRes.count === 1 ? "follower" : "followers"}
                  </span>
                </>
              ) : viewer ? (
                <FollowPersonButton personId={id} following={!!viewerFollowRes?.data} followers={followersRes.count ?? 0} />
              ) : (
                <>
                  <Link className="m-btn m-btn-o" href={`/login?next=/u/${id}`}>
                    Follow
                  </Link>
                  <span style={{ fontSize: 14, color: "#C5D1E3" }}>
                    <b style={{ color: "#fff" }}>{count(followersRes.count ?? 0)}</b> {followersRes.count === 1 ? "follower" : "followers"}
                  </span>
                </>
              )}
              <span style={{ fontSize: 14, color: "#C5D1E3" }}>
                <b style={{ color: "#fff" }}>{count(followingRes.count ?? 0)}</b> following
              </span>
            </div>
          </div>
          <div style={{ position: "relative", flex: "0 1 340px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="d-stat">
              <b>{count(profile.post_count)}</b>
              <span>Posts</span>
            </div>
            <div className="d-stat">
              <b>{count(counts.deals)}</b>
              <span>Live deals</span>
            </div>
          </div>
        </section>
      </div>

      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 56, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <main style={{ flex: "999 1 640px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <nav className="m-seg" aria-label="Activity" style={{ alignSelf: "flex-start", marginBottom: 4 }}>
            {TABS.map((t) => (
              <Link
                key={t.id}
                className={t.id === tab ? "on" : undefined}
                aria-current={t.id === tab ? "true" : undefined}
                href={t.id === "discussions" ? `/u/${id}` : `/u/${id}?tab=${t.id}`}
                scroll={false}
              >
                {t.label}
                <span style={{ marginLeft: 8, fontSize: 12, color: "#5E6B7E", fontWeight: 700 }}>{counts[t.id as keyof typeof counts]}</span>
              </Link>
            ))}
          </nav>
          {body}
        </main>

        <aside style={{ flex: "1 1 320px", maxWidth: "100%", display: "flex", flexDirection: "column", gap: 16 }} aria-label="More about this member">
          {partner && kind && (
            <div className="m-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5E6B7E" }}>Capital partner</span>
                <span className="d-pill" style={{ background: kind.tint, color: kind.ink }}>
                  {partner.kind}
                </span>
              </div>
              <div style={{ background: "#F5F6FA", borderRadius: 14, padding: "12px 14px" }}>
                <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#5E6B7E" }}>{partner.offer_label}</span>
                <b style={{ display: "block", fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", marginTop: 2 }}>{partner.offer}</b>
              </div>
              {partner.about && <p style={{ fontSize: 14, lineHeight: 1.55, color: "#4A576B" }}>{partner.about}</p>}
              {partner.focus.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {partner.focus.map((f) => (
                    <span key={f} className="m-tag">
                      {f}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ paddingTop: 14, borderTop: "1px solid #EEF1F5", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: "#5E6B7E", lineHeight: 1.45 }}>
                  <b style={{ display: "block", fontSize: 13, color: "#1E2B3F" }}>{partner.track_record}</b>
                  {partner.reply_time}
                </span>
                <ConnectButton partnerId={id} connected={!!connectedRes?.data} own={isSelf} />
              </div>
            </div>
          )}

          {isSelf && !partner && (
            <div className="m-promo">
              <h3>Investor, lender or operator?</h3>
              <p>List yourself as a capital partner so members with deals can find you.</p>
              <Link className="m-btn m-btn-o" href="/deals/partners/join" style={{ position: "relative" }}>
                Join as a capital partner
              </Link>
            </div>
          )}

          <div className="m-card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800 }}>Activity</h3>
            {[
              { icon: "chat" as const, label: "Discussions started", value: counts.discussions },
              { icon: "reply" as const, label: "Replies", value: counts.replies },
              { icon: "briefcase" as const, label: "Live deals", value: counts.deals },
            ].map((row) => (
              <div key={row.label} className="d-row">
                <span className="m-ic" style={{ background: "#F3F5F9" }}>
                  <Icon name={row.icon} size={16} stroke="#0B1F3A" />
                </span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{row.label}</span>
                <b style={{ fontSize: 15 }}>{count(row.value)}</b>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="m-card m-empty">
      <b>{title}</b>
      <span>{text}</span>
    </div>
  );
}
