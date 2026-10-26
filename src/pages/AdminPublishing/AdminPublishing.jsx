import { useEffect, useMemo, useRef, useState } from "react";
import "./AdminPublishing.css";

import {
  fetchCriteriaAdmin,
  fetchJudgingJudges,
  publishCriterionAdmin,
  unpublishCriterionAdmin,
} from "../../api/admin/criteria";
import { fetchChallenges } from "../../api/challenges";
import { adminData } from "../../data/adminData";
import { site } from "../../data/site";
import useApiResource from "../../hooks/useApiResource";
import { codeKey, loadMessage, statusCode } from "../../utils/adminErrors";
import { formatDateTime } from "../../utils/dates";
import { formatNumber, toFiniteNumber } from "../../utils/numbers";

import AdminPageHeader from "../../components/admin/AdminPageHeader/AdminPageHeader";
import ConfirmDialog from "../../components/admin/ConfirmDialog/ConfirmDialog";
import InlineNotice from "../../components/admin/InlineNotice/InlineNotice";
import ResourceTable from "../../components/admin/ResourceTable/ResourceTable";
import StatusPill from "../../components/admin/StatusPill/StatusPill";
import DataState from "../../components/common/DataState/DataState";

function judgeLabel(judge) {
  if (!judge) {
    return "";
  }
  return adminData.publishing.judgeOption(judge.fullName, judge.username);
}

function publishingErrorState(cause) {
  const copy = adminData.publishing.errors;
  const code = codeKey(cause);

  switch (code) {
    case "judging_no_scores":
      return { message: copy.judging_no_scores };
    case "criterion_not_found":
      return { message: copy.criterion_not_found, refresh: true };
    case "judge_not_found":
      return { message: copy.judge_not_found, refresh: true };
    default:
      if (statusCode(cause) >= 500) {
        return { message: copy.publishGeneric };
      }
      return { message: loadMessage(cause, copy.publishGeneric) };
  }
}

