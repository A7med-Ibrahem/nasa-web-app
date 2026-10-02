import "./PreviousEvents.css";

import { previousEvents } from "../../data/homepageData";
import { actionIcons } from "../Icons/iconRegistry";

const ActionIcon = actionIcons[previousEvents.action.icon];

function EventImage({ event }) {
  return (
    <li className="event-media">
      <a className="event-media-link" href={`/events/${event.slug}`}>
        <img
          className="event-image"
          src={event.image}
          alt={event.imageAlt}
          loading="lazy"
          decoding="async"
        />
        <span className="event-year-badge">{event.year}</span>
      </a>
    </li>
  );
}

export default function PreviousEvents() {
  return (
    <section
      className="section section--light previous-events"
      aria-labelledby="previous-events-title"
    >
      <div className="container previous-events-inner">
        <div className="previous-events-text">
          <p className="eyebrow">{previousEvents.eyebrow}</p>

          <h2 id="previous-events-title" className="section-title">
            {previousEvents.title}
          </h2>

          <p className="section-desc">{previousEvents.description}</p>

          <a
            href={previousEvents.action.href}
            className="arrow-link arrow-link--on-light previous-events-action"
          >
            {previousEvents.action.label}
            <ActionIcon size={16} />
          </a>
        </div>

        <ul className="events-gallery">
          {previousEvents.items.map((event) => (
            <EventImage key={event.id} event={event} />
          ))}
        </ul>
      </div>
    </section>
  );
}