import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AskForum } from "@/components/home/AskForum";
import { ForumFeed } from "@/components/home/ForumFeed";
import { Greeting } from "@/components/home/Greeting";
import { ProBanner, ProPerks } from "@/components/home/Pro";
import { ProfileCard } from "@/components/home/ProfileCard";
import { QuickAnalysis } from "@/components/home/QuickAnalysis";
import { YourDeals } from "@/components/home/YourDeals";
import { count, partOfDay, plural } from "@/lib/format";
import { getDashboard } from "@/lib/queries/home";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** "3 new replies on your discussions and 2 deal requests waiting for you." Parts that are 0 are left out. */
function summary(replies: number, requests: number): string {
  const parts = [
    replies > 0 && `${plural(replies, "new reply", "new replies")} on your discussions`,
    requests > 0 && `${plural(requests, "deal request")} waiting for you`,
  ].filter(Boolean);
  return parts.length ? `${parts.join(" and ")}.` : "Here's what's happening in the community.";
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
          <p style={{ marginTop: 8, fontSize: 16, color: "#5E6B7E" }}>{summary(d.repliesThisWeek, d.pending.count)}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="m-btn m-btn-line" href="/forums/new">
            <Icon name="plus" size={18} strokeWidth={2.4} />
            Start a discussion
          </Link>
          <Link className="m-btn m-btn-n" href="/deals/mine">
            My deals
            {d.pending.count > 0 && (
              <span className="h-count">
                {count(d.pending.count)}
                <span className="sr-only"> {d.pending.count === 1 ? "request" : "requests"} to approve</span>
              </span>
            )}
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

        <aside className="col-rail" style={{ flexBasis: 340 }} aria-label="Your profile and deals">
          <ProfileCard profile={p} facts={d.facts} followers={d.followers} following={d.following} />
          <YourDeals pending={d.pending} alerts={d.alerts} savedDeals={d.savedDeals} dealsPosted={d.facts.dealsPosted} />
        </aside>
      </div>
    </>
  );
}
