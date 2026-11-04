import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/static/InfoPage";
import { MortgageCalculator } from "@/components/tools/MortgageCalculator";

export const metadata: Metadata = {
  title: "Mortgage calculator",
  description: "Estimate the monthly payment, balloon balance and debt service coverage on a self storage loan.",
};

export default function MortgagePage() {
  return (
    <InfoPage
      kicker="Tools"
      title="Mortgage calculator"
      intro="Estimate the payment on a facility loan. Add a loan term to see the balloon balance, and your net operating income to see if the deal covers the debt."
    >
      <Link href="/tools" className="h-link" style={{ alignSelf: "flex-start", minHeight: 32 }}>
        ‹ All tools
      </Link>
      <MortgageCalculator />
      <p className="x-sub" style={{ maxWidth: 760 }}>
        Estimates only, for a fixed-rate loan with monthly payments. Taxes, insurance, fees and rate changes are not included. Ask your lender for real terms.
      </p>
    </InfoPage>
  );
}
