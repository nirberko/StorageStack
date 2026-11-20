"use client";

import type { ReactNode } from "react";
import { Avatar, Badge, Bar, Check, Facepile, Field, Icon, Row, Stage, Text, Window } from "@/components/stageshow/kit";
import "./scenes.css";

/* Product illustrations for the five pain-point rows on the landing page.
   Each is a still: a browser window pinned top-left on a soft well, running off
   the right and bottom, with one satellite straddling its left edge. Real words
   sit only on what the row is about; the rest of each list is placeholder bars. */

const W = 520;
const H = 380;
const COMPACT = { below: 520, width: 358, height: 330 };

/** One stage in the house look: Manrope, the brand orange as the accent, cool grays. */
function Scene({ label, children }: { label: string; children: (layout: "wide" | "compact") => ReactNode }) {
  return (
    <div className="tsn-scene" role="img" aria-label={label}>
      <Stage width={W} height={H} compact={COMPACT} greys="cool" fidelity="standard">
        {(_state, _rect, layout) => children(layout)}
      </Stage>
    </div>
  );
}

/** The window every scene shares: the site's own address in a pill. */
function Site({ path, children }: { path: string; children: ReactNode }) {
  return (
    <Window url={`thestorage.network/${path}`} urlShape="pill" className="tsn-window">
      <div className="tsn-page">{children}</div>
    </Window>
  );
}

/** A storage facility's thumbnail: rows of roll-up doors. */
function Doors({ tone }: { tone: "orange" | "navy" }) {
  return <span className="tsn-doors" data-tone={tone} aria-hidden />;
}

export function DealsScene() {
  return (
    <Scene label="The Deal Room: a list of storage facilities for sale, one marked off market, and an alert about a new deal nearby">
      {() => (
        <>
          <Site path="deals">
            <div className="tsn-head">
              <Text className="tsn-title">Deal Room</Text>
              <Bar w={64} h={22} r={8} tone={2} />
            </div>
            <div className="tsn-list">
              <Row
                pad={0}
                className="tsn-row"
                selected
                lead={<Doors tone="orange" />}
                title={<Text className="tsn-name">Riverside Self Storage</Text>}
                subtitle={<Text className="tsn-sub">Boise, ID · 412 units</Text>}
              >
                <Badge tone="accent">Off market</Badge>
              </Row>
              <Row
                pad={0}
                className="tsn-row"
                lead={<Doors tone="navy" />}
                title={<Text className="tsn-name">Canyon Road Storage</Text>}
                subtitle={<Text className="tsn-sub">Twin Falls, ID · 236 units</Text>}
              >
                <Badge>Value-add</Badge>
              </Row>
              {[96, 120, 84].map((w, i) => (
                <Row key={i} pad={0} className="tsn-row" lead={<Bar w={44} h={32} r={8} tone={2} />} title={<Bar w={w} tone={3} />} subtitle={<Bar w={w - 30} tone={2} />}>
                  <Bar w={52} h={18} r={9} tone={2} />
                </Row>
              ))}
            </div>
          </Site>
          <div className="tsn-sat tsn-alert">
            <span className="tsn-tile">
              <Icon name="bell" size={16} filled />
            </span>
            <div className="tsn-stack">
              <Text className="tsn-name">New off-market deal</Text>
              <Text className="tsn-sub">18 miles from you</Text>
            </div>
          </div>
        </>
      )}
    </Scene>
  );
}

export function FundingScene() {
  return (
    <Scene label="A list of lenders who finance self storage, and a message from a lender asking for the rent roll">
      {() => (
        <>
          <Site path="lenders">
            <div className="tsn-head">
              <Text className="tsn-title">Lenders who finance storage</Text>
            </div>
            <div className="tsn-list">
              <Row
                pad={0}
                className="tsn-row"
                selected
                lead={<Avatar name="First Ridge Bank" tone="accent" size={32} />}
                title={<Text className="tsn-name">First Ridge Bank</Text>}
                subtitle={<Text className="tsn-sub">SBA 7(a) · Purchase</Text>}
              >
                <Badge tone="success">Lends on storage</Badge>
              </Row>
              <Row
                pad={0}
                className="tsn-row"
                lead={<Avatar name="Summit Capital" size={32} />}
                title={<Text className="tsn-name">Summit Capital</Text>}
                subtitle={<Text className="tsn-sub">Construction · Bridge</Text>}
              >
                <Badge tone="success">Lends on storage</Badge>
              </Row>
              {[104, 88, 116].map((w, i) => (
                <Row key={i} pad={0} className="tsn-row" lead={<Bar w={32} h={32} r={16} tone={2} />} title={<Bar w={w} tone={3} />} subtitle={<Bar w={w - 24} tone={2} />}>
                  <Bar w={88} h={18} r={9} tone={2} />
                </Row>
              ))}
            </div>
          </Site>
          <div className="tsn-sat tsn-note">
            <div className="tsn-who">
              <Avatar name="Dana Ruiz" size={26} />
              <div className="tsn-stack">
                <Text className="tsn-name">Dana Ruiz</Text>
                <Text className="tsn-sub">Lender · SBA loans</Text>
              </div>
            </div>
            <div className="tsn-quote">
              <Text wrap>Send me the rent roll. I can look at it this week.</Text>
            </div>
          </div>
        </>
      )}
    </Scene>
  );
}

