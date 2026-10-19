"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleDealRequest } from "@/app/actions/deals";

type DealState = {
  dealId: number;
  own: boolean;
  requested: boolean;
  /** Whether the viewer had already requested when the page was rendered. */
  initiallyRequested: boolean;
  amountK: number;
  setAmountK: (k: number) => void;
  scenario: string;
  setScenario: (id: string) => void;
  toggleRequest: () => void;
  pending: boolean;
  error: string | null;
};

const Ctx = createContext<DealState | null>(null);

/**
 * Shared state for one deal page: the viewer's request (shown in the rail, the documents
 * section and the header) and the amount and scenario picked in the return calculator.
 */
export function DealProvider({
  dealId, own, requested, amountK, scenario, children,
}: { dealId: number; own: boolean; requested: boolean; amountK: number; scenario: string; children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [req, setReq] = useState(requested);
  const [amount, setAmount] = useState(amountK);
  const [scen, setScen] = useState(scenario);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggleRequest() {
    const next = !req;
    setReq(next);
    start(async () => {
      const res = await toggleDealRequest(dealId, next, "", amount * 1000);
      if (res.ok) {
        setError(null);
        return;
      }
      setReq(!next);
      if (res.needsLogin) router.push(`/login?next=${encodeURIComponent(path)}`);
      else setError(res.error);
    });
  }

  return (
    <Ctx.Provider
      value={{
        dealId, own, requested: req, initiallyRequested: requested, amountK: amount, setAmountK: setAmount,
        scenario: scen, setScenario: setScen, toggleRequest, pending, error,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useDeal(): DealState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDeal must be used inside <DealProvider>");
  return v;
}

/** "N interested" that follows the viewer's own request. */
export function InterestCount({ base, suffix }: { base: number; suffix: string }) {
  const d = useDeal();
  const n = base - (d.initiallyRequested ? 1 : 0) + (d.requested ? 1 : 0);
  return (
    <>
      {n} {suffix}
    </>
  );
}
