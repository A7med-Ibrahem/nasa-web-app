import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./PreviousEvents.css";

import { previousEvents } from "../../../data/homepageData";
import DataState from "../../common/DataState/DataState";
import { ArrowLeftIcon, ArrowRightIcon } from "../../common/Icons/Icons";
import SeasonMediaGallery from "../../seasonMedia/SeasonMediaGallery/SeasonMediaGallery";
import { useRevealGroup } from "../../../hooks/useReveal";

const EDGE_TOLERANCE = 2;

/**
 * Previous events section (GET /seasonmedia?includeInactive=false).
 *
 * The page orders records by season (newest first) then displayOrder; this
 * section only paints through the shared SeasonMediaGallery. The homepage uses
 * that gallery as a horizontal, scroll-snapping carousel while the full Season
 * Media page keeps its grid — all carousel rules are scoped to `events-gallery`.
 *
 * A ready-but-empty response hides the whole section, including its "View all"
 * link.
 */
export default function PreviousEvents({ status, events, error, onRetry }) {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const [navigation, setNavigation] = useState({ atStart: true, atEnd: true });

  useRevealGroup(sectionRef, { stagger: 100 });

  const updateNavigation = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const atStart = viewport.scrollLeft <= EDGE_TOLERANCE;
    const atEnd =
      maxScroll <= EDGE_TOLERANCE ||
      viewport.scrollLeft >= maxScroll - EDGE_TOLERANCE;

    setNavigation((current) =>
      current.atStart === atStart && current.atEnd === atEnd
        ? current
        : { atStart, atEnd },
    );
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return undefined;
    }

    updateNavigation();

    const handleResize = () => updateNavigation();
    window.addEventListener("resize", handleResize);

    const observer =
      typeof window.ResizeObserver === "function"
        ? new window.ResizeObserver(handleResize)
        : null;
    observer?.observe(viewport);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [updateNavigation, events.length, status]);

  const scrollByCard = useCallback((direction) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const card = viewport.querySelector(".event-media");
    const track = viewport.querySelector(".events-gallery");
    const gap = track
      ? Number.parseFloat(getComputedStyle(track).columnGap) || 0
      : 0;
    const step = card
      ? card.getBoundingClientRect().width + gap
      : viewport.clientWidth * 0.8;

    viewport.scrollBy({ left: direction * step });
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByCard(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByCard(1);
    }
  };

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
            <div className="events-carousel">
              <div className="events-carousel-nav">
                <button
                  type="button"
                  className="events-carousel-button"
                  onClick={() => scrollByCard(-1)}
                  disabled={navigation.atStart}
                  aria-label={previousEvents.carousel.previous}
                  aria-controls="previous-events-carousel"
                >
                  <ArrowLeftIcon size={17} />
                </button>

                <button
                  type="button"
                  className="events-carousel-button"
                  onClick={() => scrollByCard(1)}
                  disabled={navigation.atEnd}
                  aria-label={previousEvents.carousel.next}
                  aria-controls="previous-events-carousel"
                >
                  <ArrowRightIcon size={17} />
                </button>
              </div>

              <div
                id="previous-events-carousel"
                className="events-carousel-viewport"
                ref={viewportRef}
                role="region"
                aria-roledescription="carousel"
                aria-label={previousEvents.carousel.regionLabel}
                tabIndex={0}
                onScroll={updateNavigation}
                onKeyDown={handleKeyDown}
              >
                <SeasonMediaGallery
                  items={events}
                  linkLabel={previousEvents.linkLabel}
                  newTabHint={previousEvents.newTabHint}
                  className="events-gallery"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
