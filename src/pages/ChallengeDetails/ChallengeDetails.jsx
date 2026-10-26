import { useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "./ChallengeDetails.css";

import { fetchChallenge, parseChallengeId } from "../../api/challenges";
import ChallengeCTA from "../../components/challengeDetails/ChallengeCTA/ChallengeCTA";
import ChallengeContent from "../../components/challengeDetails/ChallengeContent/ChallengeContent";
import ChallengeHero from "../../components/challengeDetails/ChallengeHero/ChallengeHero";
import ChallengeInfo from "../../components/challengeDetails/ChallengeInfo/ChallengeInfo";
import DataState from "../../components/common/DataState/DataState";
import { ArrowLeftIcon } from "../../components/common/Icons/Icons";
import { challengeDetailsPage } from "../../data/challengesData";
import { site } from "../../data/site";
import useApiResource from "../../hooks/useApiResource";

/**
 * Challenge details page (`/challenges/:challengeId`).
 *
 * GET /challenges/{challengeId} is the only data source. The route value is
 * validated locally before any request, so a non-numeric id never reaches the
 * network and renders the same not-found state as a real 404. Other failures
 * keep the page shell and offer a retry instead of pretending the record does
 * not exist.
 *
 * Composition only: no Navbar, no Footer (MainLayout owns both — the
 * Challenges nav item stays active because `/challenges` is a prefix of every
 * details route).
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

/** A renderable record needs an id and a title; everything else is optional. */
function isChallengeRecord(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value.title === "string" &&
    value.title.trim() !== ""
  );
}

export default function ChallengeDetails() {
  const { challengeId } = useParams();
  const parsedId = parseChallengeId(challengeId);

  const loadChallenge = useCallback(
    (options = {}) => fetchChallenge(parsedId, options),
    [parsedId],
  );

  const { status, data, error, retry } = useApiResource(loadChallenge, {
    enabled: parsedId !== null,
  });

  const record = status === "ready" && isChallengeRecord(data) ? data : null;
  const recordId = record ? parseChallengeId(record.challengeId) : null;
  const challenge = recordId !== null && recordId === parsedId ? record : null;

  const notFound =
    parsedId === null ||
    (status === "error" && error?.status === 404) ||
    (status === "ready" && (record === null || recordId === null));

  let documentName = "";
  if (challenge) {
    documentName = challenge.title;
  } else if (notFound) {
    documentName = challengeDetailsPage.notFound.title;
  } else if (status === "error") {
    documentName = challengeDetailsPage.states.errorTitle;
  }

  useEffect(() => {
    document.title = documentName ? `${documentName} — ${site.name}` : site.name;
  }, [documentName]);

  if (notFound) {
    return <ChallengeNotFound />;
  }

  if (status === "error") {
    return (
      <div className="challenge-details-page">
        <div className="container challenge-details-state">
          <DataState
            status="error"
            title={challengeDetailsPage.states.errorTitle}
            message={error?.message}
            retryLabel={challengeDetailsPage.states.retry}
            onRetry={retry}
          />
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="challenge-details-page">
        <div className="container challenge-details-state">
          <DataState
            status="loading"
            title={challengeDetailsPage.states.loading}
          />
        </div>
      </div>
    );
  }

  const hasDescription =
    typeof challenge.description === "string" &&
    challenge.description.trim() !== "";
  const hasInfo = Boolean(challenge.source) || Boolean(challenge.season);

  return (
    <div className="challenge-details-page" key={challenge.challengeId}>
      <ChallengeHero challenge={challenge} />

      {hasDescription || hasInfo ? (
        <div
          className={`container challenge-details-layout${
            hasInfo ? "" : " challenge-details-layout--single"
          }`}
        >
          <div className="challenge-details-main">
            {hasDescription ? <ChallengeContent challenge={challenge} /> : null}
          </div>

          {hasInfo ? (
            <aside
              className="challenge-details-aside"
              aria-label={challengeDetailsPage.info.title}
            >
              <ChallengeInfo challenge={challenge} />
            </aside>
          ) : null}
        </div>
      ) : null}

      <ChallengeCTA />
    </div>
  );
}
