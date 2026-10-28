import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminOverview.css";

import { fetchStaff } from "../../api/admin/staff";
import { fetchSponsorsAdmin, fetchSponsorTiersAdmin } from "../../api/admin/sponsors";
import { fetchCriteriaAdmin } from "../../api/admin/criteria";
import { fetchQuestionsAdmin } from "../../api/admin/questions";
import { fetchSeasonMediaAdmin } from "../../api/admin/seasonMedia";
import { fetchChallenges } from "../../api/challenges";
import { searchTeams } from "../../api/teams";
import { fetchStaffRequests } from "../../api/staffArea";
import { fetchStandings } from "../../api/standings";
import { adminData } from "../../data/adminData";
import { site } from "../../data/site";
import { loadMessage } from "../../utils/adminErrors";
import { toFiniteNumber } from "../../utils/numbers";

import AdminPageHeader from "../../components/admin/AdminPageHeader/AdminPageHeader";

function OverviewCard({ title, link, children }) {
  return (
    <section className="admin-overview-card">
      <header className="admin-overview-card-header">
        <h2 className="admin-overview-card-title">{title}</h2>
        <Link className="admin-overview-card-link" to={link}>
          View
        </Link>
      </header>
      <div className="admin-overview-card-body">{children}</div>
    </section>
  );
}

function CardState({ status, error, onRetry, children }) {
  if (status === "loading") {
    return <span>{adminData.common.loading}</span>;
  }
  if (status === "error") {
    return (
      <div className="admin-overview-card-error">
        <div>{loadMessage(error, adminData.overview.states.errorTitle)}</div>
        {onRetry ? (
          <button type="button" className="admin-overview-card-retry" onClick={onRetry}>
            {adminData.common.retry}
          </button>
        ) : null}
      </div>
    );
  }
  return <>{children}</>;
}

