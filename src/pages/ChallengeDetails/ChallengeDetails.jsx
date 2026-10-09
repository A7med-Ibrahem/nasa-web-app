import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import "./ChallengeDetails.css";

import ChallengeCTA from "../../components/challengeDetails/ChallengeCTA/ChallengeCTA";
import ChallengeContent from "../../components/challengeDetails/ChallengeContent/ChallengeContent";
import ChallengeHero from "../../components/challengeDetails/ChallengeHero/ChallengeHero";
import ChallengeInfo from "../../components/challengeDetails/ChallengeInfo/ChallengeInfo";
import ChallengeNav from "../../components/challengeDetails/ChallengeNav/ChallengeNav";
import { ArrowLeftIcon } from "../../components/common/Icons/Icons";
import { challengeDetailsPage, staticChallenges } from "../../data/challengesData";
import { site } from "../../data/site";

/**
 * Challenge details page (`/challenges/:slug`).
 *
 * One reusable page for every challenge — never one page per challenge. The
 * slug comes from React Router, is resolved against the challenge collection
 * exactly the way a future `GET /api/challenges/:slug` would be, and the whole
 * record is passed down through props. When a backend exists, the lookup
 * becomes an await and nothing below this line changes.
 *
 * The record's index in the shared list also yields its previous and next
 * challenges, so the page can offer sequential navigation without a second
 * data source. Composition only, like every other page: no Navbar, no Footer
 * (MainLayout owns both — the Challenges nav item stays active because
 * `/challenges` is a prefix of every slug route).
 *
 * An unknown slug renders a proper not-found state instead of crashing or
 * redirecting silently; the document title follows whichever state renders.
 */
function ChallengeNotFound() {
  const { title, description, action } = challengeDetailsPage.notFound;

  return (
    <div className="challenge-details-notfound">
      <div className="container challenge-details-notfound-inner">
        <h1 className="challenge-details-notfound-title">{title}</h1>

        <p className="challenge-details-notfound-description">{description}</p>

        <Link className="btn btn--primary" to={action.href}>
          <ArrowLeftIcon size={16} />
          {action.label}
        </Link>
      </div>
    </div>
  );
}

export default function ChallengeDetails() {
  const { slug } = useParams();

  const { challenge, previous, next } = useMemo(() => {
    const index = staticChallenges.findIndex((item) => item.slug === slug);

    return {
      challenge: index >= 0 ? staticChallenges[index] : null,
      previous: index > 0 ? staticChallenges[index - 1] : null,
      next:
        index >= 0 && index < staticChallenges.length - 1
          ? staticChallenges[index + 1]
          : null,
    };
  }, [slug]);

  useEffect(() => {
    document.title = challenge
      ? `${challenge.title} — ${site.name}`
      : `${challengeDetailsPage.notFound.title} — ${site.name}`;
  }, [challenge]);

  if (!challenge) {
    return <ChallengeNotFound />;
  }

  return (
    <div className="challenge-details-page">
      <ChallengeHero challenge={challenge} />

      <div className="container challenge-details-layout">
        {/* DOM order is also the mobile stack order: main content first,
            Challenge Info card after it. */}
        <div className="challenge-details-main">
          <ChallengeContent challenge={challenge} />
          <ChallengeNav previous={previous} next={next} />
        </div>

        <aside
          className="challenge-details-aside"
          aria-label={challengeDetailsPage.info.title}
        >
          <ChallengeInfo challenge={challenge} />
        </aside>
      </div>

      <ChallengeCTA />
    </div>
  );
}
