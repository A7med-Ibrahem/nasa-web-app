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
 * Main column of the details page: "About this challenge" plus every record
 * section, rendered in data order.
 *
 * Entirely data-driven — the page never hardcodes a section title, and the
 * component copes with any section count (Global Health ships two, A Brighter
 * Future ships four) and any content length without changing. Each block is a
 * labelled `<section>` so the heading outline stays h1 (hero) → h2 → h2, and
 * a future API payload with different sections needs no JSX edits.
 */
export default function ChallengeContent({ challenge }) {
  const intro = toParagraphs(challenge.longDescription);
  const sections = Array.isArray(challenge.sections) ? challenge.sections : [];

  return (
    <div className="challenge-content">
      <section
        className="challenge-content-block challenge-content-block--about"
        aria-labelledby="challenge-about-title"
      >
        <h2 className="challenge-details-heading" id="challenge-about-title">
          {challengeDetailsPage.aboutTitle}
        </h2>

        <div className="challenge-content-prose">
          {intro.map((paragraph, index) => (
            <p key={`about-${index}`}>{paragraph}</p>
          ))}
        </div>
      </section>

      {sections.map((section) => (
        <section
          key={section.id}
          className="challenge-content-block"
          aria-labelledby={`challenge-section-${section.id}`}
        >
          <h2
            className="challenge-details-heading"
            id={`challenge-section-${section.id}`}
          >
            {section.title}
          </h2>

          <div className="challenge-content-prose">
            {toParagraphs(section.content).map((paragraph, index) => (
              <p key={`${section.id}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
