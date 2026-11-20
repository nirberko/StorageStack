import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AskForum } from "@/components/home/AskForum";
import { Greeting } from "@/components/home/Greeting";
import { HomeProfile } from "@/components/home/HomeProfile";
import { Toolkit } from "@/components/home/Toolkit";
import { partOfDay, plural } from "@/lib/format";
import { getDashboard } from "@/lib/queries/home";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** "3 new replies on your discussions." or a generic line when there are none. */
function summary(replies: number): string {
  return replies > 0 ? `${plural(replies, "new reply", "new replies")} on your discussions.` : "Here's what's happening in the community.";
}

/** The signed-in home page: greeting, the ask box and profile card, then one section per tool. */
export async function Dashboard({ viewer }: { viewer: { id: string; profile: Profile } }) {
  const supabase = await createClient();
  const d = await getDashboard(supabase, viewer);
  const p = viewer.profile;
  const firstName = p.full_name.trim().split(/\s+/)[0] || "there";
  // The browser swaps in its own clock; until then use Eastern time, like event times elsewhere.
  const etHour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "America/New_York" }).format(new Date()));

  return (
    <div className="wrap hm">
      <div className="hm-top">
        <div>
          <Greeting firstName={firstName} serverPart={partOfDay(etHour)} />
          {/* "New" means in the last 7 days: nothing tracks which replies a member has read. */}
          <p className="hm-sub">{summary(d.repliesThisWeek)}</p>
        </div>
        <Link className="m-btn m-btn-o" href="/forums/new">
          <Icon name="plus" size={16} strokeWidth={2.4} />
          Start a discussion
        </Link>
      </div>

      <div className="hm-row">
        <AskForum items={d.ask} />
        <HomeProfile profile={p} facts={d.facts} followers={d.followers} />
      </div>

      <Toolkit />
    </div>
  );
}
