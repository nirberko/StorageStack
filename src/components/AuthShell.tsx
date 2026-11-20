import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";

/**
 * The frame for the sign-in pages: the logo, the form centered in the left half,
 * a small footer, and the facility photo filling the right half (hidden on phones).
 */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="auth">
      <section className="auth-main">
        <Logo />
        <div className="auth-center">
          <div className="auth-box">
            <div>
              <h1 className="auth-title">{title}</h1>
              <p className="auth-sub">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
        <p className="auth-foot">
          © {new Date().getFullYear()} The Storage Network · <Link href="/guidelines">Guidelines</Link>
        </p>
      </section>
      <div className="auth-photo">
        <div className="auth-photo-in">
          <Image src="/auth/storage-office.jpg" alt="" fill priority sizes="50vw" unoptimized />
        </div>
      </div>
    </div>
  );
}
