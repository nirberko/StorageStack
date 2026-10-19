import { DealArt } from "@/components/deals/DealArt";
import type { PropertyType } from "@/lib/types";

export type ArtKey = "ext" | "gate" | "aisle" | "office" | PropertyType;

const fill = { position: "absolute" as const, inset: 0 };

/** Large illustrations for the deal gallery when the poster has not uploaded photos. */
export function GalleryArt({ art }: { art: ArtKey }) {
  switch (art) {
    case "ext":
      return (
        <svg viewBox="0 0 800 430" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" aria-hidden="true" style={fill}>
          <rect x="0" y="360" width="800" height="70" fill="#fff" fillOpacity="0.6" />
          <path d="M120 400h40M220 400h40M320 400h40M420 400h40M520 400h40M620 400h40" stroke="#0B1F3A" strokeOpacity="0.15" strokeWidth="4" strokeLinecap="round" />
          <circle cx="64" cy="320" r="44" fill="#0B1F3A" fillOpacity="0.1" /><circle cx="742" cy="330" r="34" fill="#0B1F3A" fillOpacity="0.1" />
          <rect x="120" y="130" width="560" height="26" rx="6" fill="#0B1F3A" />
          <rect x="132" y="156" width="536" height="204" fill="#fff" />
          <rect x="320" y="174" width="160" height="24" rx="6" fill="#DB520B" />
          <g fill="#DCE3EE">
            <rect x="156" y="230" width="40" height="130" rx="3" /><rect x="206" y="230" width="40" height="130" rx="3" /><rect x="256" y="230" width="40" height="130" rx="3" /><rect x="306" y="230" width="40" height="130" rx="3" /><rect x="356" y="230" width="40" height="130" rx="3" /><rect x="456" y="230" width="40" height="130" rx="3" /><rect x="506" y="230" width="40" height="130" rx="3" /><rect x="556" y="230" width="40" height="130" rx="3" /><rect x="606" y="230" width="40" height="130" rx="3" />
          </g>
          <rect x="406" y="230" width="40" height="130" rx="3" fill="#F26B1D" />
          <path d="M156 250h490M156 268h490M156 286h490M156 304h490M156 322h490M156 340h490" stroke="#fff" strokeWidth="2.5" />
        </svg>
      );
    case "gate":
      return (
        <svg viewBox="0 0 800 430" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" aria-hidden="true" style={fill}>
          <rect x="0" y="360" width="800" height="70" fill="#fff" fillOpacity="0.6" />
          <rect x="90" y="110" width="620" height="18" rx="5" fill="#0B1F3A" fillOpacity="0.6" />
          <rect x="100" y="128" width="600" height="100" fill="#fff" fillOpacity="0.75" />
          <path d="M40 220h720M40 236h720" stroke="#0B1F3A" strokeOpacity="0.45" strokeWidth="4" />
          <path d="M52 220v140M76 220v140M100 220v140M124 220v140M148 220v140M172 220v140M196 220v140M220 220v140M244 220v140M268 220v140M292 220v140M532 220v140M556 220v140M580 220v140M604 220v140M628 220v140M652 220v140M676 220v140M700 220v140M724 220v140M748 220v140" stroke="#0B1F3A" strokeOpacity="0.35" strokeWidth="3" />
          <rect x="316" y="206" width="200" height="154" rx="4" fill="#fff" fillOpacity="0.4" stroke="#0B1F3A" strokeWidth="5" />
          <path d="M341 210v146M366 210v146M391 210v146M416 210v146M441 210v146M466 210v146M491 210v146M318 283h196" stroke="#0B1F3A" strokeOpacity="0.7" strokeWidth="3" />
          <rect x="556" y="270" width="10" height="90" fill="#0B1F3A" />
          <rect x="540" y="232" width="42" height="52" rx="8" fill="#fff" stroke="#0B1F3A" strokeWidth="3" />
          <path d="M550 250h22M550 260h22M550 270h14" stroke="#0B1F3A" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
          <circle cx="574" cy="242" r="4" fill="#F26B1D" />
        </svg>
      );
    case "aisle":
      return (
        <svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true" style={fill}>
          <path d="M0 0L360 170L440 170L800 0z" fill="#EEF2F8" />
          <path d="M0 0L360 170L360 250L0 420z" fill="#fff" />
          <path d="M800 0L440 170L440 250L800 420z" fill="#fff" />
          <path d="M0 420L360 250L440 250L800 420z" fill="#C9D3E1" />
          <rect x="360" y="170" width="80" height="80" fill="#DCE3EE" />
          <g fill="#DCE3EE">
            <path d="M40 95L130 121L130 359L40 401z" /><path d="M170 132L240 152L240 307L170 340z" /><path d="M270 160L320 175L320 269L270 292z" /><path d="M760 95L670 121L670 359L760 401z" /><path d="M530 160L480 175L480 269L530 292z" />
          </g>
          <path d="M630 132L560 152L560 307L630 340z" fill="#F26B1D" />
          <g fill="#fff"><rect x="360" y="50" width="80" height="8" rx="4" /><rect x="374" y="110" width="52" height="6" rx="3" /><rect x="384" y="146" width="32" height="4" rx="2" /></g>
          <path d="M400 420V250" stroke="#fff" strokeOpacity="0.6" strokeWidth="3" strokeDasharray="14 12" />
        </svg>
      );
    case "office":
      return (
        <svg viewBox="0 0 800 430" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" aria-hidden="true" style={fill}>
          <rect x="0" y="360" width="800" height="70" fill="#fff" fillOpacity="0.6" />
          <rect x="190" y="120" width="420" height="30" rx="6" fill="#0B1F3A" />
          <rect x="320" y="128" width="160" height="14" rx="5" fill="#F26B1D" />
          <rect x="200" y="150" width="400" height="210" fill="#fff" />
          <rect x="232" y="196" width="190" height="116" rx="4" fill="#BFD3EA" />
          <path d="M295 196v116M359 196v116M232 254h190" stroke="#fff" strokeWidth="4" />
          <rect x="452" y="214" width="80" height="146" rx="4" fill="#BFD3EA" /><path d="M492 214v146" stroke="#fff" strokeWidth="4" />
          <rect x="548" y="214" width="34" height="34" rx="6" fill="#0B1F3A" fillOpacity="0.85" /><path d="M556 226h18M556 234h12" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="160" cy="330" r="30" fill="#0B1F3A" fillOpacity="0.1" /><circle cx="652" cy="336" r="24" fill="#0B1F3A" fillOpacity="0.1" />
        </svg>
      );
    default:
      return (
        <div style={fill}>
          <DealArt type={art} height={430} />
        </div>
      );
  }
}