export default function AdminOverview() {
  const copy = adminData.overview;

  const [lastUpdated, setLastUpdated] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [staffState, setStaffState] = useState({ status: "loading", data: [], error: null });
  const [sponsorsState, setSponsorsState] = useState({ status: "loading", data: [], error: null });
  const [tiersState, setTiersState] = useState({ status: "loading", data: [], error: null });
  const [teamsState, setTeamsState] = useState({ status: "loading", data: [], error: null });
  const [challengesState, setChallengesState] = useState({ status: "loading", data: [], error: null });
  const [criteriaState, setCriteriaState] = useState({ status: "loading", data: [], error: null });
  const [questionsState, setQuestionsState] = useState({ status: "loading", data: [], error: null });
  const [requestsState, setRequestsState] = useState({ status: "loading", data: [], error: null });
  const [seasonMediaState, setSeasonMediaState] = useState({ status: "loading", data: [], error: null });
  const [standingsState, setStandingsState] = useState({ status: "loading", data: [], error: null });

  const staffRef = useRef(0);
  const sponsorsRef = useRef(0);
  const tiersRef = useRef(0);
  const teamsRef = useRef(0);
  const challengesRef = useRef(0);
  const criteriaRef = useRef(0);
  const questionsRef = useRef(0);
  const requestsRef = useRef(0);
  const seasonMediaRef = useRef(0);
  const standingsRef = useRef(0);

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

  const loadAll = useCallback(async () => {
    setLastUpdated(new Date());

    const run = (ref, setter, fn) => {
      const id = ref.current + 1;
      ref.current = id;
      setter((current) => ({ ...current, status: "loading", error: null }));
      fn()
        .then((data) => {
          if (ref.current !== id) return;
          setter({ status: "ready", data: Array.isArray(data) ? data : [], error: null });
        })
        .catch((cause) => {
          if (ref.current !== id) return;
          setter({ status: "error", data: [], error: cause });
        });
    };

    run(staffRef, setStaffState, () => fetchStaff({}));
    run(sponsorsRef, setSponsorsState, () => fetchSponsorsAdmin({ includeInactive: true }));
    run(tiersRef, setTiersState, () => fetchSponsorTiersAdmin({}));
    run(teamsRef, setTeamsState, () => searchTeams(""));
    run(challengesRef, setChallengesState, () => fetchChallenges({}));
    run(criteriaRef, setCriteriaState, () => fetchCriteriaAdmin({}));
    run(questionsRef, setQuestionsState, () => fetchQuestionsAdmin({}));
    run(requestsRef, setRequestsState, () => fetchStaffRequests({}));
    run(seasonMediaRef, setSeasonMediaState, () => fetchSeasonMediaAdmin({ includeInactive: true }));
    run(standingsRef, setStandingsState, () => fetchStandings({}));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAll();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAll, reloadKey]);

  function handleRefresh() {
    setReloadKey((current) => current + 1);
  }

  const staffRows = staffState.data;
  const staffTotal = staffRows.length;
  const staffByRole = useMemo(() => {
    const counts = {};
    for (const row of staffRows) {
      const role = row?.role || "Unknown";
      counts[role] = (counts[role] || 0) + 1;
    }
    return counts;
  }, [staffRows]);
  const staffInactive = useMemo(
    () => staffRows.filter((row) => String(row?.status || "").toLowerCase() === "inactive").length,
    [staffRows],
  );

  const sponsorsRows = sponsorsState.data;
  const sponsorsActive = useMemo(
    () => sponsorsRows.filter((row) => row?.active !== false).length,
    [sponsorsRows],
  );
  const sponsorsInactive = sponsorsRows.length - sponsorsActive;
  const tiersCount = tiersState.data.length;

  const teamsRows = teamsState.data;
  const teamsTotal = teamsRows.length;
  const teamsActive = useMemo(
    () => teamsRows.filter((row) => row?.isActive !== false).length,
    [teamsRows],
  );

  const challengesRows = challengesState.data;
  const criteriaRows = criteriaState.data;
  const questionsRows = questionsState.data;
  const requestsRows = requestsState.data;
  const seasonMediaRows = seasonMediaState.data;

  const criteriaPublished = useMemo(
    () => criteriaRows.filter((row) => row?.isPublished).length,
    [criteriaRows],
  );
  const criteriaGlobal = useMemo(
    () => criteriaRows.filter((row) => row?.challengeId === null || row?.challengeId === undefined).length,
    [criteriaRows],
  );

  const questionsPublished = useMemo(
    () => questionsRows.filter((row) => row?.isPublished).length,
    [questionsRows],
  );

  const seasonMediaActive = useMemo(
    () => seasonMediaRows.filter((row) => row?.active !== false).length,
    [seasonMediaRows],
  );
  const seasonMediaInactive = seasonMediaRows.length - seasonMediaActive;

  const standings = Array.isArray(standingsState.data) ? standingsState.data : [];
  const topThree = standings.slice(0, 3);

  const lastUpdatedText = lastUpdated
    ? copy.lastUpdated(lastUpdated.toLocaleString())
    : "";

  return (
    <div className="admin-overview">
      <div className="admin-overview-header">
        <AdminPageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          titleId="admin-overview-title"
        />
        <div className="admin-overview-actions">
          <button type="button" className="btn btn--ghost-dark" onClick={handleRefresh}>
            {copy.refresh}
          </button>
          {lastUpdatedText ? <span className="admin-overview-lastupdated">{lastUpdatedText}</span> : null}
        </div>
      </div>

      <div className="admin-overview-grid">
        <OverviewCard title={copy.cards.staff.title} link={copy.cards.staff.link}>
          <CardState status={staffState.status} error={staffState.error} onRetry={() => setReloadKey((c) => c + 1)}>
            <div>{copy.staff.total(staffTotal)}</div>
            {Object.keys(staffByRole).map((role) => (
              <div key={role}>{copy.staff.byRole(role, staffByRole[role])}</div>
            ))}
            <div>{copy.staff.inactive(staffInactive)}</div>
          </CardState>
        </OverviewCard>

        <OverviewCard title={copy.cards.sponsors.title} link={copy.cards.sponsors.link}>
          <CardState status={sponsorsState.status === "error" || tiersState.status === "error" ? "error" : sponsorsState.status === "loading" || tiersState.status === "loading" ? "loading" : "ready"} error={sponsorsState.error || tiersState.error} onRetry={() => setReloadKey((c) => c + 1)}>
            <div>{copy.sponsors.active(sponsorsActive)}</div>
            <div>{copy.sponsors.inactive(sponsorsInactive)}</div>
            <div>{copy.sponsors.tiers(tiersCount)}</div>
          </CardState>
        </OverviewCard>

        <OverviewCard title={copy.cards.teams.title} link={copy.cards.teams.link}>
          <CardState status={teamsState.status} error={teamsState.error} onRetry={() => setReloadKey((c) => c + 1)}>
            <div>{copy.teams.total(teamsTotal)}</div>
            <div>{copy.teams.active(teamsActive)}</div>
          </CardState>
        </OverviewCard>

        <OverviewCard title={copy.cards.challenges.title} link={copy.cards.challenges.link}>
          <CardState status={challengesState.status} error={challengesState.error} onRetry={() => setReloadKey((c) => c + 1)}>
            <div>{copy.challenges.total(challengesRows.length)}</div>
          </CardState>
        </OverviewCard>

        <OverviewCard title={copy.cards.criteria.title} link={copy.cards.criteria.link}>
          <CardState status={criteriaState.status} error={criteriaState.error} onRetry={() => setReloadKey((c) => c + 1)}>
            <div>{copy.criteria.total(criteriaRows.length)}</div>
            <div>{copy.criteria.published(criteriaPublished)}</div>
            <div>{copy.criteria.global(criteriaGlobal)}</div>
          </CardState>
        </OverviewCard>

        <OverviewCard title={copy.cards.questions.title} link={copy.cards.questions.link}>
          <CardState status={questionsState.status} error={questionsState.error} onRetry={() => setReloadKey((c) => c + 1)}>
            <div>{copy.questions.total(questionsRows.length)}</div>
            <div>{copy.questions.published(questionsPublished)}</div>
          </CardState>
        </OverviewCard>

        <OverviewCard title={copy.cards.requests.title} link={copy.cards.requests.link}>
          <CardState status={requestsState.status} error={requestsState.error} onRetry={() => setReloadKey((c) => c + 1)}>
            <div>{copy.requests.total(requestsRows.length)}</div>
          </CardState>
        </OverviewCard>

        <OverviewCard title={copy.cards.seasonMedia.title} link={copy.cards.seasonMedia.link}>
          <CardState status={seasonMediaState.status} error={seasonMediaState.error} onRetry={() => setReloadKey((c) => c + 1)}>
            <div>{copy.seasonMedia.active(seasonMediaActive)}</div>
            <div>{copy.seasonMedia.inactive(seasonMediaInactive)}</div>
          </CardState>
        </OverviewCard>

        <OverviewCard title={copy.cards.standings.title} link={copy.cards.standings.link}>
          <CardState status={standingsState.status} error={standingsState.error} onRetry={() => setReloadKey((c) => c + 1)}>
            {topThree.length === 0 ? (
              <div>{copy.standings.noData}</div>
            ) : (
              <>
                <div>{copy.standings.topThree}</div>
                {topThree.map((row, index) => {
                  const rank = row?.rank ?? index + 1;
                  const name = row?.teamName || row?.team?.name || row?.name || adminData.common.dash;
                  const percent =
                    toFiniteNumber(row?.percentage) ??
                    toFiniteNumber(row?.scorePercent) ??
                    toFiniteNumber(row?.totalScore) ??
                    null;
                  const judges =
                    row?.judgesCounted ?? row?.judges ?? row?.judgeCount ?? row?.numberOfJudges;
                  return (
                    <div key={row?.teamId || row?.id || index}>
                      {copy.standings.rank(rank)} {name}
                      {percent !== null ? ` ${copy.standings.percent(Math.round(percent * 10) / 10)}` : ""}
                      {judges !== undefined && judges !== null ? ` (${judges})` : ""}
                    </div>
                  );
                })}
              </>
            )}
          </CardState>
        </OverviewCard>
      </div>
    </div>
  );
}
