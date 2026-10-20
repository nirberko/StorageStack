import { Dashboard } from "@/components/home/Dashboard";
import { MarketingHome } from "@/components/home/MarketingHome";
import { getViewer } from "@/lib/auth";

// Members get their dashboard; visitors get the marketing home.
export default async function HomePage({ searchParams }: { searchParams: Promise<{ feed?: string }> }) {
  const viewer = await getViewer();
  if (!viewer) return <MarketingHome />;
  const { feed } = await searchParams;
  return <Dashboard viewer={viewer} feed={feed} />;
}
