import { useRef } from "react";
import "./ChallengeCTA.css";

import { challengeDetailsPage } from "../../../data/challengesData";
import { ArrowRightIcon } from "../../common/Icons/Icons";
import { useRevealGroup } from "../../../hooks/useReveal";

/**
 * Closing call to action — the band between the challenge content and the
 * shared Footer.
 *
 * Copy and destination are data (challengeDetailsPage.cta), so the same
 * component serves every challenge and a future registration URL replaces one
 * field. Two reveal items only: the headline block and the button — motion
 * stays deliberate rather than theatrical, per the project's animation rules.
 *
 * Like the sidebar CTA, the anchor is external today and gains new-tab
 * behaviour + a screen-reader note only when the destination is a full URL.
 */
export default function ChallengeCTA() {
  const sectionRef = useRef(null);
  const { title, lines, action } = challengeDetailsPage.cta;

  useRevealGroup(sectionRef, { stagger: 110 });

  const isExternal = /^https?:\/\//.test(action.href);

  return (
    <section
      className="challenge-cta on-dark"
      ref={sectionRef}
      aria-labelledby="challenge-cta-title"
    >
      <div className="container challenge-cta-inner">
        <div className="challenge-cta-copy" data-reveal-item>
          <h2 className="challenge-cta-title" id="challenge-cta-title">
            {title}
          </h2>

          <p className="challenge-cta-description">
            {lines.map((line) => (
              <span className="challenge-cta-line" key={line}>
                {line}
              </span>
            ))}
          </p>
        </div>

        <a
          className="btn btn--primary challenge-cta-action"
          href={action.href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          data-reveal-item
        >
          {action.label}
          <ArrowRightIcon size={17} />
          {isExternal ? (
            <span className="visually-hidden">
              {challengeDetailsPage.newTabHint}
            </span>
          ) : null}
        </a>
      </div>
    </section>
  );
}
