import Link from "next/link";

const NAVY = "#0B1F3A";
const ORANGE = "#F26B1D";

// Three stacked boxes (bottom, middle, top) on a 64×64 grid: [x, y, width].
const BOXES = [
  { x: 6, y: 42, w: 52, fill: NAVY, tape: "#516074" },
  { x: 13, y: 24, w: 38, fill: NAVY, tape: "#516074" },
  { x: 20, y: 6, w: 24, fill: ORANGE, tape: "#F3955F" },
];
const H = 16;
const R = 3.5;
const LID = 4.1; // lid height; the gap below it is the lid seam
const BODY = 5.9;

function Box({ x, y, w, fill, tape }: (typeof BOXES)[number]) {
  const lid = `M${x} ${y + LID}V${y + R}A${R} ${R} 0 0 1 ${x + R} ${y}H${x + w - R}A${R} ${R} 0 0 1 ${x + w} ${y + R}V${y + LID}Z`;
  const body = `M${x} ${y + BODY}H${x + w}V${y + H - R}A${R} ${R} 0 0 1 ${x + w - R} ${y + H}H${x + R}A${R} ${R} 0 0 1 ${x} ${y + H - R}Z`;
  return (
    <>
      <path d={lid} fill={fill} />
      <path d={body} fill={fill} />
      <rect x={x + w / 2 - 2} y={y + BODY} width="4" height="4.7" fill={tape} />
    </>
  );
}

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {BOXES.map((b) => (
        <Box key={b.y} {...b} />
      ))}
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="m-logo">
      <LogoMark />
      <span>
        The Storage <span style={{ color: "#DB520B" }}>Network</span>
      </span>
    </Link>
  );
}
