import { useRef } from "react";
import "./QuickStatsCard.css";

import { quickStats } from "../../../data/liveStandingsData";
import { statisticIcons } from "../../common/Icons/iconRegistry";
import useCountUp from "../../../hooks/useCountUp";
import { useInView } from "../../../hooks/useReveal";

function Stat({ value, label, icon, format, active }) {
  const Icon = statisticIcons[icon] ?? statisticIcons.chart;

  /*
   * Reuses the homepage count-up, so the two pages share one implementation and
   * one set of reduced-motion rules. `format: "count"` marks a value as
   * animatable; anything else renders verbatim.
   */
  const displayValue = useCountUp(value, {
    active: active && format === "count",
  });

  return (
    <li className="quick-stat">
      <span className="quick-stat-icon" aria-hidden="true">
        <Icon size={20} />
      </span>

      <span className="quick-stat-body">
        <span className="quick-stat-value">{displayValue}</span>
        <span className="quick-stat-label">{label}</span>
      </span>
    </li>
  );
}

export default function QuickStatsCard() {
  const listRef = useRef(null);
  const inView = useInView(listRef);

  return (
    <article className="sidebar-card quick-stats" data-reveal-item>
      <h3 className="sidebar-card-title">{quickStats.title}</h3>

      <ul className="quick-stat-list" ref={listRef}>
        {quickStats.items.map((stat) => (
          <Stat key={stat.id} {...stat} active={inView} />
        ))}
      </ul>
    </article>
  );
}