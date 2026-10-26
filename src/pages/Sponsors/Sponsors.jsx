import { useEffect, useMemo, useRef } from "react";
import "./Sponsors.css";

import { fetchSponsors } from "../../api/sponsors";
import DataState from "../../components/common/DataState/DataState";
import PageHero from "../../components/common/PageHero/PageHero";
import SponsorTiers from "../../components/sponsors/SponsorTiers/SponsorTiers";
import { sponsorsPage } from "../../data/publicPagesData";
import { site } from "../../data/site";
import useApiResource from "../../hooks/useApiResource";
import { useRevealGroup } from "../../hooks/useReveal";
import { groupSponsorsByTier } from "../../utils/apiContent";

/**
 * Public sponsors page (`/sponsors`).
 *
 * GET /sponsors?includeInactive=false is the only data source. The page groups
 * the records with the same helper the homepage uses and renders them through
 * the shared SponsorTiers component; a ready-but-empty response gets an
 * explicit empty state instead of hiding the section.
 */
export default function Sponsors() {
  const sectionRef = useRef(null);

  useRevealGroup(sectionRef, { stagger: 70 });

  const { status, data, error, retry } = useApiResource(fetchSponsors);

  const tiers = useMemo(() => groupSponsorsByTier(data), [data]);

  useEffect(() => {
    document.title = `${sponsorsPage.hero.title} — ${site.name}`;
  }, []);

  return (
    <div className="sponsors-page">
      <PageHero
        eyebrow={sponsorsPage.hero.eyebrow}
        title={sponsorsPage.hero.title}
        description={sponsorsPage.hero.description}
        titleId="sponsors-page-title"
      />

      <section
        className="section section--light sponsors-page-section"
        ref={sectionRef}
        aria-labelledby="sponsors-section-title"
      >
        <div className="container">
          <header className="sponsors-page-header" data-reveal-item>
            <p className="eyebrow">{sponsorsPage.section.eyebrow}</p>

            <h2 id="sponsors-section-title" className="section-title">
              {sponsorsPage.section.title}
            </h2>

            <p className="section-desc sponsors-page-description">
              {sponsorsPage.section.description}
            </p>
          </header>

          <div className="sponsors-page-content">
            {status === "loading" ? (
              <DataState
                status="loading"
                title={sponsorsPage.states.loading}
                tone="light"
              />
            ) : null}

            {status === "error" ? (
              <DataState
                status="error"
                title={sponsorsPage.states.errorTitle}
                message={error?.message}
                retryLabel={sponsorsPage.states.retry}
                onRetry={retry}
                tone="light"
              />
            ) : null}

            {status === "ready" && tiers.length === 0 ? (
              <DataState
                status="empty"
                title={sponsorsPage.empty.title}
                message={sponsorsPage.empty.description}
                tone="light"
              />
            ) : null}

            {status === "ready" && tiers.length > 0 ? (
              <SponsorTiers
                tiers={tiers}
                newTabHint={sponsorsPage.newTabHint}
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
