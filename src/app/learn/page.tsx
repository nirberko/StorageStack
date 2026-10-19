import type { Metadata } from "next";
import { InfoCard, InfoPage } from "@/components/static/InfoPage";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  return (
    <InfoPage kicker="Learn" title="Learn self storage" intro="StorageStack is a community for people buying, building and running self storage. Start with the basics, then learn from members who have done it.">
      <div className="d-grid">
        <InfoCard title="The self storage glossary" text="Occupancy, cap rate, street rate, NOI and square feet per person, explained in plain English." href="/forums/1" cta="Read the glossary" />
        <InfoCard title="Getting started" text="New to storage? Ask anything. No question is too basic." href="/forums?cat=start" cta="Browse Getting Started" />
        <InfoCard title="Buying your first facility" text="Finding deals, checking the seller's numbers and getting to closing." href="/forums?cat=acq" cta="Browse Buying a Facility" />
        <InfoCard title="Case studies" text="Real projects with real numbers, posted by the members who did them." href="/search?q=recap" cta="Find case studies" />
        <InfoCard soon title="Courses" text="Short, practical lessons from experienced operators and developers." />
      </div>
    </InfoPage>
  );
}
