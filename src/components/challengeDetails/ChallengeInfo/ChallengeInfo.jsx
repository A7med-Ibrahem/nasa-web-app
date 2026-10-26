import "./ChallengeInfo.css";

import { challengeDetailsPage } from "../../../data/challengesData";
import { CalendarIcon, GlobeIcon } from "../../common/Icons/Icons";

/**
 * "Challenge Info" sidebar card: the record's source and season.
 *
 * Values come straight from the API and a missing value simply removes its
 * row. If the record has neither, the card renders nothing rather than an
 * empty shell.
 */
export default function ChallengeInfo({ challenge }) {
  const { info } = challengeDetailsPage;
  const { source, season } = challenge;

  const rows = [];

  if (source) {
    rows.push({
      id: "source",
      icon: <GlobeIcon size={16} />,
      label: info.labels.source,
      value: source,
    });
  }

  if (season) {
    rows.push({
      id: "season",
      icon: <CalendarIcon size={16} />,
      label: info.labels.season,
      value: season,
    });
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="challenge-info" aria-labelledby="challenge-info-title">
      <h2 className="challenge-details-heading" id="challenge-info-title">
        {info.title}
      </h2>

      <dl className="challenge-info-list">
        {rows.map((row) => (
          <div className="challenge-info-row" key={row.id}>
            <dt className="challenge-info-label">
              <span className="challenge-info-icon" aria-hidden="true">
                {row.icon}
              </span>
              <span>{row.label}</span>
            </dt>
            <dd className="challenge-info-value">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
