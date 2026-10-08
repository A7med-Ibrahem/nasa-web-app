import "./ChallengeResources.css";

import { challengeDetailsPage } from "../../../data/challengesData";
import { ExternalLinkIcon } from "../../common/Icons/Icons";

/**
 * Optional resources list for the details page.
 *
 * Renders nothing at all when the record carries no resources — an empty
 * section, a placeholder row or a fabricated link would all be worse than
 * silence, and two of today's six challenges deliberately ship `resources: []`.
 *
 * Links come from the record, always to live official destinations (verified
 * when written), and follow the project's external-link convention:
 * `target="_blank"` + `rel="noopener noreferrer"` (same as the Footer socials)
 * plus a screen-reader note, since new-tab behaviour cannot be perceived
 * visually.
 */
export default function ChallengeResources({ resources }) {
  const items = (Array.isArray(resources) ? resources : []).filter(
    (item) => item && item.title && item.url,
  );

  if (items.length === 0) {
    return null;
  }

  const { title } = challengeDetailsPage.resources;
  const { newTabHint } = challengeDetailsPage;

  return (
    <section
      className="challenge-resources"
      aria-labelledby="challenge-resources-title"
    >
      <h2 className="challenge-details-heading" id="challenge-resources-title">
        {title}
      </h2>

      <ul className="challenge-resources-list">
        {items.map((item) => (
          <li key={item.url} className="challenge-resources-item">
            <a
              className="challenge-resources-link"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="challenge-resources-label">{item.title}</span>
              <ExternalLinkIcon size={15} />
              <span className="visually-hidden">{newTabHint}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