export function CalculatorScene() {
  return (
    <Scene label="The deal calculator: an asking price and net income give a 7.0% cap rate, and a member's note on the expenses">
      {() => (
        <>
          <Site path="tools/deal">
            <div className="tsn-head">
              <Text className="tsn-title">Deal calculator</Text>
            </div>
            <div className="tsn-calc">
              <Field label="Asking price" value="$3,200,000" />
              <Field label="Net operating income" value="$224,000" />
            </div>
            <div className="tsn-result">
              <div className="tsn-stack">
                <Text className="tsn-sub">Cap rate</Text>
                <span className="tsn-big">7.0%</span>
              </div>
              <div className="tsn-stack tsn-side">
                <Text className="tsn-sub">Price per sq ft</Text>
                <Text className="tsn-value">$64</Text>
              </div>
            </div>
            <div className="tsn-lines" aria-hidden>
              {[120, 96, 132].map((w, i) => (
                <div key={i} className="tsn-line">
                  <Bar w={w} tone={3} />
                  <Bar w={48} tone={2} />
                </div>
              ))}
            </div>
          </Site>
          <div className="tsn-sat tsn-alert tsn-low">
            <Avatar name="Mark Ellis" size={28} />
            <div className="tsn-stack">
              <Text className="tsn-name">Mark Ellis · Owner</Text>
              <Text className="tsn-sub">Expenses look low. Add 6% for management.</Text>
            </div>
          </div>
        </>
      )}
    </Scene>
  );
}

export function ChecklistScene() {
  return (
    <Scene label="A due diligence checklist for a facility, with two of four checks done">
      {() => (
        <>
          <Site path="learn/due-diligence">
            <div className="tsn-head">
              <Text className="tsn-title">Before you sign</Text>
              <Text className="tsn-sub">Riverside Self Storage</Text>
            </div>
            <div className="tsn-list">
              <Row pad={0} className="tsn-row tsn-check" lead={<Check on size={18} />} title={<Text className="tsn-name">Rent roll matches bank deposits</Text>} />
              <Row pad={0} className="tsn-row tsn-check" lead={<Check on size={18} />} title={<Text className="tsn-name">Roofs and doors inspected</Text>} />
              <Row pad={0} className="tsn-row tsn-check" selected lead={<Check on={false} pending size={18} />} title={<Text className="tsn-name">Environmental report on the land</Text>}>
                <Badge tone="warning">In progress</Badge>
              </Row>
              <Row pad={0} className="tsn-row tsn-check" lead={<Check on={false} size={18} />} title={<Text className="tsn-name">New competitors planned nearby</Text>} />
              {[150, 120].map((w, i) => (
                <Row key={i} pad={0} className="tsn-row tsn-check" lead={<Bar w={18} h={18} r={9} tone={2} />} title={<Bar w={w} tone={2} />} />
              ))}
            </div>
          </Site>
          <div className="tsn-sat tsn-chip">
            <Check on size={14} />
            <Text className="tsn-name">2 of 4 done</Text>
          </div>
        </>
      )}
    </Scene>
  );
}

export function ForumScene() {
  return (
    <Scene label="A forum question about a first facility, answered by an owner and a lender">
      {() => (
        <>
          <Site path="forums">
            <div className="tsn-head tsn-thread">
              <Badge tone="accent">Buying a Facility</Badge>
              <Text wrap className="tsn-title">Is 180 units too small for a first facility?</Text>
            </div>
            <div className="tsn-list">
              <Row
                pad={0}
                className="tsn-row tsn-answer"
                lead={<Avatar name="Mark Ellis" size={30} />}
                title={
                  <span className="tsn-verified">
                    <Text className="tsn-name">Mark Ellis</Text>
                    <span className="tsn-tick" aria-hidden>
                      <Icon name="check" size={10} stroke={2.5} />
                    </span>
                  </span>
                }
                subtitle={<Text className="tsn-sub">Owner · 6 facilities</Text>}
                preview={[220, 180]}
              />
              <Row
                pad={0}
                className="tsn-row tsn-answer"
                lead={<Avatar name="Priya Shah" size={30} />}
                title={<Text className="tsn-name">Priya Shah</Text>}
                subtitle={<Text className="tsn-sub">Lender</Text>}
                preview={[200, 150]}
              />
              <Row pad={0} className="tsn-row tsn-answer" lead={<Bar w={30} h={30} r={15} tone={2} />} title={<Bar w={90} tone={3} />} subtitle={<Bar w={60} tone={2} />} preview={[210]} />
            </div>
          </Site>
          <div className="tsn-sat tsn-alert">
            <Facepile names={["Mark Ellis", "Priya Shah", "Tom Brandt"]} size={24} />
            <div className="tsn-stack">
              <Text className="tsn-name">9 answers</Text>
              <Text className="tsn-sub">from owners and lenders</Text>
            </div>
          </div>
        </>
      )}
    </Scene>
  );
}
