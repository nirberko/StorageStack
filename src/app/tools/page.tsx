import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon, ExampleTag } from "@/components/static/ComingSoon";

export const metadata: Metadata = { title: "Tools" };

/** Placeholder until the calculators are built. */
export default function ToolsPage() {
  return (
    <ComingSoon
      title="Deal calculators, coming soon"
      text="Check a deal in minutes: cap rate, price per square foot, loan size and cash flow. Until then, post your numbers and members will check your math."
      preview={<CalculatorPreview />}
    >
      <Link className="m-btn m-btn-o" href="/forums/new">
        Post your numbers
      </Link>
      <Link className="m-btn m-btn-line" href="/forums?cat=fin">
        Browse financing
      </Link>
    </ComingSoon>
  );
}

/** An example deal calculator: two inputs and the cap rate they give. */
function CalculatorPreview() {
  return (
    <div className="cs-card tl-calc" role="img" aria-label="An example deal calculator: an asking price of 3.2 million dollars and net income of 224 thousand dollars give a 7.0% cap rate">
      <div className="cs-card-head">
        <b>Deal calculator</b>
        <ExampleTag />
      </div>
      <div className="tl-fields">
        <div className="tl-field">
          <span>Asking price</span>
          <b>$3,200,000</b>
        </div>
        <div className="tl-field">
          <span>Net operating income</span>
          <b>$224,000</b>
        </div>
      </div>
      <div className="tl-result">
        <div>
          <span>Cap rate</span>
          <b className="tl-big">7.0%</b>
        </div>
        <div>
          <span>Price per sq ft</span>
          <b>$64</b>
        </div>
      </div>
    </div>
  );
}
