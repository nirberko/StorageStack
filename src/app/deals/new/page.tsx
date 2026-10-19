import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PostDealWizard } from "@/components/deals/wizard/PostDealWizard";
import { getViewer } from "@/lib/auth";

export const metadata: Metadata = { title: "Post a deal" };

export default async function PostDealPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/deals/new");

  return (
    <PostDealWizard
      viewer={{ id: viewer.id, name: viewer.profile.full_name, color: viewer.profile.avatar_color }}
    />
  );
}
