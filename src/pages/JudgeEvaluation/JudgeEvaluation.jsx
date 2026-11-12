import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./JudgeEvaluation.css";

import { ApiError } from "../../api/client";
import {
  fetchJudgingCriteria,
  submitCriterionScore,
  unpublishCriterion,
} from "../../api/judging";
import { fetchTeam } from "../../api/teams";
import { judgeDashboard, judgeEvaluation } from "../../data/judgeDashboard";
import { site } from "../../data/site";
import { useRevealGroup } from "../../hooks/useReveal";

import { ArrowLeftIcon, ScaleIcon } from "../../components/common/Icons/Icons";

const MIN_SCORE = 1;

function toPositiveInteger(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

function scoreInputId(criterionId) {
  return `score-criterion-${criterionId}`;
}

function reviewCriteria(rawCriteria) {
  if (!Array.isArray(rawCriteria)) {
    return { criteria: [], error: "malformed" };
  }

  const criteria = [];
  const seenCriteria = new Set();

  for (const rawCriterion of rawCriteria) {
    if (!rawCriterion || typeof rawCriterion !== "object") {
      return { criteria: [], error: "malformed" };
    }

    const criterionId = toPositiveInteger(rawCriterion.criterionId);
    const maxScore = Number(rawCriterion.maxScore);

    if (
      criterionId === null ||
      !Number.isFinite(maxScore) ||
      maxScore <= 0 ||
      seenCriteria.has(criterionId)
    ) {
      return { criteria: [], error: "malformed" };
    }

    const questions = [];

    if (rawCriterion.questions !== undefined) {
      if (!Array.isArray(rawCriterion.questions)) {
        return { criteria: [], error: "malformed" };
      }

      rawCriterion.questions.forEach((rawQuestion, index) => {
        if (!rawQuestion || typeof rawQuestion !== "object") {
          return;
        }

        const text = String(rawQuestion.text ?? "").trim();
        if (!text) {
          return;
        }

        const displayOrder = Number(rawQuestion.displayOrder);

        questions.push({
          text,
          displayOrder: Number.isFinite(displayOrder) ? displayOrder : index,
        });
      });
    }

    questions.sort(
      (first, second) => first.displayOrder - second.displayOrder,
    );

    seenCriteria.add(criterionId);

    const publishedJudgeCount = Number(rawCriterion.publishedJudgeCount);

    criteria.push({
      ...rawCriterion,
      criterionId,
      maxScore,
      questions,
      isPublished:
        typeof rawCriterion.isPublished === "boolean"
          ? rawCriterion.isPublished
          : null,
      isPublishedByCaller:
        typeof rawCriterion.isPublishedByCaller === "boolean"
          ? rawCriterion.isPublishedByCaller
          : null,
      publishedJudgeCount: Number.isFinite(publishedJudgeCount)
        ? publishedJudgeCount
        : null,
    });
  }

  return { criteria, error: null };
}

function describeApiError(error, fallback) {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  if (error.isForbidden) {
    return "You do not have permission to perform this action.";
  }

  const known = judgeEvaluation.errors[error.code];
  if (known) {
    return known;
  }

  return error.message || fallback;
}

export default function JudgeEvaluation() {
  const { teamId: teamIdParam } = useParams();
  const teamId = toPositiveInteger(teamIdParam);

  const pageRef = useRef(null);
  useRevealGroup(pageRef, { stagger: 80, rootMargin: "0px 0px -6% 0px" });

  const [criteria, setCriteria] = useState([]);
  const [criteriaStatus, setCriteriaStatus] = useState("loading");
  const [criteriaError, setCriteriaError] = useState("");
  const [criteriaErrorTitle, setCriteriaErrorTitle] = useState(
    judgeEvaluation.criteriaErrorTitle,
  );

  const [team, setTeam] = useState(null);
  const [teamStatus, setTeamStatus] = useState("loading");

  const [values, setValues] = useState({});
  const [comments, setComments] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [criterionStates, setCriterionStates] = useState({});
  const [criterionPending, setCriterionPending] = useState({});

  const teamIdRef = useRef(teamId);

  const loadSequence = useRef(0);
  const pendingCriteria = useRef(new Set());
  const criterionSequences = useRef(new Map());

  useEffect(() => {
    teamIdRef.current = teamId;
  }, [teamId]);

  useEffect(() => {
    document.title = `${judgeEvaluation.title} — ${site.name}`;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const sequence = loadSequence.current + 1;
    loadSequence.current = sequence;
    pendingCriteria.current.clear();
    criterionSequences.current.clear();

    async function loadTeamAndCriteria() {
      let phase = "team";

      try {
        const result = await fetchTeam(teamId, { signal: controller.signal });
        if (sequence !== loadSequence.current || controller.signal.aborted) {
          return;
        }

        const detail = result && typeof result === "object" ? result : null;
        if (!detail || toPositiveInteger(detail.teamId) !== teamId) {
          throw new ApiError("The team could not be loaded.", {
            status: 502,
            code: "team.incomplete",
          });
        }

        setTeam(detail);
        setTeamStatus("ready");
        phase = "criteria";

        const rawCriteria = await fetchJudgingCriteria({
          teamId,
          signal: controller.signal,
        });
        if (sequence !== loadSequence.current || controller.signal.aborted) {
          return;
        }

        const reviewed = reviewCriteria(rawCriteria);
        if (reviewed.error) {
          setCriteria([]);
          setCriteriaStatus("error");
          setCriteriaErrorTitle(judgeEvaluation.criteriaMalformedTitle);
          setCriteriaError(judgeEvaluation.criteriaMalformedText);
          return;
        }

        setCriteria(reviewed.criteria);
        setCriteriaStatus("ready");
        setValues(
          Object.fromEntries(
            reviewed.criteria.map((criterion) => [criterion.criterionId, ""]),
          ),
        );
      } catch (error) {
        if (error?.name === "AbortError" || controller.signal.aborted) {
          return;
        }
        if (sequence !== loadSequence.current) {
          return;
        }

        if (phase === "team") {
          setTeam(null);
          setTeamStatus("error");
        }

        setCriteria([]);
        setCriteriaStatus("error");
        setCriteriaErrorTitle(
          phase === "team"
            ? judgeEvaluation.criteriaTeamTitle
            : judgeEvaluation.criteriaErrorTitle,
        );
        setCriteriaError(
          describeApiError(
            error,
            phase === "team"
              ? judgeEvaluation.criteriaTeamText
              : judgeEvaluation.criteriaErrorTitle,
          ),
        );
      }
    }

    const resetTimer = setTimeout(() => {
      setTeam(null);
      setTeamStatus("loading");
      setCriteria([]);
      setCriteriaStatus("loading");
      setCriteriaError("");
      setCriteriaErrorTitle(judgeEvaluation.criteriaErrorTitle);
      setValues({});
      setComments({});
      setFieldErrors({});
      setFormError("");
      setCriterionStates({});
      setCriterionPending({});

      if (teamId === null) {
        setTeamStatus("error");
        setCriteriaStatus("error");
        setCriteriaErrorTitle(judgeEvaluation.criteriaTeamIdTitle);
        setCriteriaError(judgeEvaluation.criteriaTeamIdText);
        return;
      }

      loadTeamAndCriteria();
    }, 0);

    return () => {
      clearTimeout(resetTimer);
      controller.abort();
    };
  }, [teamId]);

  const clearFieldError = useCallback((criterionId) => {
    setFieldErrors((previous) => {
      if (!previous[criterionId]) {
        return previous;
      }
      const next = { ...previous };
      delete next[criterionId];
      return next;
    });
  }, []);

  const clearCriterionState = useCallback((criterionId) => {
    setCriterionStates((previous) => {
      if (!previous[criterionId]) {
        return previous;
      }
      const next = { ...previous };
      delete next[criterionId];
      return next;
    });
  }, []);

  const nextCriterionSequence = useCallback((criterionId) => {
    const sequence = (criterionSequences.current.get(criterionId) ?? 0) + 1;
    criterionSequences.current.set(criterionId, sequence);
    return sequence;
  }, []);

  const clearPendingCriterion = useCallback((criterionId, sequence) => {
    if (criterionSequences.current.get(criterionId) !== sequence) {
      return;
    }

    pendingCriteria.current.delete(criterionId);
    setCriterionPending((previous) => {
      if (!previous[criterionId]) {
        return previous;
      }
      const next = { ...previous };
      delete next[criterionId];
      return next;
    });
  }, []);

  const handleValueChange = useCallback(
    (criterionId, value) => {
      setValues((previous) => ({ ...previous, [criterionId]: value }));
      setFormError("");
      clearFieldError(criterionId);
      clearCriterionState(criterionId);
    },
    [clearCriterionState, clearFieldError],
  );

  const handleCommentChange = useCallback(
    (criterionId, value) => {
      setComments((previous) => ({ ...previous, [criterionId]: value }));
      setFormError("");
      clearCriterionState(criterionId);
    },
    [clearCriterionState],
  );

  const validateCriterion = useCallback(
    (criterion) => {
      const criterionId = criterion.criterionId;
      const maxScore = Number(criterion.maxScore);
      const text = String(values[criterionId] ?? "").trim();

      if (text === "") {
        return judgeEvaluation.requiredError;
      }

      const numeric = Number(text);
      if (!Number.isFinite(numeric)) {
        return judgeEvaluation.numberError;
      }

      if (numeric < MIN_SCORE || numeric > maxScore) {
        return judgeEvaluation.rangeError(maxScore);
      }

      return null;
    },
    [values],
  );

  function isReadyTeam(targetTeamId) {
    return Boolean(
      teamStatus === "ready" &&
        team &&
        toPositiveInteger(team.teamId) === targetTeamId,
    );
  }

  function focusScoreInput(criterionId) {
    document.getElementById(scoreInputId(criterionId))?.focus();
  }

  function setCriterionFeedback(criterionId, status, action, message) {
    setCriterionStates((previous) => ({
      ...previous,
      [criterionId]: { status, action, message },
    }));
  }

  function applyCriterionResponse(criterionId, result) {
    if (!result || typeof result !== "object") {
      return false;
    }

    const reviewed = reviewCriteria([result]);
    if (reviewed.error || reviewed.criteria[0].criterionId !== criterionId) {
      return false;
    }

    const fresh = reviewed.criteria[0];
    setCriteria((previous) =>
      previous.map((item) =>
        item.criterionId === criterionId
          ? {
              ...item,
              ...fresh,
              questions:
                fresh.questions.length > 0 ? fresh.questions : item.questions,
            }
          : item,
      ),
    );

    return true;
  }

  async function handleCriterionSubmit(criterion) {
    const criterionId = criterion.criterionId;

    if (pendingCriteria.current.has(criterionId)) {
      return;
    }

    const submissionTeamId = teamId;

    if (!isReadyTeam(submissionTeamId)) {
      setFormError(judgeEvaluation.teamMismatchError);
      return;
    }

    setFormError("");
    const validationError = validateCriterion(criterion);

    if (validationError) {
      setFieldErrors((previous) => ({
        ...previous,
        [criterionId]: validationError,
      }));
      focusScoreInput(criterionId);
      return;
    }

    clearFieldError(criterionId);

    const score = Number(String(values[criterionId] ?? "").trim());
    const comment = String(comments[criterionId] ?? "").trim();
    const sequence = nextCriterionSequence(criterionId);

    pendingCriteria.current.add(criterionId);
    setCriterionPending((previous) => ({
      ...previous,
      [criterionId]: true,
    }));
    setCriterionFeedback(criterionId, "pending", "submit", "");

    try {
      const result = await submitCriterionScore({
        criterionId,
        teamId: submissionTeamId,
        score,
        comment,
      });

      if (
        criterionSequences.current.get(criterionId) !== sequence ||
        teamIdRef.current !== submissionTeamId
      ) {
        return;
      }

      if (!applyCriterionResponse(criterionId, result?.criterion)) {
        setCriterionFeedback(
          criterionId,
          "error",
          "submit",
          judgeEvaluation.unexpectedResponseError,
        );
        return;
      }

      setCriterionFeedback(
        criterionId,
        "success",
        "submit",
        judgeEvaluation.submitSuccess,
      );
    } catch (error) {
      if (
        criterionSequences.current.get(criterionId) !== sequence ||
        teamIdRef.current !== submissionTeamId
      ) {
        return;
      }

      setCriterionFeedback(
        criterionId,
        "error",
        "submit",
        describeApiError(error, judgeEvaluation.criterionErrorTitle),
      );
    } finally {
      clearPendingCriterion(criterionId, sequence);
    }
  }

  async function handleCriterionUnpublish(criterion) {
    const criterionId = criterion.criterionId;

    if (pendingCriteria.current.has(criterionId)) {
      return;
    }

    const submissionTeamId = teamId;

    if (!isReadyTeam(submissionTeamId)) {
      setFormError(judgeEvaluation.teamMismatchError);
      return;
    }

    setFormError("");
    const sequence = nextCriterionSequence(criterionId);

    pendingCriteria.current.add(criterionId);
    setCriterionPending((previous) => ({
      ...previous,
      [criterionId]: true,
    }));
    setCriterionFeedback(criterionId, "pending", "unpublish", "");

    try {
      const result = await unpublishCriterion(criterionId, {
        teamId: submissionTeamId,
      });

      if (
        criterionSequences.current.get(criterionId) !== sequence ||
        teamIdRef.current !== submissionTeamId
      ) {
        return;
      }

      if (!applyCriterionResponse(criterionId, result)) {
        setCriterionFeedback(
          criterionId,
          "error",
          "unpublish",
          judgeEvaluation.unexpectedResponseError,
        );
        return;
      }

      setCriterionFeedback(
        criterionId,
        "success",
        "unpublish",
        judgeEvaluation.unpublishSuccess,
      );
    } catch (error) {
      if (
        criterionSequences.current.get(criterionId) !== sequence ||
        teamIdRef.current !== submissionTeamId
      ) {
        return;
      }

      setCriterionFeedback(
        criterionId,
        "error",
        "unpublish",
        describeApiError(error, judgeEvaluation.publishErrorTitle),
      );
    } finally {
      clearPendingCriterion(criterionId, sequence);
    }
  }

  const headerName = useMemo(() => {
    if (teamStatus !== "ready" || !team) {
      return null;
    }
    return team.name?.trim() || judgeDashboard.table.fallbackName;
  }, [team, teamStatus]);

  const canScore = criteriaStatus === "ready" && criteria.length > 0;

  return (
    <div className="judge-eval on-dark" ref={pageRef}>
      <div className="container judge-eval-inner">
        <div className="judge-eval-top" data-reveal-item>
          <Link className="judge-eval-back" to="/judge">
            <ArrowLeftIcon size={16} />
            {judgeEvaluation.backLabel}
          </Link>
        </div>

        <header className="judge-eval-header" data-reveal-item>
          <p className="eyebrow">{judgeEvaluation.eyebrow}</p>
          <h1 className="judge-eval-title">{judgeEvaluation.title}</h1>
          <p className="judge-eval-description">{judgeEvaluation.description}</p>

          <div className="judge-eval-team">
            <span className="judge-eval-team-avatar" aria-hidden="true">
              <ScaleIcon size={20} />
            </span>
            <span className="judge-eval-team-body">
              <span className="judge-eval-team-label">{judgeEvaluation.teamLabel}</span>
              <span className="judge-eval-team-name">
                {headerName ?? (
                  <span className="judge-eval-team-id">
                    {judgeEvaluation.teamIdLabel} #{teamId ?? "—"}
                  </span>
                )}
              </span>
            </span>
          </div>
        </header>

        {criteriaStatus === "loading" && (
          <div className="judge-eval-state" role="status" aria-live="polite">
            <span className="team-state-spinner" aria-hidden="true" />
            <p className="judge-eval-state-text">{judgeEvaluation.criteriaLoading}</p>
          </div>
        )}

        {criteriaStatus === "error" && (
          <div className="judge-eval-state judge-eval-state--error" role="alert">
            <p className="judge-eval-state-title">{criteriaErrorTitle}</p>
            <p className="judge-eval-state-text">{criteriaError}</p>
          </div>
        )}

        {criteriaStatus === "ready" && criteria.length === 0 && (
          <div className="judge-eval-state" role="status">
            <p className="judge-eval-state-text">{judgeEvaluation.criteriaEmpty}</p>
          </div>
        )}

        {canScore && (
          <form
            className="judge-eval-form"
            onSubmit={(event) => event.preventDefault()}
            noValidate
          >
            <h2 className="judge-eval-criteria-title" data-reveal-item>
              {judgeEvaluation.criteriaTitle}
            </h2>

            <ul className="judge-eval-criteria">
              {criteria.map((criterion) => {
                const criterionId = criterion.criterionId;
                const maxScore = Number(criterion.maxScore);
                const publishedByCaller = criterion.isPublishedByCaller === true;
                const publicationKnown =
                  typeof criterion.isPublishedByCaller === "boolean";
                const submissionState = criterionStates[criterionId];
                const submissionPending =
                  criterionPending[criterionId] === true;
                const pendingAction = submissionPending
                  ? submissionState?.action
                  : null;
                const inputId = scoreInputId(criterionId);
                const commentId = `comment-${inputId}`;
                const errorId = `${inputId}-error`;
                const error = fieldErrors[criterionId];

                return (
                  <li
                    className="judge-eval-criterion"
                    key={criterionId}
                    data-reveal-item
                  >
                    <div className="judge-eval-criterion-head">
                      <h3 className="judge-eval-criterion-name">
                        {criterion.name || `Criterion ${criterionId}`}
                      </h3>
                      {Number.isFinite(Number(criterion.weight)) && (
                        <span className="judge-eval-criterion-weight">
                          {judgeEvaluation.weightLabel(Number(criterion.weight))}
                        </span>
                      )}
                    </div>

                    {criterion.description ? (
                      <p className="judge-eval-criterion-desc">{criterion.description}</p>
                    ) : null}

                    {criterion.questions.length > 0 ? (
                      <div className="judge-eval-reference">
                        <p className="judge-eval-reference-label">
                          {judgeEvaluation.referencePromptsLabel}
                        </p>
                        <ul className="judge-eval-reference-list">
                          {criterion.questions.map((question, index) => (
                            <li
                              className="judge-eval-reference-item"
                              key={`${criterionId}-${index}`}
                            >
                              <span
                                className="judge-eval-question-index"
                                aria-hidden="true"
                              >
                                {index + 1}
                              </span>
                              <span className="judge-eval-reference-text">
                                {question.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="judge-eval-fields">
                      <div className="judge-eval-field">
                        <label className="judge-eval-label" htmlFor={inputId}>
                          {judgeEvaluation.scoreLabel(maxScore)}
                        </label>
                        <input
                          id={inputId}
                          className="judge-eval-input"
                          type="number"
                          inputMode="decimal"
                          min={MIN_SCORE}
                          max={maxScore}
                          step="0.1"
                          placeholder={judgeEvaluation.scorePlaceholder}
                          value={values[criterionId] ?? ""}
                          onChange={(event) =>
                            handleValueChange(criterionId, event.target.value)
                          }
                          disabled={submissionPending}
                          aria-invalid={Boolean(error)}
                          aria-describedby={error ? errorId : undefined}
                        />
                        {error && (
                          <p
                            className="judge-eval-error"
                            id={errorId}
                            role="alert"
                          >
                            {error}
                          </p>
                        )}
                      </div>

                      <div className="judge-eval-field judge-eval-field--comment">
                        <label className="judge-eval-label" htmlFor={commentId}>
                          {judgeEvaluation.commentLabel}
                        </label>
                        <input
                          id={commentId}
                          className="judge-eval-input"
                          type="text"
                          placeholder={judgeEvaluation.commentPlaceholder}
                          value={comments[criterionId] ?? ""}
                          onChange={(event) =>
                            handleCommentChange(criterionId, event.target.value)
                          }
                          disabled={submissionPending}
                        />
                      </div>
                    </div>

                    <div className="judge-eval-criterion-foot">
                      <div className="judge-eval-publication">
                        <span className="judge-eval-publication-status">
                          {publishedByCaller
                            ? judgeEvaluation.publishedBadge
                            : publicationKnown
                              ? judgeEvaluation.notPublishedBadge
                              : judgeEvaluation.publicationUnknownBadge}
                        </span>

                        {criterion.publishedJudgeCount !== null && (
                          <span className="judge-eval-publication-count">
                            {judgeEvaluation.publishedJudgeCount(
                              criterion.publishedJudgeCount,
                            )}
                          </span>
                        )}

                        {!publishedByCaller && publicationKnown && (
                          <span className="judge-eval-publication-note">
                            {judgeEvaluation.publishHint}
                          </span>
                        )}

                        {!publicationKnown && (
                          <span className="judge-eval-publication-note">
                            {judgeEvaluation.publicationUnknownNote}
                          </span>
                        )}
                      </div>

                      <div className="judge-eval-criterion-actions">
                        {publishedByCaller && (
                          <button
                            type="button"
                            className="btn judge-eval-publish judge-eval-publish--unpublish"
                            onClick={() => handleCriterionUnpublish(criterion)}
                            disabled={submissionPending}
                            aria-busy={pendingAction === "unpublish"}
                          >
                            {pendingAction === "unpublish"
                              ? judgeEvaluation.unpublishing
                              : judgeEvaluation.unpublishAction}
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn judge-eval-criterion-submit"
                          onClick={() => handleCriterionSubmit(criterion)}
                          disabled={submissionPending}
                          aria-busy={pendingAction === "submit"}
                        >
                          {pendingAction === "submit"
                            ? publishedByCaller
                              ? judgeEvaluation.resubmittingCriterion
                              : judgeEvaluation.submittingCriterion
                            : publishedByCaller
                              ? judgeEvaluation.resubmitCriterion
                              : judgeEvaluation.submitCriterion}
                        </button>
                      </div>
                    </div>

                    {submissionState?.message && (
                      <p
                        className={
                          submissionState.status === "error"
                            ? "judge-eval-publish-feedback judge-eval-publish-feedback--error"
                            : "judge-eval-publish-feedback"
                        }
                        role={
                          submissionState.status === "error" ? "alert" : "status"
                        }
                      >
                        {submissionState.message}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>

            {formError && (
              <p className="judge-eval-form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="judge-eval-actions">
              <Link className="judge-eval-cancel" to="/judge">
                {judgeEvaluation.backToTeam}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
