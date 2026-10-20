import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { NextUp, ShareProfileButton } from "@/components/home/ProfileClient";
import { count, plural } from "@/lib/format";
import { profileBadges, profileProgress, type ProfileFacts } from "@/lib/profileProgress";
import type { Profile } from "@/lib/types";

type Props = { profile: Profile; facts: ProfileFacts; followers: number; following: number };

export function ProfileCard({ profile: p, facts, followers, following }: Props) {
  const progress = profileProgress(facts);
  const badges = profileBadges(facts);

  return (
    <section className="m-card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }} aria-labelledby="profile-title">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="m-ic" style={{ width: 40, height: 40, borderRadius: 12, background: "#FFEDE2" }}>
          <Icon name="trophy" size={19} stroke="#B5440A" />
        </span>
        <h2 id="profile-title" style={{ fontSize: 17, fontWeight: 800 }}>
          Your profile
        </h2>
        <span className="m-badge" style={{ color: "#0B1F3A", background: "#E6EBF3" }}>
          Level {progress.level}
        </span>
        <Link className="h-link" href={`/u/${p.id}`} style={{ marginLeft: "auto" }}>
          View ›
        </Link>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
          <span>{progress.points}% complete</span>
          <span style={{ color: "#5E6B7E" }}>{progress.points}/100 pts</span>
        </div>
        <div
          className="d-bar"
          role="progressbar"
          aria-label="Profile progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.points}
          style={{ marginTop: 8 }}
        >
          <span style={{ width: `${progress.points}%`, background: "#DB520B" }} />
        </div>
      </div>

      <div style={{ borderTop: "1px solid #EEF1F5", paddingTop: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Avatar name={p.full_name} color={p.avatar_color} size={56} radius={18} fontSize={18} />
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <b style={{ flex: 1, minWidth: 0, fontSize: 18, fontWeight: 800, overflowWrap: "anywhere" }}>{p.full_name}</b>
            <Link className="h-link" href="/settings">
              Edit
            </Link>
          </div>
          {p.headline ? (
            <span style={{ display: "block", fontSize: 14, color: "#4A576B" }}>{p.headline}</span>
          ) : (
            <Link className="h-link" href="/settings" style={{ minHeight: 32 }}>
              Add a headline
            </Link>
          )}
          <span style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px", marginTop: 6, fontSize: 13, color: "#5E6B7E" }}>
            {p.location && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon name="pin" size={14} />
                {p.location}
              </span>
            )}
            <span>{plural(followers, "follower")}</span>
            <span>{count(following)} following</span>
          </span>
        </div>
      </div>

      <ShareProfileButton profileId={p.id} name={p.full_name} />

      <div>
        <span className="h-eyebrow" style={{ marginBottom: 10 }}>
          Badges
        </span>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {badges.map((b) => (
            <li key={b.id} className={`h-badge${b.earned ? "" : " off"}`}>
              {b.earned && <Icon name="check" size={12} strokeWidth={3} />}
              {b.label}
              {!b.earned && <span className="sr-only"> (not earned yet)</span>}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ borderTop: "1px solid #EEF1F5", paddingTop: 4 }}>
        <NextUp steps={progress.steps} left={progress.left} />
      </div>
    </section>
  );
}
