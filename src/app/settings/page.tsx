import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { getViewer } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/settings");
  const p = viewer.profile;

  return (
    <div className="wrap" style={{ paddingTop: 22, paddingBottom: 64 }}>
      <h1 style={{ fontSize: 36, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.03em" }}>Settings</h1>
      <p style={{ marginTop: 8, fontSize: 16, color: "#5E6B7E" }}>How you appear to other members.</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start", marginTop: 24 }}>
        <main style={{ flex: "999 1 560px", minWidth: 0 }}>
          <section className="x-sec">
            <h2 className="x-h2">Your profile</h2>
            <p className="x-sub" style={{ marginBottom: 22 }}>
              Members see this on your posts, deals and profile page.
            </p>
            <ProfileForm profile={p} email={viewer.email} />
          </section>
        </main>
        <aside style={{ flex: "1 1 300px", maxWidth: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="m-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={p.full_name} color={p.avatar_color} size={52} radius={16} fontSize={16} />
              <span style={{ minWidth: 0, lineHeight: 1.35 }}>
                <b style={{ display: "block", fontSize: 16 }}>{p.full_name}</b>
                <span style={{ fontSize: 13, color: "#5E6B7E" }}>{p.headline || "No headline yet"}</span>
              </span>
            </div>
            <Link className="m-btn m-btn-s" href={`/u/${p.id}`} style={{ width: "100%", marginTop: 16 }}>
              View your profile
            </Link>
          </div>
          {!p.verified && (
            <div className="m-note">
              <Icon name="shieldCheck" size={22} stroke="#B5440A" style={{ flex: "none" }} />
              <span>
                <b>Get verified</b>
                Verified members get an orange check and can see full details on deals shared with all verified members. Verification is done by the Storage Network team.
              </span>
            </div>
          )}
          <form action={signOut}>
            <button className="m-btn m-btn-line" type="submit" style={{ width: "100%" }}>
              <Icon name="logout" />
              Log out
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
