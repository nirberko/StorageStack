// Mortgage math for the calculator at /tools/mortgage. Pure functions, monthly payments,
// fixed rate. Commercial storage loans often amortize over 20 to 30 years but come due
// sooner, so the balance left at the end of the term (the balloon) is worked out too.

export type MortgageInput = {
  /** Purchase price in dollars. */
  price: number;
  /** Down payment as a percent of the price, 0 to 100. */
  downPct: number;
  /** Annual interest rate in percent, e.g. 7.25. */
  ratePct: number;
  /** Years the loan is paid off over. */
  amortYears: number;
  /** Years until the loan comes due, if sooner than the amortization. Null means no balloon. */
  termYears: number | null;
  /** Annual net operating income, to work out the debt service coverage ratio. Optional. */
  noi: number | null;
};

export type YearRow = { year: number; payments: number; interest: number; principal: number; balance: number };

export type MortgageResult = {
  downPayment: number;
  loan: number;
  monthlyPayment: number;
  annualDebtService: number;
  /** Interest paid if the loan runs its full amortization. */
  totalInterest: number;
  /** Balance due at the end of the term, or null with no balloon. */
  balloon: number | null;
  /** NOI divided by annual debt service, or null without NOI or a loan. */
  dscr: number | null;
  /** One row per year, up to the term (or the full amortization with no balloon). */
  schedule: YearRow[];
};

/** Monthly payment that pays off `loan` over `months` at `monthlyRate`. */
export function monthlyPayment(loan: number, monthlyRate: number, months: number): number {
  if (loan <= 0 || months <= 0) return 0;
  if (monthlyRate === 0) return loan / months;
  return (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

/** Balance left after `paid` monthly payments. */
export function balanceAfter(loan: number, monthlyRate: number, payment: number, paid: number): number {
  if (monthlyRate === 0) return Math.max(0, loan - payment * paid);
  const g = Math.pow(1 + monthlyRate, paid);
  return Math.max(0, loan * g - (payment * (g - 1)) / monthlyRate);
}

/** True when every input is a usable number in range. */
export function isValid(i: MortgageInput): boolean {
  return (
    Number.isFinite(i.price) && i.price > 0 &&
    Number.isFinite(i.downPct) && i.downPct >= 0 && i.downPct <= 100 &&
    Number.isFinite(i.ratePct) && i.ratePct >= 0 && i.ratePct <= 50 &&
    Number.isFinite(i.amortYears) && i.amortYears >= 1 && i.amortYears <= 40 &&
    (i.termYears === null || (Number.isFinite(i.termYears) && i.termYears >= 1)) &&
    (i.noi === null || (Number.isFinite(i.noi) && i.noi >= 0))
  );
}

export function calculate(i: MortgageInput): MortgageResult {
  const downPayment = (i.price * i.downPct) / 100;
  const loan = i.price - downPayment;
  const r = i.ratePct / 100 / 12;
  const n = Math.round(i.amortYears * 12);
  const pay = monthlyPayment(loan, r, n);
  const annualDebtService = pay * 12;

  // A term as long as the amortization (or longer) has nothing left to pay at the end.
  const balloonMonths = i.termYears !== null && i.termYears * 12 < n ? Math.round(i.termYears * 12) : null;
  const scheduleYears = Math.ceil((balloonMonths ?? n) / 12);

  const schedule: YearRow[] = [];
  let start = loan;
  for (let y = 1; y <= scheduleYears; y++) {
    const months = Math.min(12, (balloonMonths ?? n) - (y - 1) * 12);
    const end = balanceAfter(loan, r, pay, (y - 1) * 12 + months);
    const principal = start - end;
    const payments = pay * months;
    schedule.push({ year: y, payments, interest: payments - principal, principal, balance: end });
    start = end;
  }

  return {
    downPayment,
    loan,
    monthlyPayment: pay,
    annualDebtService,
    totalInterest: pay * n - loan,
    balloon: balloonMonths === null ? null : balanceAfter(loan, r, pay, balloonMonths),
    dscr: i.noi !== null && annualDebtService > 0 ? i.noi / annualDebtService : null,
    schedule,
  };
}
