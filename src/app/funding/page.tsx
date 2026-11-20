import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon, ExampleTag } from "@/components/static/ComingSoon";

export const metadata: Metadata = { title: "Fund your deal" };

const LENDERS = [
  { name: "First Ridge Bank", kind: "SBA 7(a) · Purchase" },
  { name: "Summit Capital", kind: "Construction · Bridge" },
  { name: "Equity partner", kind: "Co-invest with an operator" },
];

/** Placeholder until the lender and partner directory is built. */
export default function FundingPage() {
  return (
    <ComingSoon
      title="Lenders and partners, coming soon"
      text="Meet lenders who already finance self storage, and partners with money who need someone to run the deal. Until then, ask the community about financing."
      preview={
        <div className="cs-card" role="img" aria-label="An example list of lenders who finance self storage">
          <div className="cs-card-head">
            <b>Lenders who finance storage</b>
            <ExampleTag />
          </div>
          <div>
            {LENDERS.map((l) => (
              <div key={l.name} className="fd-row">
                <b>{l.name}</b>
                <span>{l.kind}</span>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <Link className="m-btn m-btn-o" href="/forums?cat=fin">
        Ask about financing
      </Link>
      <Link className="m-btn m-btn-line" href="/forums/new?cat=fin">
        Post your deal
      </Link>
    </ComingSoon>
  );
}
