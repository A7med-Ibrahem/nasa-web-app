import { useRef } from "react";
import "./Sponsors.css";

import { sponsors } from "../../../data/homepageData";
import { actionIcons } from "../../common/Icons/iconRegistry";
import { useRevealGroup } from "../../../hooks/useReveal";

const ActionIcon = actionIcons[sponsors.action.icon];

function SponsorMark({ name, logo }) {
  return (
    <li className="sponsor-mark" data-reveal-item>
      {logo ? (
        <img className="sponsor-logo" src={logo} alt={name} loading="lazy" decoding="async" />
      ) : (
        /*
         * Wordmark placeholder. No <img> is rendered while `logo` is null, so
         * the page never requests a file that does not exist. Supply the real
         * asset path in the data file to swap this out.
         */
        <span className="sponsor-wordmark">{name}</span>
      )}
    </li>
  );
}

export default function Sponsors() {
  const sectionRef = useRef(null);

  useRevealGroup(sectionRef, { stagger: 70 });

  return (
    <section
      className="section section--light sponsors"
      ref={sectionRef}
      aria-labelledby="sponsors-title"
    >
      <div className="container sponsors-inner">
        <div className="sponsors-text" data-reveal-item data-reveal-variant="left">
          <p className="eyebrow">{sponsors.eyebrow}</p>

          <h2 id="sponsors-title" className="section-title">
            {sponsors.title}
          </h2>

          <p className="section-desc sponsors-description">{sponsors.description}</p>

          <a href={sponsors.action.href} className="btn btn--ghost-light">
            {sponsors.action.label}
            <ActionIcon size={16} />
          </a>
        </div>

        <ul className="sponsors-grid">
          {sponsors.items.map((sponsor) => (
            <SponsorMark key={sponsor.id} name={sponsor.name} logo={sponsor.logo} />
          ))}
        </ul>
      </div>
    </section>
  );
}