import { Dashboard } from "@/components/home/Dashboard";
import { Landing } from "@/components/landing/Landing";
import { getViewer } from "@/lib/auth";

// Members get their dashboard; visitors get the landing page.
export default async function HomePage() {
  const viewer = await getViewer();
  if (!viewer) return <Landing />;
  return <Dashboard viewer={viewer} />;
}
