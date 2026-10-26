import "./ChallengeContent.css";

import { challengeDetailsPage } from "../../../data/challengesData";
import { splitParagraphs } from "../../../utils/apiContent";

/**
 * Main column of the details page.
 *
 * The API supplies a single plain-text `description`; it is split on blank
 * lines and rendered as `<p>` elements. Single newlines inside a paragraph
 * survive because the prose style uses `white-space: pre-line`. The text is
 * never interpreted as HTML.
 */
export default function ChallengeContent({ challenge }) {
  const { sectionTitles } = challengeDetailsPage;
  const paragraphs = splitParagraphs(challenge.description);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <div className="challenge-content">
      <section
        className="challenge-content-block challenge-content-block--about"
        aria-labelledby="challenge-section-description"
      >
        <h2
          className="challenge-details-heading"
          id="challenge-section-description"
        >
          {sectionTitles.description}
        </h2>

        <div className="challenge-content-prose">
          {paragraphs.map((paragraph, index) => (
            <p key={`description-${index}`}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
