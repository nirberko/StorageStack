import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { NewThreadForm } from "@/components/forum/thread/NewThreadForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Start a discussion" };

const TIPS = [
  "Search first. Your question may already have a great answer.",
  "Share real numbers. Rounded or made-up figures get less useful replies.",
  "Say what you have already tried or ruled out.",
  "Keep addresses and personal details private.",
];

export default async function NewThreadPage({ searchParams }: { searchParams: Promise<{ cat?: string; title?: string }> }) {
  const { cat, title } = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort");

  return (
    <>
      <div className="wrap" style={{ paddingTop: 22 }}>
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#5E6B7E" }}>
          <Link href="/forums" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5E6B7E" }}>
            <Icon name="back" size={16} strokeWidth={2.2} />
            Forums
          </Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: "#0F1B2D" }}>Start a discussion</span>
        </nav>
        <h1 style={{ margin: "12px 0 0", fontSize: 36, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.03em" }}>Start a discussion</h1>
        <p style={{ marginTop: 8, fontSize: 16, color: "#5E6B7E" }}>Ask a question, share a deal for review or tell the story of something you learned.</p>
      </div>

      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 64, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <main style={{ flex: "999 1 560px", minWidth: 0 }}>
          <div className="m-card p-card" style={{ padding: "32px 36px" }}>
            <NewThreadForm categories={categories ?? []} initialCat={cat} initialTitle={title?.slice(0, 200)} />
          </div>
        </main>
        <aside style={{ flex: "1 1 300px", maxWidth: "100%", display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 90 }} aria-label="Tips">
          <div className="m-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="m-ic" style={{ background: "#FFEDE2" }}>
                <Icon name="bulb" size={17} stroke="#DB520B" />
              </span>
              <b style={{ fontSize: 15 }}>Get better answers</b>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
              {TIPS.map((tip) => (
                <span key={tip} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.5, color: "#4A576B" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#DB520B", marginTop: 8, flex: "none" }} />
                  {tip}
                </span>
              ))}
            </div>
          </div>
          <div className="m-note">
            <Icon name="shieldCheck" size={22} stroke="#B5440A" style={{ flex: "none" }} />
            <span>
              <b>Selling or raising money?</b>
              Post it in the <Link href="/deals/new" style={{ color: "#B5440A", fontWeight: 700 }}>Deal Room</Link> so the right investors and lenders see it. You can share it here for feedback too.
            </span>
          </div>
          <Link href="/guidelines" style={{ fontSize: 13, color: "#5E6B7E", padding: "0 4px" }}>
            Community guidelines
          </Link>
        </aside>
      </div>
    </>
  );
}
