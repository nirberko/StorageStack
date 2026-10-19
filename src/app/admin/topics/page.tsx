import type { Metadata } from "next";
import Link from "next/link";
import { MoveTopic } from "@/components/admin/TopicActions";
import { Icon } from "@/components/Icon";
import { requireAdmin } from "@/lib/auth";
import { TOPIC_GROUPS } from "@/lib/config";
import { plural } from "@/lib/format";
import { getCategories } from "@/lib/queries/forum";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Forum topics" };

export default async function AdminTopicsPage() {
  await requireAdmin("/admin/topics");
  const supabase = await createClient();
  const categories = await getCategories(supabase);
  const other = categories.filter((c) => !TOPIC_GROUPS.includes(c.group_name));
  const sections = [
    ...TOPIC_GROUPS.map((g) => ({ name: g, hint: "", items: categories.filter((c) => c.group_name === g) })),
    ...(other.length ? [{ name: "Not shown", hint: "These topics are in a section the forums do not show. Edit them to pick a section.", items: other }] : []),
  ];

  return (
    <>
      <div className="m-card" style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 260px" }}>
          <h2 className="x-h2">Forum topics</h2>
          <p className="x-sub">Topics appear in the forum sidebar and in the topic picker when members start a discussion.</p>
        </div>
        <Link className="m-btn m-btn-o" href="/admin/topics/new">
          <Icon name="plus" size={18} strokeWidth={2.4} />
          New topic
        </Link>
      </div>

      {sections.map((s, n) => (
        <section key={s.name} className="m-card" aria-labelledby={`sec-${n}`} style={{ padding: "8px 0" }}>
          <h3 id={`sec-${n}`} className="m-sec" style={{ padding: "12px 22px 6px" }}>
            {s.name}
          </h3>
          {s.hint && <p className="x-sub" style={{ padding: "0 22px 8px" }}>{s.hint}</p>}
          {s.items.length === 0 ? (
            <p className="x-sub" style={{ padding: "4px 22px 14px" }}>
              No topics in this section.
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {s.items.map((c, i) => (
                <li key={c.id} className="a-row">
                  <span className="m-ic" style={{ width: 44, height: 44, borderRadius: 14, background: c.tint }}>
                    <Icon d={c.icon} size={20} stroke={c.color} />
                  </span>
                  <div style={{ flex: "1 1 240px", minWidth: 0, lineHeight: 1.35 }}>
                    <Link href={`/forums?cat=${c.id}`} style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)" }}>
                      {c.name}
                    </Link>
                    <span className="a-meta">{c.description || "No description"}</span>
                    <span className="a-meta">
                      {plural(c.topics, "discussion")} · /forums?cat={c.id}
                    </span>
                  </div>
                  <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                    <MoveTopic id={c.id} name={c.name} first={i === 0} last={i === s.items.length - 1} />
                    <Link className="m-btn m-btn-line" href={`/admin/topics/${c.id}`} style={{ minHeight: 40, padding: "0 14px", fontSize: 14 }}>
                      Edit
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}
