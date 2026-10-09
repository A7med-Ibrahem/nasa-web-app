import { useRef } from "react";
import { Link } from "react-router-dom";
import "./TopChallenges.css";

import { challenges } from "../../../data/homepageData";
import { ArrowRightIcon } from "../../common/Icons/Icons";
import { actionIcons } from "../../common/Icons/iconRegistry";
import { useRevealGroup } from "../../../hooks/useReveal";

const HeaderActionIcon = actionIcons[challenges.action.icon];

/* How many domain tags a card shows before it would grow too tall; the full
   list is always available on the challenge details page. */
const CARD_TAG_LIMIT = 3;

function ChallengeCard({ challenge }) {
  const { id, slug, category, title, description, domains, image, imageAlt } =
    challenge;
  const tags = Array.isArray(domains) ? domains.slice(0, CARD_TAG_LIMIT) : [];

  return (
    <li className="challenge-card" data-reveal-item>
      {/* The whole card is the link to its details route, so click, keyboard
          and touch all lead to the same /challenges/:slug page. */}
      <Link className="challenge-card-link" to={`/challenges/${slug}`}>
        <article aria-labelledby={`challenge-${id}`}>
          <div className="challenge-media">
            <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
          </div>

          <div className="challenge-body">
            <p className="challenge-category">{category}</p>

            <h3 className="challenge-title" id={`challenge-${id}`}>
              {title}
            </h3>

            <p className="challenge-description">{description}</p>

            {tags.length > 0 ? (
              <ul className="challenge-tags">
                {tags.map((tag) => (
                  <li className="challenge-tag" key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}

            <span className="challenge-arrow">
              <span>Explore Challenge</span>
              <ArrowRightIcon size={16} />
            </span>
          </div>
        </article>
      </Link>
    </li>
  );
}

export default function TopChallenges() {
  const sectionRef = useRef(null);

  useRevealGroup(sectionRef, { stagger: 110 });

  return (
    <section
      className="section section--dark top-challenges"
      ref={sectionRef}
      aria-labelledby="top-challenges-title"
    >
      <div className="container">
        <header className="challenges-header" data-reveal-item>
          <div className="challenges-header-text">
            <p className="eyebrow">{challenges.eyebrow}</p>

            <h2 id="top-challenges-title" className="section-title">
              {challenges.title}
            </h2>

            <p className="section-desc">{challenges.description}</p>
          </div>

          <Link to={challenges.action.href} className="arrow-link">
            {challenges.action.label}
            <HeaderActionIcon size={16} />
          </Link>
        </header>

        {/*
          Dedicated horizontal scroll container.
          `overflow-x: auto` on a block-level box gives the list its own
          scrolling viewport; the cards that exceed it scroll *inside* it, so
          the document width is never affected.
        */}
        <ul className="challenge-list" tabIndex={0} aria-label="Featured challenges">
          {challenges.items.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </ul>
      </div>
    </section>
  );
}
