import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AskForum } from "@/components/home/AskForum";
import { ForumFeed } from "@/components/home/ForumFeed";
import { Greeting } from "@/components/home/Greeting";
import { ProBanner, ProPerks } from "@/components/home/Pro";
import { ProfileCard } from "@/components/home/ProfileCard";
import { QuickAnalysis } from "@/components/home/QuickAnalysis";
import { partOfDay, plural } from "@/lib/format";
import { getDashboard } from "@/lib/queries/home";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** "3 new replies on your discussions." or a generic line when there are none. */
function summary(replies: number): string {
  return replies > 0 ? `${plural(replies, "new reply", "new replies")} on your discussions.` : "Here's what's happening in the community.";
}

/** The signed-in home page. */
export async function Dashboard({ viewer, feed }: { viewer: { id: string; profile: Profile }; feed?: string }) {
  const supabase = await createClient();
  const d = await getDashboard(supabase, viewer, feed);
  const p = viewer.profile;
  const firstName = p.full_name.trim().split(/\s+/)[0] || "there";
  // The browser swaps in its own clock; until then use Eastern time, like event times elsewhere.
  const etHour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "America/New_York" }).format(new Date()));

  return (
    <>
      <div className="wrap" style={{ paddingTop: 28, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <Greeting firstName={firstName} serverPart={partOfDay(etHour)} />
          {/* "New" means in the last 7 days: nothing tracks which replies a member has read. */}
          <p style={{ marginTop: 8, fontSize: 16, color: "#5E6B7E" }}>{summary(d.repliesThisWeek)}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="m-btn m-btn-line" href="/forums/new">
            <Icon name="plus" size={18} strokeWidth={2.4} />
            Start a discussion
          </Link>
        </div>
      </div>

      <div className="wrap page-cols">
        <main className="col-main" style={{ flexBasis: 640, gap: 24 }}>
          <div className="h-grid2">
            <QuickAnalysis />
            <AskForum items={d.ask} />
          </div>
          <ProBanner />
          <ForumFeed feed={d.feed} items={d.items} followsAnything={d.followsAnything} />
          <ProPerks />
        </main>

        <aside className="col-rail" style={{ flexBasis: 340 }} aria-label="Your profile">
          <ProfileCard profile={p} facts={d.facts} followers={d.followers} following={d.following} />
        </aside>
      </div>
    </>
  );
}