export default function AdminPublishing() {
  const copy = adminData.publishing;

  const [challengeId, setChallengeId] = useState("");
  const [judgeId, setJudgeId] = useState("");
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [confirmState, setConfirmState] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState(null);

  const requestIdRef = useRef(0);

  const challengesResource = useApiResource(fetchChallenges);
  const challenges = useMemo(
    () =>
      Array.isArray(challengesResource.data) ? challengesResource.data : [],
    [challengesResource.data],
  );

  const judgesResource = useApiResource(fetchJudgingJudges);
  const judges = useMemo(() => {
    const list = Array.isArray(judgesResource.data) ? judgesResource.data : [];
    return list.filter(
      (judge) => judge?.judgeId !== null && judge?.judgeId !== undefined,
    );
  }, [judgesResource.data]);

  const selectedJudge = useMemo(
    () => judges.find((judge) => String(judge.judgeId) === judgeId) || null,
    [judgeId, judges],
  );

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

  useEffect(() => {
    const controller = new AbortController();
    const runId = requestIdRef.current + 1;
    requestIdRef.current = runId;

    fetchCriteriaAdmin({
      challengeId: challengeId || undefined,
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted || runId !== requestIdRef.current) {
          return;
        }
        setRows(Array.isArray(result) ? result : []);
        setStatus("ready");
        setError("");
      })
      .catch((cause) => {
        if (
          controller.signal.aborted ||
          cause?.name === "AbortError" ||
          runId !== requestIdRef.current
        ) {
          return;
        }
        setStatus("error");
        setError(loadMessage(cause, copy.states.errorTitle));
      });

    return () => controller.abort();
  }, [challengeId, copy.states.errorTitle, reloadKey]);

  function handleRetry() {
    setStatus("loading");
    setError("");
    setReloadKey((current) => current + 1);
  }

  function refreshList() {
    setReloadKey((current) => current + 1);
  }

  function updateChallenge(next) {
    setChallengeId(next);
    setStatus("loading");
    setError("");
    setRows([]);
  }

  function openConfirm(row, action) {
    setActionError("");
    setConfirmState({
      row,
      action,
      judgeId: judgeId || "",
      judgeLabel: selectedJudge ? judgeLabel(selectedJudge) : "",
    });
  }

  function closeConfirm() {
    if (actionBusy) {
      return;
    }
    setConfirmState(null);
    setActionError("");
  }

  async function handleConfirm() {
    if (!confirmState || actionBusy) {
      return;
    }

    const { row, action, judgeId: scopedJudgeId, judgeLabel: scopedLabel } =
      confirmState;
    const publishing = action === "publish";

    setActionBusy(true);
    setActionError("");

    try {
      if (publishing) {
        await publishCriterionAdmin(row.criterionId, {
          judgeId: scopedJudgeId || undefined,
        });
      } else {
        await unpublishCriterionAdmin(row.criterionId, {
          judgeId: scopedJudgeId || undefined,
        });
      }

      /* Show the new state immediately, then replace it with the server's
         answer. The refetch is the source of truth for every count. */
      setRows((current) =>
        current.map((item) => {
          if (item.criterionId !== row.criterionId) {
            return item;
          }

          const previousCount = toFiniteNumber(item.publishedJudgeCount) ?? 0;
          const nextCount = scopedJudgeId
            ? Math.max(0, previousCount + (publishing ? 1 : -1))
            : publishing
              ? previousCount
              : 0;

          return {
            ...item,
            isPublished: publishing ? true : scopedJudgeId ? nextCount > 0 : false,
            isPublishedByCaller: publishing
              ? scopedJudgeId
                ? item.isPublishedByCaller
                : true
              : false,
            publishedJudgeCount: nextCount,
            publishedAt: publishing
              ? new Date().toISOString()
              : nextCount > 0
                ? item.publishedAt
                : null,
          };
        }),
      );

      setNotice({
        tone: "success",
        message: publishing
          ? copy.notice.published(row.name, scopedLabel || "")
          : copy.notice.unpublished(row.name, scopedLabel || ""),
      });
      setConfirmState(null);
      refreshList();
    } catch (cause) {
      const next = publishingErrorState(cause);
      setActionError(next.message || "");
      if (next.refresh) {
        refreshList();
      }
    } finally {
      setActionBusy(false);
    }
  }

  const columns = [
    {
      key: "name",
      header: copy.table.name,
      render: (row) => (
        <span className="admin-publishing-name-cell">
          <span className="admin-publishing-name">
            {row.name || adminData.common.dash}
          </span>
          {row.description ? (
            <span className="admin-publishing-description">
              {row.description}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "status",
      header: copy.table.status,
      render: (row) => (
        <StatusPill tone={row.isPublished ? "on" : "off"}>
          {row.isPublished ? copy.status.published : copy.status.unpublished}
        </StatusPill>
      ),
    },
    {
      key: "publishedJudgeCount",
      header: copy.table.judgeCount,
      render: (row) => (
        <span className="admin-publishing-number">
          {formatNumber(toFiniteNumber(row.publishedJudgeCount) ?? 0)}
        </span>
      ),
    },
    {
      key: "publishedAt",
      header: copy.table.publishedAt,
      render: (row) => (
        <span className="admin-publishing-date">
          {row.publishedAt ? formatDateTime(row.publishedAt) : adminData.common.dash}
        </span>
      ),
    },
  ];

  const confirmPublishing = confirmState?.action === "publish";

  return (
    <div className="admin-publishing">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        titleId="admin-publishing-title"
      />

      <p className="admin-publishing-warning">{copy.note}</p>

      {notice ? (
        <InlineNotice
          tone={notice.tone}
          message={notice.message}
          onDismiss={() => setNotice(null)}
        />
      ) : null}

      <section className="admin-publishing-filters" aria-label={copy.filters.challenge}>
        <label className="admin-publishing-field" htmlFor="publishing-challenge-filter">
          <span className="admin-field-label">{copy.filters.challenge}</span>
          <select
            id="publishing-challenge-filter"
            className="admin-input admin-select"
            value={challengeId}
            onChange={(event) => updateChallenge(event.target.value)}
            disabled={challengesResource.status === "loading"}
          >
            <option value="">{adminData.common.allChallenges}</option>
            {challenges.map((challenge) => (
              <option
                key={challenge.challengeId}
                value={String(challenge.challengeId)}
              >
                {challenge.title || `Challenge ${challenge.challengeId}`}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-publishing-field" htmlFor="publishing-judge-filter">
          <span className="admin-field-label">{copy.filters.judge}</span>
          <select
            id="publishing-judge-filter"
            className="admin-input admin-select"
            value={judgeId}
            onChange={(event) => setJudgeId(event.target.value)}
            disabled={judgesResource.status === "loading"}
          >
            <option value="">{copy.filters.allJudges}</option>
            {judges.map((judge) => (
              <option key={judge.judgeId} value={String(judge.judgeId)}>
                {judgeLabel(judge)}
              </option>
            ))}
          </select>
        </label>

        <p className="admin-publishing-hint">{copy.filters.judgeHint}</p>

        {challengesResource.status === "loading" ? (
          <p className="admin-publishing-note">{copy.states.challengesLoading}</p>
        ) : null}

        {challengesResource.status === "error" ? (
          <p className="admin-publishing-note admin-publishing-note--error" role="alert">
            {copy.states.challengesError}
            <button
              type="button"
              className="admin-publishing-link"
              onClick={challengesResource.retry}
            >
              {adminData.common.retry}
            </button>
          </p>
        ) : null}

        {challengesResource.status === "ready" && challenges.length === 0 ? (
          <p className="admin-publishing-note">{copy.states.challengesEmpty}</p>
        ) : null}

        {judgesResource.status === "loading" ? (
          <p className="admin-publishing-note">{copy.states.judgesLoading}</p>
        ) : null}

        {judgesResource.status === "error" ? (
          <p className="admin-publishing-note admin-publishing-note--error" role="alert">
            {copy.states.judgesError}
            <button
              type="button"
              className="admin-publishing-link"
              onClick={judgesResource.retry}
            >
              {adminData.common.retry}
            </button>
          </p>
        ) : null}

        {judgesResource.status === "ready" && judges.length === 0 ? (
          <p className="admin-publishing-note">{copy.states.judgesEmpty}</p>
        ) : null}
      </section>

      {status === "loading" ? (
        <DataState status="loading" title={copy.states.loading} tone="dark" compact />
      ) : null}

      {status === "error" ? (
        <DataState
          status="error"
          title={copy.states.errorTitle}
          message={error}
          retryLabel={adminData.common.retry}
          onRetry={handleRetry}
          tone="dark"
          compact
        />
      ) : null}

      {status === "ready" ? (
        <ResourceTable
          caption={copy.table.caption}
          columns={columns}
          rows={rows}
          rowKey={(row) => row.criterionId}
          emptyTitle={challengeId ? copy.states.empty : copy.states.emptyAll}
          actionsHeader={copy.table.actions}
          actions={(row) => (
            <span className="admin-row-actions">
              <button
                type="button"
                className="admin-publishing-action"
                onClick={() => openConfirm(row, "publish")}
              >
                {copy.actions.publish}
              </button>
              <button
                type="button"
                className="admin-publishing-action admin-publishing-action--danger"
                onClick={() => openConfirm(row, "unpublish")}
              >
                {copy.actions.unpublish}
              </button>
            </span>
          )}
        />
      ) : null}

      {confirmState ? (
        <ConfirmDialog
          title={
            confirmPublishing
              ? copy.confirm.publishTitle
              : copy.confirm.unpublishTitle
          }
          message={
            confirmPublishing
              ? copy.confirm.publishMessage(
                  confirmState.row.name,
                  confirmState.judgeLabel,
                )
              : copy.confirm.unpublishMessage(
                  confirmState.row.name,
                  confirmState.judgeLabel,
                )
          }
          confirmLabel={
            confirmPublishing
              ? copy.confirm.confirmPublish
              : copy.confirm.confirmUnpublish
          }
          danger={!confirmPublishing}
          busy={actionBusy}
          error={actionError}
          onConfirm={handleConfirm}
          onClose={closeConfirm}
        />
      ) : null}
    </div>
  );
}
