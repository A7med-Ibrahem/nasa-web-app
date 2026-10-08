import "./ChallengeInfo.css";

import {
  challengeDetailsPage,
  difficultyLabels,
} from "../../../data/challengesData";
import { ArrowRightIcon, CalendarIcon, UsersIcon } from "../../common/Icons/Icons";
import { challengeIcons } from "../../common/Icons/iconRegistry";

/**
 * "Challenge Info" sidebar card: a labelled-value summary of the record plus
 * the page's primary CTA.
 *
 * The four rows are fixed content (the spec of this card), but every *value*
 * comes from the challenge record and every string comes from
 * challengeDetailsPage — so an API response with the same shape fills the card
 * untouched. Values degrade to an em dash instead of rendering `undefined`.
 *
 * The CTA is a plain anchor driven by `join.href` in the data: with no
 * registration backend, it points at the official Space Apps site, and
 * swapping in the local form is a one-field change. External destinations get
 * the project's standard new-tab treatment (see Footer) plus a screen-reader
 * note, because new-tab behaviour alone is invisible.
 */
export default function ChallengeInfo({ challenge }) {
  const { info, join } = challengeDetailsPage;
  const { categoryLabel, categoryIcon, difficulty, season, organizer } = challenge;

  const CategoryIcon = challengeIcons[categoryIcon];
  const DifficultyIcon = challengeIcons.bars;

  /* Presentation only: which glyph sits beside each label. The label and the
     value themselves are data. */
  const rows = [
    {
      id: "category",
      icon: CategoryIcon ? <CategoryIcon size={16} /> : null,
      label: info.labels.category,
      value: categoryLabel,
    },
    {
      id: "difficulty",
      icon: DifficultyIcon ? <DifficultyIcon size={16} /> : null,
      label: info.labels.difficulty,
      /* Difficulty reaches the UI as an enum; the display string is data. */
      value: difficultyLabels[difficulty] ?? difficulty,
    },
    {
      id: "season",
      icon: <CalendarIcon size={16} />,
      label: info.labels.season,
      value: season,
    },
    {
      id: "organizer",
      icon: <UsersIcon size={16} />,
      label: info.labels.organizer,
      value: organizer,
    },
  ];

  const isExternal = /^https?:\/\//.test(join.href);

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
            <dd className="challenge-info-value">{row.value ?? "—"}</dd>
          </div>
        ))}
      </dl>

      <a
        className="btn btn--primary challenge-info-cta"
        href={join.href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {join.label}
        <ArrowRightIcon size={16} />
        {isExternal ? (
          <span className="visually-hidden">
            {challengeDetailsPage.newTabHint}
          </span>
        ) : null}
      </a>
    </section>
  );
}
