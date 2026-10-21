import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AskBar, AskForum } from "@/components/home/AskForum";
import { ForumFeed } from "@/components/home/ForumFeed";
import { Greeting } from "@/components/home/Greeting";
import { ProBanner, ProPerks } from "@/components/home/Pro";
import { ProfileCard } from "@/components/home/ProfileCard";
import { QuickAnalysis } from "@/components/home/QuickAnalysis";
import { PendingRow, YourDeals } from "@/components/home/YourDeals";
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
      {/* On phones this band turns navy (and so does the header above it), with the ask box in it. */}
      <div className="h-top">
        <div className="wrap h-top-in">
          <div className="h-top-text">
            <Greeting firstName={firstName} serverPart={partOfDay(etHour)} />
            {/* "New" means in the last 7 days: nothing tracks which replies a member has read. */}
            <p className="h-sum">{summary(d.repliesThisWeek, d.pending.count)}</p>
          </div>
          <AskBar />
          <div className="h-top-actions">
            <Link className="m-btn m-btn-line" href="/forums/new">
              <Icon name="plus" size={18} strokeWidth={2.4} />
              {/* Phones get the shorter label so both buttons fit side by side. */}
              <span className="m-hide-sm">Start a discussion</span>
              <span className="m-show-sm">New discussion</span>
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
      </div>

      <div className="wrap page-cols h-cols">
        <main className="col-main h-main" style={{ flexBasis: 640 }}>
          {/* Phones only: the requests card leads the page instead of waiting at the bottom in the rail. */}
          {d.pending.count > 0 && <PendingRow pending={d.pending} className="h-needs" />}
          <div className="h-grid2">
            <ProfileCard profile={p} facts={d.facts} followers={d.followers} following={d.following} />
            <AskForum items={d.ask} />
          </div>
          <QuickAnalysis />
          <ProBanner />
          <ForumFeed feed={d.feed} items={d.items} followsAnything={d.followsAnything} />
          <ProPerks />
        </main>

        <aside className="col-rail" style={{ flexBasis: 340 }} aria-label="Your deals">
          <YourDeals pending={d.pending} alerts={d.alerts} savedDeals={d.savedDeals} dealsPosted={d.facts.dealsPosted} />
        </aside>
      </div>
    </>
  );
}
