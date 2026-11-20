import type { Metadata } from "next";
import { InfoCard, InfoPage } from "@/components/static/InfoPage";

export const metadata: Metadata = { title: "Deal Room" };

/** Placeholder until the Deal Room is built. The nav keeps linking here. */
export default function DealRoomPage() {
  return (
    <InfoPage
      kicker="Coming soon"
      title="The Deal Room is on its way"
      intro="A place for members to post facilities for sale, capital raises, partnerships and loan requests. Until it opens, the forums are the best place to get feedback on a deal."
    >
      <div className="d-grid">
        <InfoCard soon title="Facilities for sale" text="Existing facilities, land and portfolios, many of them off-market." href="/forums?cat=acq" cta="Browse Buying a Facility" />
        <InfoCard soon title="Capital raises" text="Sponsors looking for investors for a purchase or a project." href="/forums?cat=fin" cta="Browse financing discussions" />
        <InfoCard soon title="Partners and loans" text="Find an operator, a co-signer or a lender for your next deal." href="/forums/new" cta="Ask the community" />
      </div>
    </InfoPage>
  );
}
