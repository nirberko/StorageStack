import Link from "next/link";
import { Suspense } from "react";
import { getViewer } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { NavLinks } from "@/components/NavLinks";
import { SearchBox } from "@/components/SearchBox";
import { UserMenu } from "@/components/UserMenu";

export async function SiteHeader() {
  const viewer = await getViewer();
  return (
    <header className="m-header">
      <div className="wrap m-header-in">
        <Logo />
        <NavLinks />
        <Suspense fallback={<div className="m-search" />}>
          <SearchBox />
        </Suspense>
        {viewer ? (
          <UserMenu id={viewer.id} name={viewer.profile.full_name} color={viewer.profile.avatar_color} isAdmin={viewer.profile.is_admin} />
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            <Link className="m-btn m-btn-g" href="/login">
              Log in
            </Link>
            <Link className="m-btn m-btn-o" href="/signup">
              Join free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="m-footer">
      <div className="wrap m-footer-in">
        <span>StorageStack — the self storage community</span>
        <span>
          <Link href="/learn">About</Link> · <Link href="/guidelines">Guidelines</Link> · <Link href="/guidelines#privacy">Privacy</Link> ·{" "}
          <Link href="/guidelines#terms">Terms</Link>
        </span>
      </div>
    </footer>
  );
}
