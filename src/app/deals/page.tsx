import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon, ExampleTag } from "@/components/static/ComingSoon";

export const metadata: Metadata = { title: "Deal Room" };

/** Placeholder until the Deal Room opens. The first version lists off-market facilities only. */
export default function DealRoomPage() {
  return (
    <ComingSoon
      title="Off-market deals, coming soon"
      text="Members and brokers will post self storage facilities for sale before they hit the market. Until it opens, share and check deals in the forum."
      preview={<ListingStack />}
    >
      <Link className="m-btn m-btn-o" href="/forums?cat=acq">
        Browse deals in the forum
      </Link>
      <Link className="m-btn m-btn-line" href="/forums/new">
        Share a deal
      </Link>
    </ComingSoon>
  );
}

/** Three listing cards in a loose stack: the front one is an example off-market listing, the two behind it are blank. */
function ListingStack() {
  return (
    <div className="dr-stack" aria-label="An example off-market listing: a 412-unit facility in Boise, Idaho, asking 3.2 million dollars at a 7.0% cap rate" role="img">
      <div className="dr-card dr-back dr-back-1" aria-hidden />
      <div className="dr-card dr-back dr-back-2" aria-hidden />
      <div className="dr-card dr-front">
        <div className="dr-photo">
          <span className="dr-off">Off market</span>
          <ExampleTag />
        </div>
        <div className="dr-body">
          <b>Riverside Self Storage</b>
          <span>Boise, ID · 412 units · 58,000 sq ft</span>
          <div className="dr-nums">
            <span>
              <b>$3.2M</b> asking
            </span>
            <span>
              <b className="dr-cap">7.0%</b> cap rate
            </span>
            <span>
              <b>91%</b> full
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
