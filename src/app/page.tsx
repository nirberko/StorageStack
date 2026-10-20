import { Dashboard } from "@/components/home/Dashboard";
import { Landing } from "@/components/landing/Landing";
import { getViewer } from "@/lib/auth";

// Members get their dashboard; visitors get the landing page.
export default async function HomePage({ searchParams }: { searchParams: Promise<{ feed?: string }> }) {
  const viewer = await getViewer();
  if (!viewer) return <Landing />;
  const { feed } = await searchParams;
  return <Dashboard viewer={viewer} feed={feed} />;
}
