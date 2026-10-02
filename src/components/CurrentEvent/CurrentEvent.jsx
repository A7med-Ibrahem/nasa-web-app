import "./CurrentEvent.css";

import { currentEvent } from "../../data/homepageData";
import { CalendarIcon, MapPinIcon } from "../Icons/Icons";

export default function CurrentEvent() {
  return (
    <section className="section section--light current-event" aria-labelledby="current-event-title">
      <div className="container current-event-inner">
        <div className="current-event-text">
          <p className="eyebrow">{currentEvent.eyebrow}</p>

          <h2 id="current-event-title" className="section-title">
            {currentEvent.title}
          </h2>

          <p className="section-desc current-event-description">
            {currentEvent.description}
          </p>

          <ul className="current-event-details">
            <li className="current-event-detail">
              <span className="current-event-detail-icon" aria-hidden="true">
                <CalendarIcon />
              </span>
              <time className="current-event-detail-value" dateTime={currentEvent.startDate}>
                {currentEvent.dateLabel}
              </time>
            </li>

            <li className="current-event-detail">
              <span className="current-event-detail-icon" aria-hidden="true">
                <MapPinIcon />
              </span>
              <span className="current-event-detail-value">{currentEvent.location}</span>
            </li>
          </ul>
        </div>

        {/* The logo is the only thing on this side: no card, no skyline, no
            gradient or any other backdrop. `.current-event-logo-frame` is a
            bare geometry box (transparent, no border, no shadow) that sizes
            the artwork and clips its oversized transparent canvas. */}
        <span className="logo-frame current-event-logo-frame">
          <img
            className="current-event-logo"
            src={currentEvent.logo}
            alt={currentEvent.logoAlt}
            loading="lazy"
            decoding="async"
          />
        </span>
      </div>
    </section>
  );
}