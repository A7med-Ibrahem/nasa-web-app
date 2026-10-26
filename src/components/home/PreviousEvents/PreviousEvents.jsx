import { useRef } from "react";
import { Link } from "react-router-dom";
import "./PreviousEvents.css";

import { previousEvents } from "../../../data/homepageData";
import DataState from "../../common/DataState/DataState";
import { ArrowRightIcon } from "../../common/Icons/Icons";
import SeasonMediaGallery from "../../seasonMedia/SeasonMediaGallery/SeasonMediaGallery";
import { useRevealGroup } from "../../../hooks/useReveal";

/**
 * Previous events section (GET /seasonmedia?includeInactive=false).
 *
 * The page orders records by season (newest first) then displayOrder; this
 * section only paints through the shared SeasonMediaGallery. A ready-but-empty
 * response hides the whole section, including its "View all" link.
 */
export default function PreviousEvents({ status, events, error, onRetry }) {
  const sectionRef = useRef(null);

  useRevealGroup(sectionRef, { stagger: 100 });

  if (status === "ready" && events.length === 0) {
    return null;
  }

  return (
    <section
      className="section section--light previous-events"
      ref={sectionRef}
      aria-labelledby="previous-events-title"
    >
      <div className="container previous-events-inner">
        <div className="previous-events-text" data-reveal-item data-reveal-variant="left">
          <p className="eyebrow">{previousEvents.eyebrow}</p>

          <h2 id="previous-events-title" className="section-title">
            {previousEvents.title}
          </h2>

          <p className="section-desc">{previousEvents.description}</p>

          {status === "ready" && events.length > 0 ? (
            <Link
              to={previousEvents.action.href}
              className="arrow-link arrow-link--on-light previous-events-action"
            >
              {previousEvents.action.label}
              <ArrowRightIcon size={16} />
            </Link>
          ) : null}
        </div>

        <div className="previous-events-content">
          {status === "loading" ? (
            <DataState
              status="loading"
              title={previousEvents.states.loading}
              tone="light"
              compact
            />
          ) : null}

          {status === "error" ? (
            <DataState
              status="error"
              title={previousEvents.states.errorTitle}
              message={error?.message}
              retryLabel={previousEvents.states.retry}
              onRetry={onRetry}
              tone="light"
              compact
            />
          ) : null}

          {status === "ready" && events.length > 0 ? (
            <SeasonMediaGallery
              items={events}
              linkLabel={previousEvents.linkLabel}
              newTabHint={previousEvents.newTabHint}
              className="events-gallery"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
