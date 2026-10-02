import { useRef } from "react";
import "./TopChallenges.css";

import { challenges } from "../../../data/homepageData";
import { ArrowRightIcon } from "../../common/Icons/Icons";
import { actionIcons } from "../../common/Icons/iconRegistry";
import { useRevealGroup } from "../../../hooks/useReveal";

const HeaderActionIcon = actionIcons[challenges.action.icon];

function ChallengeCard({ challenge }) {
  const { id, slug, category, title, description, image, imageAlt } = challenge;

  return (
    <li className="challenge-card" data-reveal-item>
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

          <a
            className="challenge-arrow"
            href={`/challenges/${slug}`}
            aria-label={`View the ${title} challenge`}
          >
            <ArrowRightIcon size={16} />
          </a>
        </div>
      </article>
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

          <a href={challenges.action.href} className="arrow-link">
            {challenges.action.label}
            <HeaderActionIcon size={16} />
          </a>
        </header>

        {/*
          Dedicated horizontal scroll container.
          `overflow-x: auto` on a block-level box gives the list its own
          scrolling viewport; the cards that exceed it scroll *inside* it, so
          the document width is never affected. Desktop lays all four cards
          out in a single row because each one is allowed to shrink.
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