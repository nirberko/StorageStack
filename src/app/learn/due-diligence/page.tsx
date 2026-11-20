import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ComingSoon, ExampleTag } from "@/components/static/ComingSoon";

export const metadata: Metadata = { title: "Due diligence checklist" };

const CHECKS = [
  { title: "Rent roll matches bank deposits", state: "done" },
  { title: "Roofs and doors inspected", state: "done" },
  { title: "Environmental report on the land", state: "now" },
  { title: "New competitors planned nearby", state: "next" },
] as const;

/** Placeholder until the due diligence checklist is built. */
export default function DueDiligencePage() {
  return (
    <ComingSoon
      title="Due diligence checklist, coming soon"
      text="What to check before you sign, from owners who learned the hard way. Until then, ask members what they would check on your deal."
      preview={
        <div className="cs-card ln-course" role="img" aria-label="An example due diligence checklist with two of four checks done">
          <div className="cs-card-head">
            <div className="ln-title">
              <span>Before you sign</span>
              <b>Riverside Self Storage</b>
            </div>
            <ExampleTag />
          </div>
          <div className="ln-progress" aria-hidden>
            <span style={{ width: "50%" }} />
          </div>
          <ol className="ln-lessons">
            {CHECKS.map((c, i) => (
              <li key={c.title} data-state={c.state}>
                <span className="ln-dot">{c.state === "done" ? <Icon d="M5 12l5 5L20 7" size={12} strokeWidth={3} stroke="#fff" /> : i + 1}</span>
                {c.title}
              </li>
            ))}
          </ol>
        </div>
      }
    >
      <Link className="m-btn m-btn-o" href="/forums?cat=acq">
        Ask about a deal
      </Link>
      <Link className="m-btn m-btn-line" href="/forums/1">
        Read the glossary
      </Link>
    </ComingSoon>
  );
}
