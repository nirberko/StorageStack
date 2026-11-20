import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";

const CHECK = "M5 12l5 5L20 7";

/** One section per pain point from the landing page. Each opens its own page (a coming-soon page until the feature is built). */
const SECTIONS = [
  {
    label: "Deal Room",
    icon: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-3.5-3.5",
    title: "Find your next facility",
    text: "Off-market facilities posted by members and brokers, before they hit the market.",
    points: ["Alerts for the areas you care about", "Price, cap rate and occupancy up front"],
    cta: "Browse deals",
    href: "/deals",
    image: "/home/deals.webp",
    alt: "The Deal Room: a list of facilities for sale and an alert about a new off-market deal",
  },
  {
    label: "Lenders and partners",
    icon: "M3 6h18v13H3zM3 10h18",
    title: "Fund your deal",
    text: "Meet lenders who already finance self storage, and partners with money who need someone to run the deal.",
    points: ["SBA, bank, bridge and construction loans", "Message a lender directly"],
    cta: "Find a lender",
    href: "/funding",
    image: "/home/funding.webp",
    alt: "A list of lenders who finance self storage and a message from a lender",
  },
  {
    label: "Deal calculators",
    icon: "M5 3h14v18H5zM8 7h8M8 12h2M14 12h2M8 16h2M14 16h2",
    title: "Check the numbers",
    text: "Put in the price, income and costs. See the cap rate, price per square foot and loan size in a minute.",
    points: ["Buy, build, convert or expand", "Share your numbers for a second opinion"],
    cta: "Open the calculator",
    href: "/tools",
    image: "/home/calculator.webp",
    alt: "The deal calculator showing a 7.0% cap rate and a member's note",
  },
  {
    label: "Due diligence",
    icon: "M9 4h6v3H9zM7 5H5v16h14V5h-2M8.5 13l2.5 2.5 4.5-5",
    title: "Check before you sign",
    text: "A step-by-step checklist from owners who learned the hard way, so nothing gets missed.",
    points: ["Rent roll, deposits, roofs and land", "Track your progress on each deal"],
    cta: "Open the checklist",
    href: "/learn/due-diligence",
    image: "/home/checklist.webp",
    alt: "A due diligence checklist with two of four checks done",
  },
];

/** The four tool sections under the top row, picture and copy alternating sides. */
export function Toolkit() {
  return (
    <>
      {SECTIONS.map((s, i) => (
        <section key={s.href} className={`hm-card hm-sec${i % 2 ? " flip" : ""}`} aria-labelledby={`hm-sec-${i}`}>
          <div className="hm-copy">
            <span className="hm-kick">
              <span>
                <Icon d={s.icon} size={15} strokeWidth={2.2} />
              </span>
              {s.label}
            </span>
            <h3 id={`hm-sec-${i}`}>{s.title}</h3>
            <p>{s.text}</p>
            <ul className="hm-ticks">
              {s.points.map((pt) => (
                <li key={pt}>
                  <Icon d={CHECK} size={15} strokeWidth={2.6} stroke="var(--ds-primary)" />
                  {pt}
                </li>
              ))}
            </ul>
            <Link className="m-btn m-btn-n" href={s.href}>
              {s.cta}
              <Icon name="arrowRight" size={15} strokeWidth={2.4} />
            </Link>
          </div>
          <Image className="hm-shot" src={s.image} alt={s.alt} width={720} height={528} sizes="340px" unoptimized />
        </section>
      ))}
    </>
  );
}
