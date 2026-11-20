import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ComingSoon, ExampleTag } from "@/components/static/ComingSoon";

export const metadata: Metadata = { title: "Learn" };

const LESSONS = [
  { title: "Pick a market", state: "done" },
  { title: "Read a rent roll", state: "now" },
  { title: "Check the seller's numbers", state: "next" },
  { title: "Get to closing", state: "next" },
] as const;

/** Placeholder until courses are ready. The free guides that already exist stay one click away. */
export default function LearnPage() {
  return (
    <ComingSoon
      title="Courses, coming soon"
      text="Short, practical lessons from owners and operators, from your first market to your first facility. Start with the free guides today."
      preview={<CoursePreview />}
      more={
        <>
          Also free: <Link href="/forums?cat=start">Getting started</Link> · <Link href="/search?q=recap">Case studies</Link>
        </>
      }
    >
      <Link className="m-btn m-btn-o" href="/forums/1">
        Read the glossary
      </Link>
      <Link className="m-btn m-btn-line" href="/forums?cat=acq">
        Buying your first facility
      </Link>
    </ComingSoon>
  );
}

/** An example course: four lessons, the first done and the second in progress. */
function CoursePreview() {
  return (
    <div className="cs-card ln-course" role="img" aria-label="An example course, Buying your first facility: four lessons, one done and one in progress">
      <div className="cs-card-head">
        <div className="ln-title">
          <span>Course</span>
          <b>Buying your first facility</b>
        </div>
        <ExampleTag />
      </div>
      <div className="ln-progress" aria-hidden>
        <span style={{ width: "38%" }} />
      </div>
      <ol className="ln-lessons">
        {LESSONS.map((l, i) => (
          <li key={l.title} data-state={l.state}>
            <span className="ln-dot">{l.state === "done" ? <Icon d="M5 12l5 5L20 7" size={12} strokeWidth={3} stroke="#fff" /> : i + 1}</span>
            {l.title}
          </li>
        ))}
      </ol>
    </div>
  );
}
