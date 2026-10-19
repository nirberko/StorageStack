import type { Metadata } from "next";
import Link from "next/link";
import { MemberActions } from "@/components/admin/MemberActions";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Verified } from "@/components/Verified";
import { requireAdmin } from "@/lib/auth";
import { count, timeAgo } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Members" };

type Search = { q?: string; filter?: string; page?: string };

const FILTERS = [
  { id: "all", label: "All" },
  { id: "admins", label: "Admins" },
  { id: "moderators", label: "Moderators" },
  { id: "verified", label: "Verified" },
  { id: "unverified", label: "Not verified" },
  { id: "suspended", label: "Suspended" },
];
const PAGE = 25;

function href(base: Search, patch: Partial<Search>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...base, ...patch })) if (v && !(k === "filter" && v === "all") && !(k === "page" && v === "1")) qs.set(k, v);
  const s = qs.toString();
  return s ? `/admin/members?${s}` : "/admin/members";
}

export default async function AdminMembersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const viewer = await requireAdmin("/admin/members");
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const filter = FILTERS.some((f) => f.id === sp.filter) ? sp.filter! : "all";
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);
  const base: Search = { q: q || undefined, filter };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_members", {
    p_query: q,
    p_filter: filter,
    p_limit: PAGE,
    p_offset: (page - 1) * PAGE,
  });
  if (error) throw new Error(error.message);
  const members = data ?? [];
  const total = members[0]?.total ?? 0;
  const from = (page - 1) * PAGE;

  return (
    <>
      <div className="m-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <form action="/admin/members" role="search" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <label className="sr-only" htmlFor="member-q">
            Search members
          </label>
          <input
            id="member-q"
            className="d-input"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name, email or headline"
            style={{ flex: "1 1 260px" }}
          />
          <button className="m-btn m-btn-n" type="submit" style={{ minHeight: 48 }}>
            <Icon name="search" />
            Search
          </button>
        </form>
        <nav className="d-tabs" aria-label="Filter members">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              className={`d-tab${f.id === filter ? " on" : ""}`}
              href={href(base, { filter: f.id, page: undefined })}
              aria-current={f.id === filter ? "page" : undefined}
              style={{ paddingRight: 14 }}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </div>

      <section className="m-card" aria-labelledby="members-h" style={{ padding: "6px 0" }}>
        <h2 id="members-h" className="sr-only">
          Members
        </h2>
        {members.length === 0 ? (
          <div className="m-empty">
            <b>No members found</b>
            <span>{q ? "Try a different search." : "Nobody matches this filter yet."}</span>
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {members.map((m) => {
              const self = m.id === viewer.id;
              return (
                <li key={m.id} className="a-row">
                  <Avatar name={m.full_name} color={m.avatar_color} size={44} radius={14} fontSize={14} />
                  <div style={{ flex: "1 1 220px", minWidth: 0, lineHeight: 1.35 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <Link href={`/u/${m.id}`} style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)" }}>
                        {m.full_name}
                      </Link>
                      {m.verified && <Verified size={15} />}
                      {self && <span className="a-badge">You</span>}
                      {m.is_admin && <span className="a-badge navy">Admin</span>}
                      {m.is_moderator && <span className="a-badge purple">Moderator</span>}
                      {m.suspended && <span className="a-badge red">Suspended</span>}
                    </span>
                    <span className="a-meta">{m.email}</span>
                    {m.headline && <span className="a-meta">{m.headline}</span>}
                  </div>
                  <dl className="a-stats">
                    <div>
                      <dt>Posts</dt>
                      <dd>{count(m.post_count)}</dd>
                    </div>
                    <div>
                      <dt>Joined</dt>
                      <dd>{timeAgo(m.created_at)}</dd>
                    </div>
                    <div>
                      <dt>Last login</dt>
                      <dd>{m.last_sign_in_at ? timeAgo(m.last_sign_in_at) : "Never"}</dd>
                    </div>
                  </dl>
                  <MemberActions
                    member={{
                      id: m.id,
                      name: m.full_name,
                      verified: m.verified,
                      moderator: m.is_moderator,
                      admin: m.is_admin,
                      suspended: m.suspended,
                    }}
                    self={self}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {total > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span className="muted" style={{ fontSize: 14 }}>
            Showing {count(from + 1)}–{count(from + members.length)} of {count(total)}
          </span>
          <span style={{ display: "flex", gap: 8 }}>
            {page > 1 && (
              <Link className="m-btn m-btn-line" href={href(base, { page: String(page - 1) })}>
                <Icon name="arrowLeft" />
                Previous
              </Link>
            )}
            {from + members.length < total && (
              <Link className="m-btn m-btn-line" href={href(base, { page: String(page + 1) })}>
                Next
                <Icon name="arrowRight" />
              </Link>
            )}
          </span>
        </div>
      )}
    </>
  );
}
