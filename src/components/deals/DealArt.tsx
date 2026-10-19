import type { PropertyType } from "@/lib/types";

/** Flat illustration of a property type, used when a deal has no photos. Fills its (relative) parent. */
export function DealArt({ type, height = 150 }: { type: PropertyType; height?: number }) {
  const common = { viewBox: "0 0 360 150", preserveAspectRatio: "xMidYMax slice", "aria-hidden": true, style: { position: "absolute" as const, left: 0, right: 0, bottom: 0, width: "100%", height } };
  switch (type) {
    case "portfolio":
      return (
        <svg {...common}>
          <rect x="0" y="128" width="360" height="22" fill="#fff" fillOpacity="0.55" />
          <rect x="22" y="66" width="104" height="9" rx="3" fill="#0B1F3A" /><rect x="26" y="75" width="96" height="55" fill="#fff" />
          <rect x="128" y="50" width="104" height="10" rx="3" fill="#0B1F3A" /><rect x="132" y="60" width="96" height="70" fill="#fff" />
          <rect x="234" y="72" width="104" height="9" rx="3" fill="#0B1F3A" /><rect x="238" y="81" width="96" height="49" fill="#fff" />
          <g fill="#DCE3EE"><rect x="34" y="92" width="20" height="38" rx="2" /><rect x="60" y="92" width="20" height="38" rx="2" /><rect x="86" y="92" width="20" height="38" rx="2" /><rect x="140" y="88" width="20" height="42" rx="2" /><rect x="192" y="88" width="20" height="42" rx="2" /><rect x="246" y="96" width="20" height="34" rx="2" /><rect x="272" y="96" width="20" height="34" rx="2" /><rect x="298" y="96" width="20" height="34" rx="2" /></g>
          <rect x="166" y="88" width="20" height="42" rx="2" fill="#F26B1D" />
          <path d="M34 100h72M34 108h72M34 116h72M140 96h72M140 105h72M140 114h72M246 104h72M246 112h72M246 120h72" stroke="#fff" strokeWidth="1.5" />
        </svg>
      );
    case "conv":
      return (
        <svg {...common}>
          <rect x="0" y="128" width="360" height="22" fill="#fff" fillOpacity="0.55" />
          <rect x="40" y="32" width="280" height="12" rx="4" fill="#0B1F3A" /><rect x="46" y="44" width="268" height="86" fill="#fff" />
          <rect x="130" y="54" width="100" height="18" rx="4" fill="#0B1F3A" /><rect x="140" y="60" width="30" height="6" rx="3" fill="#F26B1D" />
          <rect x="158" y="92" width="44" height="38" fill="#BFD3EA" /><path d="M180 92v38" stroke="#fff" strokeWidth="2" />
          <g fill="#DCE3EE"><rect x="64" y="96" width="24" height="34" rx="2" /><rect x="94" y="96" width="24" height="34" rx="2" /><rect x="236" y="96" width="24" height="34" rx="2" /></g>
          <rect x="266" y="96" width="24" height="34" rx="2" fill="#F26B1D" />
          <path d="M64 104h54M64 112h54M64 120h54M236 104h54M236 112h54M236 120h54" stroke="#fff" strokeWidth="1.5" />
        </svg>
      );
    case "rv":
      return (
        <svg {...common}>
          <rect x="0" y="128" width="360" height="22" fill="#fff" fillOpacity="0.55" />
          <rect x="24" y="44" width="312" height="10" rx="4" fill="#0B1F3A" />
          <g fill="#0B1F3A" fillOpacity="0.45"><rect x="30" y="54" width="5" height="76" /><rect x="178" y="54" width="5" height="76" /><rect x="325" y="54" width="5" height="76" /></g>
          <rect x="44" y="78" width="62" height="40" rx="8" fill="#fff" /><rect x="52" y="86" width="18" height="10" rx="2" fill="#BFD3EA" /><rect x="44" y="104" width="62" height="4" fill="#F26B1D" />
          <path d="M126 98h96l-12 20h-72z" fill="#fff" /><rect x="150" y="84" width="34" height="14" rx="4" fill="#fff" /><rect x="156" y="88" width="12" height="6" rx="2" fill="#BFD3EA" />
          <path d="M130 124h86" stroke="#0B1F3A" strokeWidth="3" strokeLinecap="round" />
          <rect x="232" y="74" width="80" height="44" rx="8" fill="#fff" /><rect x="290" y="82" width="16" height="12" rx="2" fill="#BFD3EA" /><rect x="232" y="100" width="80" height="4" fill="#DB520B" />
          <g fill="#0B1F3A"><circle cx="58" cy="120" r="6" /><circle cx="92" cy="120" r="6" /><circle cx="172" cy="125" r="6" /><circle cx="248" cy="120" r="6" /><circle cx="296" cy="120" r="6" /></g>
        </svg>
      );
    case "land":
      return (
        <svg {...common}>
          <path d="M0 150V96c60-14 120-18 180-14s120 6 180-6v74z" fill="#fff" fillOpacity="0.6" />
          <circle cx="40" cy="100" r="15" fill="#0B1F3A" fillOpacity="0.12" /><circle cx="64" cy="108" r="10" fill="#0B1F3A" fillOpacity="0.12" />
          <path d="M70 134l40-40h150l40 40z" fill="#fff" fillOpacity="0.6" stroke="#0B1F3A" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="6 6" />
          <rect x="140" y="106" width="80" height="20" rx="3" fill="none" stroke="#0B1F3A" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M110 94V70M260 94V70" stroke="#0B1F3A" strokeWidth="2" /><path d="M110 70l14 5-14 5zM260 70l14 5-14 5z" fill="#F26B1D" />
          <rect x="292" y="50" width="56" height="32" rx="4" fill="#fff" /><rect x="292" y="50" width="56" height="6" rx="3" fill="#F26B1D" /><path d="M300 64h40M300 72h28" stroke="#0B1F3A" strokeOpacity="0.4" strokeWidth="2" /><rect x="318" y="82" width="4" height="30" fill="#0B1F3A" fillOpacity="0.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="0" y="128" width="360" height="22" fill="#fff" fillOpacity="0.55" />
          <circle cx="38" cy="112" r="17" fill="#0B1F3A" fillOpacity="0.1" /><circle cx="324" cy="116" r="13" fill="#0B1F3A" fillOpacity="0.1" />
          <rect x="66" y="40" width="228" height="12" rx="4" fill="#0B1F3A" />
          <rect x="72" y="52" width="216" height="78" fill="#fff" />
          <rect x="150" y="58" width="60" height="9" rx="3" fill="#DB520B" />
          <g fill="#DCE3EE"><rect x="86" y="76" width="26" height="54" rx="2" /><rect x="120" y="76" width="26" height="54" rx="2" /><rect x="154" y="76" width="26" height="54" rx="2" /><rect x="222" y="76" width="26" height="54" rx="2" /><rect x="256" y="76" width="26" height="54" rx="2" /></g>
          <rect x="188" y="76" width="26" height="54" rx="2" fill="#F26B1D" />
          <path d="M86 88h196M86 98h196M86 108h196M86 118h196" stroke="#fff" strokeWidth="1.5" />
        </svg>
      );
  }
}
