import "./About.css";

import { about } from "../../data/homepageData";
import { actionIcons, statisticIcons } from "../Icons/iconRegistry";

const ActionIcon = actionIcons[about.action.icon];

function Statistic({ value, label, icon }) {
  const Icon = statisticIcons[icon] ?? statisticIcons.globe;

  return (
    <li className="about-stat">
      <span className="about-stat-icon">
        <Icon />
      </span>
      <span className="about-stat-body">
        <span className="about-stat-value">{value}</span>
        <span className="about-stat-label">{label}</span>
      </span>
    </li>
  );
}

export default function About() {
  return (
    <section className="section section--dark about" id="about" aria-labelledby="about-title">
      <div className="container about-inner">
        <div className="about-text">
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

        <figure className="about-figure">
          <img
            className="about-image"
            src={about.image.src}
            alt={about.image.alt}
            loading="lazy"
            decoding="async"
          />
        </figure>

        <ul className="about-stats">
          {about.statistics.map((statistic) => (
            <Statistic key={statistic.id} {...statistic} />
          ))}
        </ul>
      </div>
    </section>
  );
}