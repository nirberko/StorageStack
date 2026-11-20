import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { plural } from "@/lib/format";
import { profileProgress, type ProfileFacts } from "@/lib/profileProgress";
import type { Profile } from "@/lib/types";

/** The member's card on the home page: who they are, how complete the profile is, and the next three steps. */
export function HomeProfile({ profile: p, facts, followers }: { profile: Profile; facts: ProfileFacts; followers: number }) {
  const progress = profileProgress(facts);
  const next = progress.steps.filter((s) => !s.done).slice(0, 3);

  return (
    <section className="hm-card hm-profile" aria-labelledby="hm-profile-title">
      <div className="hm-head">
        <Avatar name={p.full_name} color={p.avatar_color} size={40} radius={20} fontSize={14} />
        <div style={{ minWidth: 0 }}>
          <h2 id="hm-profile-title">{p.full_name}</h2>
          <span className="hm-meta">
            Level {progress.level} · {plural(followers, "follower")}
          </span>
        </div>
        <Link className="hm-more" href={`/u/${p.id}`}>
          View
        </Link>
      </div>

      <div>
        <div className="hm-progress-row">
          <b>Profile {progress.points}% complete</b>
          <span>{progress.points} / 100 pts</span>
        </div>
        <div className="hm-bar" role="progressbar" aria-label="Profile progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.points}>
          <span style={{ width: `${progress.points}%` }} />
        </div>
      </div>

      {next.length > 0 ? (
        <div>
          {next.map((s) => (
            <Link key={s.id} className="hm-step" href={s.href}>
              <i aria-hidden />
              {s.label}
              <em>+{s.points}</em>
            </Link>
          ))}
        </div>
      ) : (
        <p className="hm-meta">Your profile is complete. Nice work.</p>
      )}
    </section>
  );
}
