import type { Metadata } from "next";
import Link from "next/link";
import { bodyToHtml } from "@/lib/richtext";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Verified } from "@/components/Verified";
import { FollowCategoryButton } from "@/components/forum/FollowButton";
import { LikeButton, SaveButton } from "@/components/forum/ThreadActions";
import { ReplyActions } from "@/components/forum/thread/ReplyActions";
import { ReplyComposer } from "@/components/forum/thread/ReplyComposer";
import { DeleteThreadButton, ShareButton } from "@/components/forum/thread/ThreadToolbar";
import { getViewer } from "@/lib/auth";
import { compact, count, timeAgo } from "@/lib/format";
import { getThreadMarks } from "@/lib/queries/forum";
import { createClient } from "@/lib/supabase/server";
import { AUTHOR_FIELDS, type Author, type Category, type Metric, type Reply, type Thread } from "@/lib/types";

type ThreadRow = Thread & { author: Author | null; category: Category | null };
type ReplyRow = Reply & { author: Author | null };

async function loadThread(id: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("threads")
    .select(`*, author:profiles!threads_author_id_fkey(${AUTHOR_FIELDS}), category:categories(*)`)
    .eq("id", id)
    .maybeSingle();
  return data as ThreadRow | null;
}

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = parseId((await params).id);
  const thread = id ? await loadThread(id) : null;
  return { title: thread ? thread.title : "Discussion not found" };
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id);
  if (!id) notFound();
  const thread = await loadThread(id);
  if (!thread) notFound();

  const supabase = await createClient();
  const viewer = await getViewer();

  const [repliesRes, moreRes, followRes, marks] = await Promise.all([
    supabase
      .from("replies")
      .select(`*, author:profiles!replies_author_id_fkey(${AUTHOR_FIELDS})`)
      .eq("thread_id", id)
      .order("created_at"),
    supabase
      .from("threads")
      .select("id, title, reply_count")
      .eq("category_id", thread.category_id)
      .neq("id", id)
      .order("last_activity_at", { ascending: false })
      .limit(5),
    viewer
      ? supabase.from("category_follows").select("category_id").eq("user_id", viewer.id).eq("category_id", thread.category_id).maybeSingle()
      : null,
    getThreadMarks(supabase, viewer?.id, [id]),
    supabase.rpc("increment_thread_views", { p_thread_id: id }),
  ]);
  if (repliesRes.error) throw new Error(repliesRes.error.message);

  const replies = (repliesRes.data ?? []) as ReplyRow[];
  const answer = replies.find((r) => r.is_answer);
  const stats = (thread.stats as Metric[] | null) ?? [];
  const author = thread.author;
  const cat = thread.category;
  const isAuthor = viewer?.id === thread.author_id;

  return (
    <div className="wrap" style={{ paddingTop: 22, paddingBottom: 56 }}>
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#5E6B7E", flexWrap: "wrap" }}>
        <Link href="/forums" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5E6B7E" }}>
          <Icon name="back" size={16} strokeWidth={2.2} />
          Forums
        </Link>
        {cat && (
          <>
            <span aria-hidden="true">/</span>
            <Link href={`/forums?cat=${cat.id}`} style={{ color: "#5E6B7E" }}>
              {cat.name}
            </Link>
          </>
        )}
      </nav>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start", marginTop: 16 }}>
        <main style={{ flex: "999 1 640px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <article className="x-sec" style={thread.pinned ? { background: "#FFF8F3", borderColor: "#F8D9C5" } : undefined}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Avatar name={author?.full_name ?? "?"} color={author?.avatar_color ?? "#E6EBF3"} size={46} radius={15} fontSize={15} />
              <span style={{ flex: 1, minWidth: 180, lineHeight: 1.35 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 15 }}>
                  {author ? <Link href={`/u/${author.id}`}>{author.full_name}</Link> : "Former member"}
                  {author?.verified && <Verified />}
                </span>
                <span style={{ display: "block", fontSize: 13, color: "#5E6B7E" }}>
                  {author?.headline ? `${author.headline} · ` : ""}
                  Posted {timeAgo(thread.created_at)}
                </span>
              </span>
              {thread.pinned && (
                <span className="m-badge" style={{ color: "#B5440A", background: "#FFE7D7" }}>
                  Pinned
                </span>
              )}
              {thread.solved && (
                <span className="m-badge" style={{ color: "#17603F", background: "#DDF3E8" }}>
                  <Icon name="check" size={13} strokeWidth={3} />
                  Answered
                </span>
              )}
              {cat && (
                <Link href={`/forums?cat=${cat.id}`} className="m-badge" style={{ fontWeight: 700, color: cat.ink, background: cat.tint }}>
                  <Icon d={cat.icon} size={13} strokeWidth={2.4} />
                  {cat.name}
                </Link>
              )}
            </div>

            <h1 className="x-h1" style={{ margin: "18px 0 0", fontSize: 32, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-0.03em" }}>
              {thread.title}
            </h1>
            <div className="x-rich" style={{ marginTop: 16 }} dangerouslySetInnerHTML={{ __html: bodyToHtml(thread.body) }} />

            {stats.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
                {stats.map((s, i) => (
                  <span key={i} className="m-metric">
                    {s.l} <b style={{ color: s.c ?? "#0F1B2D" }}>{s.v}</b>
                  </span>
                ))}
              </div>
            )}
            {thread.tags.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
                {thread.tags.map((tag) => (
                  <span key={tag} className="m-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 20, paddingTop: 14, borderTop: "1px solid #EEF1F5", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#5E6B7E", display: "inline-flex", alignItems: "center", gap: 5, marginRight: 10 }}>
                <Icon name="eye" size={15} />
                {compact(thread.views + 1)} {thread.views + 1 === 1 ? "view" : "views"}
              </span>
              <a href="#replies" style={{ fontSize: 13, fontWeight: 700, color: "#1E2B3F" }}>
                {thread.reply_count} {thread.reply_count === 1 ? "reply" : "replies"}
              </a>
              <span style={{ marginLeft: "auto", display: "flex", gap: 2, flexWrap: "wrap" }}>
                <LikeButton threadId={thread.id} likes={thread.like_count} liked={marks.liked.has(thread.id)} />
                <SaveButton threadId={thread.id} saved={marks.saved.has(thread.id)} />
                <ShareButton />
                {isAuthor && <DeleteThreadButton threadId={thread.id} />}
              </span>
            </div>
          </article>

          {answer && (
            <a
              href={`#reply-${answer.id}`}
              style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#F5FBF8", border: "1px solid #CDEBDC", borderRadius: 20, padding: "18px 20px", color: "#0F1B2D" }}
            >
              <span style={{ width: 40, height: 40, borderRadius: 13, flex: "none", display: "grid", placeItems: "center", background: "#DDF3E8", color: "#16855A" }}>
                <Icon name="check" size={20} strokeWidth={2.6} />
              </span>
              <span style={{ minWidth: 0, lineHeight: 1.5 }}>
                <b style={{ display: "block", fontSize: 14, color: "#17603F" }}>
                  Accepted answer from {answer.author?.full_name ?? "a former member"}
                </b>
                <span style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: 14, color: "#334155" }}>
                  {answer.body}
                </span>
              </span>
            </a>
          )}

          <section id="replies" className="x-sec" style={{ scrollMarginTop: 90 }}>
            <h2 className="x-h2">
              {replies.length === 0 ? "No replies yet" : `${count(replies.length)} ${replies.length === 1 ? "reply" : "replies"}`}
            </h2>
            <p className="x-sub">
              {replies.length === 0 ? "Be the first to help. Real numbers and experience go a long way." : "Oldest first. Be kind and be specific."}
            </p>
            <div style={{ marginTop: 10 }}>
              {replies.map((r) => (
                <div key={r.id} id={`reply-${r.id}`} className="x-q" style={{ scrollMarginTop: 90, ...(r.is_answer ? { background: "#F5FBF8", margin: "0 -14px", padding: "20px 14px", borderRadius: 16 } : {}) }}>
                  <Avatar name={r.author?.full_name ?? "?"} color={r.author?.avatar_color ?? "#E6EBF3"} size={40} radius={13} fontSize={13} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 14 }}>
                      <b>{r.author ? <Link href={`/u/${r.author.id}`}>{r.author.full_name}</Link> : "Former member"}</b>
                      {r.author?.verified && <Verified size={15} />}
                      {r.author_id === thread.author_id && (
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#B5440A", background: "#FFE7D7", padding: "2px 7px", borderRadius: 6 }}>Author</span>
                      )}
                      <span style={{ color: "#5E6B7E" }}>
                        {r.author?.headline ? `${r.author.headline} · ` : ""}
                        {timeAgo(r.created_at)}
                      </span>
                      {r.is_answer && (
                        <span className="m-badge" style={{ color: "#17603F", background: "#DDF3E8", marginLeft: "auto" }}>
                          <Icon name="check" size={13} strokeWidth={3} />
                          Accepted answer
                        </span>
                      )}
                    </div>
                    <p className="x-p" style={{ marginTop: 6, color: "#1E2B3F" }}>
                      {r.body}
                    </p>
                    <div style={{ marginTop: 6 }}>
                      <ReplyActions
                        replyId={r.id}
                        threadId={thread.id}
                        isAnswer={r.is_answer}
                        canMark={isAuthor && r.author_id !== viewer?.id}
                        canDelete={viewer?.id === r.author_id}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, paddingTop: 20, borderTop: "1px solid #EEF1F5" }}>
              {viewer ? (
                <ReplyComposer threadId={thread.id} name={viewer.profile.full_name} color={viewer.profile.avatar_color} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "#F5F6FA", borderRadius: 16, padding: "16px 18px" }}>
                  <span style={{ flex: 1, minWidth: 220, fontSize: 14, lineHeight: 1.5, color: "#4A576B" }}>
                    <b style={{ display: "block", color: "#0F1B2D", fontSize: 15 }}>Join the conversation</b>
                    Log in or create a free account to reply.
                  </span>
                  <Link className="m-btn m-btn-o" href={`/login?next=/forums/${thread.id}`}>
                    Log in to reply
                  </Link>
                  <Link className="m-btn m-btn-s" href={`/signup?next=/forums/${thread.id}`}>
                    Join free
                  </Link>
                </div>
              )}
            </div>
          </section>
        </main>

        <aside style={{ flex: "1 1 320px", maxWidth: "100%", display: "flex", flexDirection: "column", gap: 16 }} aria-label="About this topic">
          {cat && (
            <div className="m-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="m-ic" style={{ width: 46, height: 46, borderRadius: 14, background: cat.tint }}>
                  <Icon d={cat.icon} size={22} stroke={cat.color} />
                </span>
                <span style={{ minWidth: 0, lineHeight: 1.3 }}>
                  <span style={{ display: "block", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5E6B7E" }}>{cat.group_name}</span>
                  <Link href={`/forums?cat=${cat.id}`} style={{ fontWeight: 800, fontSize: 17 }}>
                    {cat.name}
                  </Link>
                </span>
              </div>
              <p style={{ margin: "12px 0 16px", fontSize: 14, lineHeight: 1.55, color: "#4A576B" }}>{cat.description}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <FollowCategoryButton categoryId={cat.id} following={!!followRes?.data} label="Follow topic" />
                <Link className="m-btn m-btn-g" href={`/forums/new?cat=${cat.id}`}>
                  <Icon name="plus" size={16} strokeWidth={2.4} />
                  New discussion
                </Link>
              </div>
            </div>
          )}

          {(moreRes.data ?? []).length > 0 && (
            <div className="m-card" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800 }}>More in {cat?.name ?? "this topic"}</h3>
              {(moreRes.data ?? []).map((t) => (
                <Link key={t.id} className="m-trend" href={`/forums/${t.id}`}>
                  <span className="m-ic" style={{ width: 28, height: 28, borderRadius: 9, background: "#F3F5F9" }}>
                    <Icon name="chat" size={14} stroke="#DB520B" />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="m-tt" style={{ display: "block", fontSize: 14, fontWeight: 700, lineHeight: 1.4, color: "#0F1B2D" }}>
                      {t.title}
                    </span>
                    <span style={{ display: "block", fontSize: 12, color: "#5E6B7E", marginTop: 2 }}>
                      {t.reply_count === 0 ? "No replies yet" : `${t.reply_count} ${t.reply_count === 1 ? "reply" : "replies"}`}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}

          {!viewer && (
            <div className="m-promo">
              <svg width="160" height="120" viewBox="0 0 160 120" aria-hidden="true" style={{ position: "absolute", right: -20, bottom: -20 }}>
                <g fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="2">
                  <rect x="10" y="10" width="40" height="50" rx="6" />
                  <rect x="58" y="10" width="40" height="50" rx="6" />
                  <rect x="10" y="68" width="40" height="50" rx="6" />
                </g>
                <rect x="58" y="68" width="40" height="50" rx="6" fill="#F26B1D" fillOpacity="0.8" />
              </svg>
              <h3>New to self storage?</h3>
              <p style={{ maxWidth: 230 }}>Join free to ask questions, follow topics and get the best discussions every week.</p>
              <Link className="m-btn m-btn-o" href="/signup" style={{ position: "relative" }}>
                Create free account
              </Link>
            </div>
          )}

          <Link href="/guidelines" style={{ fontSize: 13, color: "#5E6B7E", padding: "0 4px" }}>
            Community guidelines
          </Link>
        </aside>
      </div>
    </div>
  );
}
