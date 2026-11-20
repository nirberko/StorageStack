import { Badge } from "../../atoms/Badge/Badge";
import { Card } from "../../atoms/Card/Card";
import "./ListingCard.css";

export type ListingCardProps = {
  name: string;
  /** City and state, like "Boise, ID". */
  place: string;
  units?: number;
  sqft?: number;
  /** Asking price in dollars. */
  price?: number;
  /** Cap rate as a percent, like 7 for 7.0%. */
  capRate?: number;
  /** Occupancy as a percent. */
  occupancy?: number;
  /** A short tag like "Off market" or "Value-add". */
  tag?: string;
  photo?: string;
  href?: string;
};

/** "$3.2M" or "$640K". */
const money = (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M` : `$${Math.round(n / 1000)}K`);

/** A self storage facility for sale: photo, name, place and the key numbers. */
export function ListingCard({ name, place, units, sqft, price, capRate, occupancy, tag, photo, href }: ListingCardProps) {
  const meta = [place, units && `${units.toLocaleString("en-US")} units`, sqft && `${sqft.toLocaleString("en-US")} sq ft`].filter(Boolean).join(" · ");
  const hasNumbers = price !== undefined || capRate !== undefined || occupancy !== undefined;
  return (
    <Card pad="none" href={href} className="ui-listing">
      <div className="ui-listing-photo">
        {/* eslint-disable-next-line @next/next/no-img-element -- listing photos come from members' uploads */}
        {photo && <img src={photo} alt="" />}
      </div>
      <div className="ui-listing-body">
        <div className="ui-listing-head">
          <span className="ui-listing-name">{name}</span>
          {tag && <Badge tone="ink">{tag}</Badge>}
        </div>
        <span className="ui-listing-meta">{meta}</span>
        {hasNumbers && (
          <dl className="ui-listing-nums">
            {price !== undefined && (
              <div>
                <dt>asking</dt>
                <dd>{money(price)}</dd>
              </div>
            )}
            {capRate !== undefined && (
              <div>
                <dt>cap</dt>
                <dd data-key="">{capRate.toFixed(1)}%</dd>
              </div>
            )}
            {occupancy !== undefined && (
              <div>
                <dt>full</dt>
                <dd>{occupancy}%</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </Card>
  );
}
