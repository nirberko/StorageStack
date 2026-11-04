import type { Metadata } from "next";
import { InfoCard, InfoPage } from "@/components/static/InfoPage";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  return (
    <InfoPage kicker="Tools" title="Run the numbers" intro="Simple calculators for the questions members ask most. For a second opinion on your math, ask in the forums.">
      <div className="d-grid">
        <InfoCard title="Mortgage calculator" text="Loan amount, rate and amortization in; monthly payment, balloon balance and debt service coverage out." href="/tools/mortgage" cta="Open the calculator" />
        <InfoCard soon title="Quick Deal Analyzer" text="Revenue and expenses in; net operating income and an offer range out." href="/forums?cat=acq" cta="Ask about a deal in the forum" />
        <InfoCard soon title="Market check" text="Square feet per person, population growth and nearby competitors for any 3- or 5-mile area." href="/forums?cat=feas" cta="Browse market research" />
        <InfoCard soon title="Rent increase planner" text="Model increases for current tenants and see how move-outs change your income." href="/forums?cat=rev" cta="Browse pricing discussions" />
      </div>
    </InfoPage>
  );
}
