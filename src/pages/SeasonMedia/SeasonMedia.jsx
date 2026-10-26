import { useEffect, useMemo, useRef, useState } from "react";
import "./SeasonMedia.css";

import { fetchSeasonMedia } from "../../api/seasonMedia";
import DataState from "../../components/common/DataState/DataState";
import PageHero from "../../components/common/PageHero/PageHero";
import SeasonMediaGallery from "../../components/seasonMedia/SeasonMediaGallery/SeasonMediaGallery";
import { seasonMediaPage } from "../../data/publicPagesData";
import { site } from "../../data/site";
import useApiResource from "../../hooks/useApiResource";
import { useRevealGroup } from "../../hooks/useReveal";
import { orderSeasonMedia } from "../../utils/apiContent";

/** Groups already-ordered media records, preserving season order. */
function groupBySeason(items) {
  const groups = [];
  const byKey = new Map();

  items.forEach((item) => {
    const season =
      typeof item.season === "string" ? item.season.trim() : "";
    const key = season || "__other";

    if (!byKey.has(key)) {
      const group = { key, season, items: [] };
      byKey.set(key, group);
      groups.push(group);
    }

    byKey.get(key).items.push(item);
  });

  return groups;
}

/**
 * Public season media page (`/season-media`).
 *
 * GET /seasonmedia?includeInactive=false is the only data source. Records are
 * ordered newest season first, grouped by season, and optionally filtered with
 * chips that only appear when the archive has more than one season. No media
 * is embedded — every record is an image card.
 */
export default function SeasonMedia() {
  const [selectedSeason, setSelectedSeason] = useState("all");
  const sectionRef = useRef(null);

  useRevealGroup(sectionRef, { stagger: 90 });

  const { status, data, error, retry } = useApiResource(fetchSeasonMedia);

  const items = useMemo(() => orderSeasonMedia(data), [data]);
  const groups = useMemo(() => groupBySeason(items), [items]);

  useEffect(() => {
    document.title = `${seasonMediaPage.hero.title} — ${site.name}`;
  }, []);

  const seasons = groups.map((group) => group.season).filter(Boolean);
  const activeSeason = seasons.includes(selectedSeason)
    ? selectedSeason
    : "all";

  const visibleGroups =
    activeSeason === "all"
      ? groups
      : groups.filter((group) => group.season === activeSeason);

  return (
    <div className="season-media-page">
      <PageHero
        eyebrow={seasonMediaPage.hero.eyebrow}
        title={seasonMediaPage.hero.title}
        description={seasonMediaPage.hero.description}
        titleId="season-media-title"
      />

      <section
        className="section section--light season-media-section"
        ref={sectionRef}
        aria-labelledby="season-media-section-title"
      >
        <div className="container">
          <header className="season-media-header" data-reveal-item>
            <p className="eyebrow">{seasonMediaPage.hero.eyebrow}</p>

            <h2 id="season-media-section-title" className="section-title">
              {seasonMediaPage.section.title}
            </h2>

            <p className="section-desc season-media-description">
              {seasonMediaPage.section.description}
            </p>
          </header>

          {status === "loading" ? (
            <DataState
              status="loading"
              title={seasonMediaPage.states.loading}
              tone="light"
            />
          ) : null}

          {status === "error" ? (
            <DataState
              status="error"
              title={seasonMediaPage.states.errorTitle}
              message={error?.message}
              retryLabel={seasonMediaPage.states.retry}
              onRetry={retry}
              tone="light"
            />
          ) : null}

          {status === "ready" && items.length === 0 ? (
            <DataState
              status="empty"
              title={seasonMediaPage.empty.title}
              message={seasonMediaPage.empty.description}
              tone="light"
            />
          ) : null}

          {status === "ready" && items.length > 0 ? (
            <>
              {seasons.length >= 2 ? (
                <div
                  className="season-filter-list"
                  role="group"
                  aria-label={seasonMediaPage.filters.label}
                >
                  <button
                    type="button"
                    className="season-filter-chip"
                    aria-pressed={activeSeason === "all"}
                    onClick={() => setSelectedSeason("all")}
                  >
                    {seasonMediaPage.filters.all}
                  </button>

                  {seasons.map((season) => (
                    <button
                      key={season}
                      type="button"
                      className="season-filter-chip"
                      aria-pressed={activeSeason === season}
                      onClick={() => setSelectedSeason(season)}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="season-groups">
                {visibleGroups.map((group, index) => {
                  const headingId = `season-group-${index}`;

                  return (
                    <section
                      className="season-group"
                      key={group.key}
                      aria-labelledby={headingId}
                    >
                      <h2 id={headingId} className="season-group-title">
                        {group.season || seasonMediaPage.otherSeason}
                      </h2>

                      <SeasonMediaGallery
                        items={group.items}
                        linkLabel={seasonMediaPage.linkLabel}
                        newTabHint={seasonMediaPage.newTabHint}
                      />
                    </section>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
