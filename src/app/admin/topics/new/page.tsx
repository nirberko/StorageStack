import type { Metadata } from "next";
import Link from "next/link";
import { TopicForm } from "@/components/admin/TopicForm";
import { Icon } from "@/components/Icon";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "New topic" };

export default async function NewTopicPage() {
  await requireAdmin("/admin/topics/new");
  return (
    <section className="x-sec">
      <Link href="/admin/topics" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#5E6B7E" }}>
        <Icon name="arrowLeft" size={15} />
        All topics
      </Link>
      <h2 className="x-h2" style={{ marginTop: 12 }}>
        New topic
      </h2>
      <p className="x-sub" style={{ marginBottom: 22 }}>
        It shows up in the forums right away. New topics go to the end of their section.
      </p>
      <TopicForm />
    </section>
  );
}
