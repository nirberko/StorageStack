import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteTopic } from "@/components/admin/TopicActions";
import { TopicForm } from "@/components/admin/TopicForm";
import { Icon } from "@/components/Icon";
import { requireAdmin } from "@/lib/auth";
import { TOPIC_GROUPS } from "@/lib/config";
import { plural } from "@/lib/format";
import { getCategories } from "@/lib/queries/forum";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit topic" };

export default async function EditTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/admin/topics/${id}`);
  const supabase = await createClient();
  const categories = await getCategories(supabase);
  const topic = categories.find((c) => c.id === id);
  if (!topic) notFound();
  const { topics: discussions, ...fields } = topic;
  const others = TOPIC_GROUPS.flatMap((g) => categories.filter((c) => c.group_name === g && c.id !== id));

  return (
    <>
      <section className="x-sec">
        <Link href="/admin/topics" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#5E6B7E" }}>
          <Icon name="arrowLeft" size={15} />
          All topics
        </Link>
        <h2 className="x-h2" style={{ marginTop: 12 }}>
          Edit {topic.name}
        </h2>
        <p className="x-sub" style={{ marginBottom: 22 }}>
          {plural(discussions, "discussion")} ·{" "}
          <Link href={`/forums?cat=${topic.id}`} style={{ color: "var(--orange)", fontWeight: 700 }}>
            View in forums
          </Link>
        </p>
        <TopicForm key={topic.id} topic={fields} />
      </section>
      <section className="x-sec">
        <h2 className="x-h2">Delete topic</h2>
        <p className="x-sub" style={{ marginBottom: 18 }}>
          {discussions > 0
            ? "Its discussions are kept and moved to the topic you pick."
            : "This topic has no discussions, so nothing else changes."}
        </p>
        <DeleteTopic id={topic.id} name={topic.name} discussions={discussions} others={others} />
      </section>
    </>
  );
}
