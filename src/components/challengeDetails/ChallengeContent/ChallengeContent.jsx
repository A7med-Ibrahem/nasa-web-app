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
 * the bulleted sections (key insights, main challenges to address, suggested
 * directions, success metrics).
 */
function toList(value) {
  if (!value) {
    return [];
  }
  const items = Array.isArray(value) ? value : [value];
  return items.filter((item) => item && item.trim);
}

/**
 * Main column of the details page: "Challenge Overview" plus every structured
 * field the record carries, rendered in a fixed order and only when the data
 * exists.
 *
 * Entirely data-driven — the page never hardcodes a section title, and a
 * future API payload with different (or missing) fields needs no JSX edits.
 * Fields the 2026 document does not specify ship empty, so those blocks are
 * simply not rendered. The recommendations block carries a note making clear
 * the suggestions are context, not mandatory submission requirements.
 */
export default function ChallengeContent({ challenge }) {
  const { overviewTitle, sectionTitles, recommendationsNote } = challengeDetailsPage;

  const blocks = [];

  if (challenge.overview) {
    blocks.push({
      id: "overview",
      title: overviewTitle,
      variant: "about",
      paragraphs: toParagraphs(challenge.overview),
    });
  }

  if (challenge.mainObjective) {
    blocks.push({
      id: "objective",
      title: sectionTitles.objective,
      paragraphs: toParagraphs(challenge.mainObjective),
    });
  }

  if (challenge.targetAudience) {
    blocks.push({
      id: "audience",
      title: sectionTitles.audience,
      paragraphs: toParagraphs(challenge.targetAudience),
    });
  }

  const keyInsights = toList(challenge.keyInsights);
  if (keyInsights.length > 0) {
    blocks.push({
      id: "key-insights",
      title: sectionTitles.keyInsights,
      items: keyInsights,
    });
  }

  const identifiedChallenges = toList(challenge.identifiedChallenges);
  if (identifiedChallenges.length > 0) {
    blocks.push({
      id: "identified-challenges",
      title: sectionTitles.identifiedChallenges,
      items: identifiedChallenges,
    });
  }

  const recommendations = toList(challenge.recommendations);
  if (recommendations.length > 0) {
    blocks.push({
      id: "recommendations",
      title: sectionTitles.recommendations,
      items: recommendations,
      note: recommendationsNote,
    });
  }

  const successMetrics = toList(challenge.successMetrics);
  if (successMetrics.length > 0) {
    blocks.push({
      id: "success-metrics",
      title: sectionTitles.successMetrics,
      items: successMetrics,
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

          {block.note ? <p className="challenge-content-note">{block.note}</p> : null}
        </section>
      ))}
    </div>
  );
}