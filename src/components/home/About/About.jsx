import { useRef } from "react";
import "./About.css";

import { about } from "../../../data/homepageData";
import { actionIcons, statisticIcons } from "../../common/Icons/iconRegistry";
import useCountUp from "../../../hooks/useCountUp";
import { useInView, useRevealGroup } from "../../../hooks/useReveal";

const ActionIcon = actionIcons[about.action.icon];

function Statistic({ value, label, icon, active }) {
  const Icon = statisticIcons[icon] ?? statisticIcons.globe;
  const displayValue = useCountUp(value, { active });

  return (
    <li className="about-stat" data-reveal-item>
      <span className="about-stat-icon">
        <Icon />
      </span>
      <span className="about-stat-body">
        <span className="about-stat-value">{displayValue}</span>
        <span className="about-stat-label">{label}</span>
      </span>
    </li>
  );
}

export default function About() {
  const sectionRef = useRef(null);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef);

  useRevealGroup(sectionRef, { stagger: 90 });

  return (
    <section
      className="section section--dark about"
      id="about"
      ref={sectionRef}
      aria-labelledby="about-title"
    >
      <div className="container about-inner">
        <div className="about-text" data-reveal-item>
          <p className="eyebrow">{about.eyebrow}</p>

          <h2 id="about-title" className="section-title">
            {about.titleLines[0]}
            <br />
            {about.titleLines[1]}
          </h2>

          <p className="section-desc about-description">{about.description}</p>

          <a href={about.action.href} className="btn btn--ghost-dark">
            {about.action.label}
            <ActionIcon />
          </a>
        </div>

        <figure className="about-figure" data-reveal-item data-reveal-variant="right">
          <img
            className="about-image"
            src={about.image.src}
            alt={about.image.alt}
            loading="lazy"
            decoding="async"
          />
        </figure>

        <ul className="about-stats" ref={statsRef}>
          {about.statistics.map((statistic) => (
            <Statistic key={statistic.id} {...statistic} active={statsInView} />
          ))}
        </ul>
      </div>
    </section>
  );
}