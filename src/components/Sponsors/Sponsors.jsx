import "./Sponsors.css";

import { sponsors } from "../../data/homepageData";
import { actionIcons } from "../Icons/iconRegistry";

const ActionIcon = actionIcons[sponsors.action.icon];

function SponsorMark({ name, logo }) {
  return (
    <li className="sponsor-mark">
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
  return (
    <section className="section section--light sponsors" aria-labelledby="sponsors-title">
      <div className="container sponsors-inner">
        <div className="sponsors-text">
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