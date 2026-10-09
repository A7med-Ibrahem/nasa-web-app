import "./ChallengeContent.css";

import { challengeDetailsPage } from "../../../data/challengesData";

/**
 * A record value can be one paragraph or a list of them; both shapes render
 * as the same stack of `<p>`s, so content length stays a data decision.
 */
function toParagraphs(value) {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * Turn a single value or an array into a non-empty list of strings, used by
 * the bulleted sections (KPIs).
 */
function toList(value) {
  if (!value) {
    return [];
  }
  const items = Array.isArray(value) ? value : [value];
  return items.filter((item) => item && item.trim);
}

/**
 * Main column of the details page.
 *
 * Reads the official challenge record and renders every supplied field, in
 * the order laid out by the page brief:
 *
 *   Overview            — Main Objective, Business Objectives
 *   Audience & domains  — Technical/Business Domains, Target Audience
 *   Understanding       — Key Insights, Main Challenges Identified
 *   Proposed solution   — Recommendations
 *   Implementation      — Action / Marketing Plan
 *   Success metrics     — KPIs
 *
 * Entirely data-driven — the page never hardcodes a section title, and a
 * future API payload with different (or missing) fields needs no JSX edits.
 * A field the record does not carry is simply not rendered.
 */
export default function ChallengeContent({ challenge }) {
  const { sectionTitles } = challengeDetailsPage;

  const blocks = [];

  if (challenge.mainObjective) {
    blocks.push({
      id: "objective",
      title: sectionTitles.objective,
      variant: "about",
      paragraphs: toParagraphs(challenge.mainObjective),
    });
  }

  if (challenge.businessObjectives) {
    blocks.push({
      id: "business-objectives",
      title: sectionTitles.businessObjectives,
      paragraphs: toParagraphs(challenge.businessObjectives),
    });
  }

  const domains = toList(challenge.domains);
  if (domains.length > 0) {
    blocks.push({
      id: "domains",
      title: sectionTitles.domains,
      tags: domains,
    });
  }

  if (challenge.targetAudience) {
    blocks.push({
      id: "audience",
      title: sectionTitles.audience,
      paragraphs: toParagraphs(challenge.targetAudience),
    });
  }

  if (challenge.keyInsights) {
    blocks.push({
      id: "key-insights",
      title: sectionTitles.keyInsights,
      paragraphs: toParagraphs(challenge.keyInsights),
    });
  }

  if (challenge.mainChallenges) {
    blocks.push({
      id: "main-challenges",
      title: sectionTitles.mainChallenges,
      paragraphs: toParagraphs(challenge.mainChallenges),
    });
  }

  if (challenge.recommendations) {
    blocks.push({
      id: "recommendations",
      title: sectionTitles.recommendations,
      paragraphs: toParagraphs(challenge.recommendations),
    });
  }

  if (challenge.actionMarketingPlan) {
    blocks.push({
      id: "action-marketing-plan",
      title: sectionTitles.actionMarketingPlan,
      paragraphs: toParagraphs(challenge.actionMarketingPlan),
    });
  }

  const kpis = toList(challenge.kpis);
  if (kpis.length > 0) {
    blocks.push({
      id: "kpis",
      title: sectionTitles.kpis,
      items: kpis,
    });
  }

  return (
    <div className="challenge-content">
      {blocks.map((block) => (
        <section
          key={block.id}
          className={`challenge-content-block${
            block.variant ? ` challenge-content-block--${block.variant}` : ""
          }`}
          aria-labelledby={`challenge-section-${block.id}`}
        >
          <h2
            className="challenge-details-heading"
            id={`challenge-section-${block.id}`}
          >
            {block.title}
          </h2>

          {block.paragraphs ? (
            <div className="challenge-content-prose">
              {block.paragraphs.map((paragraph, index) => (
                <p key={`${block.id}-${index}`}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {block.items ? (
            <ul className="challenge-content-list">
              {block.items.map((item, index) => (
                <li key={`${block.id}-${index}`}>{item}</li>
              ))}
            </ul>
          ) : null}

          {block.tags ? (
            <ul className="challenge-content-tags">
              {block.tags.map((tag, index) => (
                <li className="challenge-content-tag" key={`${block.id}-${index}`}>
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
