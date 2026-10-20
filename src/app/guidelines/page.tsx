import type { Metadata } from "next";
import { InfoPage } from "@/components/static/InfoPage";

export const metadata: Metadata = { title: "Community guidelines" };

const SECTIONS = [
  {
    id: "guidelines",
    title: "Community guidelines",
    items: [
      "Be kind and assume good intent. Everyone was new once.",
      "Share real numbers when you can. Say when something is an estimate.",
      "No spam or self-promotion outside the Deal Room. Brokers are welcome, just say so.",
      "Do not share anyone's private details, including addresses from the Deal Room.",
    ],
  },
  {
    id: "deals",
    title: "Deal Room rules",
    items: [
      "Only post deals you have the right to share.",
      "Members verify who people are, not the numbers. Always do your own due diligence.",
      "The Storage Network does not give investment advice and is not a party to any deal.",
      "Mark your deal as closed when it is done so it stops showing.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    items: [
      "Your profile name and headline are public. Your email is never shown.",
      "Deal addresses and documents are only shared with members the poster approves.",
      "You can edit your profile or ask us to delete your account at any time.",
    ],
  },
  {
    id: "terms",
    title: "Terms",
    items: ["[TERMS OF SERVICE TO BE PROVIDED BY THE STORAGE NETWORK]"],
  },
];

export default function GuidelinesPage() {
  return (
    <InfoPage kicker="Guidelines" title="How we keep The Storage Network useful" intro="A few simple rules for the forums and the Deal Room.">
      {SECTIONS.map((s) => (
        <section key={s.id} id={s.id} className="x-sec">
          <h2 className="x-h2">{s.title}</h2>
          <ul style={{ margin: "14px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {s.items.map((i) => (
              <li key={i} className="x-p">
                {i}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </InfoPage>
  );
}