/** Stylised area map: the facility in the middle, competitor pins around it, a 3-mile ring. */
export function AreaMap({ competitors }: { competitors: number }) {
  const pins = [
    [225, 100],
    [420, 215],
    [398, 78],
    [240, 240],
    [470, 120],
    [190, 190],
  ].slice(0, Math.min(competitors, 6));
  return (
    <svg
      viewBox="0 0 640 320"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      role="img"
      aria-label={`Map of the area: the facility in the middle${competitors ? `, ${competitors} competitors nearby` : ""}`}
      style={fill}
    >
      <g fill="#E1E8F1">
        <rect x="40" y="30" width="120" height="80" rx="10" /><rect x="450" y="40" width="150" height="70" rx="10" /><rect x="60" y="210" width="140" height="80" rx="10" /><rect x="440" y="200" width="160" height="90" rx="10" />
      </g>
      <path d="M-10 160C150 150 260 175 330 160S520 120 660 140" stroke="#fff" strokeWidth="18" fill="none" />
      <path d="M-10 160C150 150 260 175 330 160S520 120 660 140" stroke="#FFD6BC" strokeWidth="6" fill="none" />
      <path d="M300 -10C310 90 290 200 320 330M180 -10C200 100 170 220 210 330M470 -10C460 100 490 220 470 330" stroke="#fff" strokeWidth="10" fill="none" />
      <circle cx="320" cy="162" r="140" fill="#DB520B" fillOpacity="0.05" stroke="#DB520B" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="8 8" />
      {pins.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="9" fill="#5E6B7E" />
          <circle cx={x} cy={y} r="3.5" fill="#fff" />
        </g>
      ))}
      <path d="M320 166c-14-16-22-26-22-36a22 22 0 0144 0c0 10-8 20-22 36z" fill="#0B1F3A" />
      <circle cx="320" cy="130" r="8" fill="#F26B1D" />
    </svg>
  );
}
