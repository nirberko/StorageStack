import type { Metadata } from "next";
import { InfoCard, InfoPage } from "@/components/static/InfoPage";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  return (
    <InfoPage kicker="Tools" title="Run the numbers" intro="Simple calculators for the questions members ask most. Until they are ready, the forum is the fastest way to get a second opinion on your math.">
      <div className="d-grid">
        <InfoCard soon title="Deal calculator" text="Price, income and expenses in; cap rate, price per square foot and cash flow out." href="/forums?cat=acq" cta="Ask about a deal in the forum" />
        <InfoCard soon title="Market check" text="Square feet per person, population growth and nearby competitors for any 3- or 5-mile area." href="/forums?cat=feas" cta="Browse market research" />
        <InfoCard soon title="Rent increase planner" text="Model increases for current tenants and see how move-outs change your income." href="/forums?cat=rev" cta="Browse pricing discussions" />
        <InfoCard soon title="Loan sizer" text="How much a bank or SBA loan could cover, and what the payments look like." href="/forums?cat=fin" cta="Browse financing discussions" />
      </div>
    </InfoPage>
  );
}
