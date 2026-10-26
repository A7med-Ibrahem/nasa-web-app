import { useState } from "react";
import "./SponsorTiers.css";

import { isHttpUrl } from "../../../utils/apiContent";
import { toImageSrc } from "../../../utils/image";

/**
 * One sponsor logo or wordmark.
 *
 * The API logo goes through `toImageSrc`; anything unusable falls back to the
 * sponsor's name as text. Only absolute http(s) links become anchors, and only
 * active sponsors reach this component (the page groups them).
 */
function SponsorMark({ sponsor, newTabHint }) {
  const { name, logo, link } = sponsor;
  const [imageFailed, setImageFailed] = useState(false);

  const imageSrc = toImageSrc(logo);
  const hasLogo = Boolean(imageSrc) && !imageFailed;
  const safeLink = isHttpUrl(link) ? link.trim() : null;

  if (!hasLogo && !name) {
    return null;
  }

  const content = hasLogo ? (
    <img
      className="sponsor-logo"
      src={imageSrc}
      alt={name || ""}
      loading="lazy"
      decoding="async"
      onError={() => setImageFailed(true)}
    />
  ) : (
    <span className="sponsor-wordmark">{name}</span>
  );

  return (
    <li className="sponsor-mark" data-reveal-item>
      {safeLink ? (
        <a
          className="sponsor-mark-body"
          href={safeLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
          {newTabHint ? (
            <span className="visually-hidden">{newTabHint}</span>
          ) : null}
        </a>
      ) : (
        <span className="sponsor-mark-body">{content}</span>
      )}
    </li>
  );
}

/**
 * Sponsor marks grouped by tier, in priority order, with banner tiers enlarged.
 *
 * Presentational and shared by the homepage band and the full Sponsors page;
 * both pages pass the already-grouped tiers and their own copy.
 */
export default function SponsorTiers({ tiers, newTabHint }) {
  if (!Array.isArray(tiers) || tiers.length === 0) {
    return null;
  }

  return (
    <div className="sponsors-tiers">
      {tiers.map((tier, tierIndex) => (
        <div
          className={`sponsor-tier${
            tier.bannerEnabled ? " sponsor-tier--banner" : ""
          }`}
          key={tier.tierId ?? `tier-${tierIndex}`}
        >
          {tier.name ? <h3 className="sponsor-tier-title">{tier.name}</h3> : null}

          <ul className="sponsor-tier-list">
            {tier.sponsors.map((sponsor, index) => (
              <SponsorMark
                key={sponsor.sponsorId ?? `sponsor-${index}`}
                sponsor={sponsor}
                newTabHint={newTabHint}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
