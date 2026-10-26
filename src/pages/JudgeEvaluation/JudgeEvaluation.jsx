import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./JudgeEvaluation.css";

import { ApiError } from "../../api/client";
import {
  fetchJudgingCriteria,
  publishCriterion,
  submitScores,
  unpublishCriterion,
} from "../../api/judging";
import { fetchTeam, getTeamChallengeId } from "../../api/teams";
import { judgeDashboard, judgeEvaluation } from "../../data/judgeDashboard";
import { site } from "../../data/site";
import { useRevealGroup } from "../../hooks/useReveal";

import { ArrowLeftIcon, CheckIcon, ScaleIcon } from "../../components/common/Icons/Icons";

function toPositiveInteger(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

function questionKey(criterionId, criterionQuestionId) {
  return `${criterionId}:${criterionQuestionId}`;
}

function scoreInputId(key) {
  return `score-${key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function reviewCriteria(rawCriteria, challengeId) {
  if (!Array.isArray(rawCriteria)) {
    return { criteria: [], error: "malformed" };
  }

  const expectedChallengeId = toPositiveInteger(challengeId);
  if (expectedChallengeId === null) {
    return { criteria: [], error: "challenge" };
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
      maxScore < 0 ||
      seenCriteria.has(criterionId)
    ) {
      return { criteria: [], error: "malformed" };
    }

    if (
      Object.prototype.hasOwnProperty.call(rawCriterion, "challengeId") &&
      rawCriterion.challengeId !== null
    ) {
      const criterionChallengeId = toPositiveInteger(rawCriterion.challengeId);

      if (criterionChallengeId === null) {
        return { criteria: [], error: "scope" };
      }

      if (criterionChallengeId !== expectedChallengeId) {
        continue;
      }
    }

    const questions = [];

    if (rawCriterion.questions !== undefined) {
      if (!Array.isArray(rawCriterion.questions)) {
        return { criteria: [], error: "malformed" };
      }

      const seenQuestions = new Set();

      for (let index = 0; index < rawCriterion.questions.length; index += 1) {
        const rawQuestion = rawCriterion.questions[index];

        if (!rawQuestion || typeof rawQuestion !== "object") {
          return { criteria: [], error: "malformed" };
        }

        const criterionQuestionId = toPositiveInteger(
          rawQuestion.criterionQuestionId,
        );

        if (criterionQuestionId === null) {
          return { criteria: [], error: "malformed" };
        }

        if (
          rawQuestion.criterionId !== undefined &&
          rawQuestion.criterionId !== null
        ) {
          const questionCriterionId = toPositiveInteger(rawQuestion.criterionId);

          if (questionCriterionId === null || questionCriterionId !== criterionId) {
            return { criteria: [], error: "scope" };
          }
        }

        if (seenQuestions.has(criterionQuestionId)) {
          return { criteria: [], error: "malformed" };
        }

        seenQuestions.add(criterionQuestionId);

        if (rawQuestion.isActive === false) {
          continue;
        }

        const displayOrder = Number(rawQuestion.displayOrder);

        questions.push({
          ...rawQuestion,
          criterionId,
          criterionQuestionId,
          displayOrder: Number.isFinite(displayOrder) ? displayOrder : index,
        });
      }
    }

    questions.sort(
      (first, second) =>
        first.displayOrder - second.displayOrder ||
        first.criterionQuestionId - second.criterionQuestionId,
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

function blockedCriteriaCopy(reason) {
  switch (reason) {
    case "challenge":
      return {
        title: judgeEvaluation.criteriaChallengeTitle,
        text: judgeEvaluation.criteriaChallengeText,
      };
    case "scope":
      return {
        title: judgeEvaluation.criteriaScopeTitle,
        text: judgeEvaluation.criteriaScopeText,
      };
    default:
      return {
        title: judgeEvaluation.criteriaMalformedTitle,
        text: judgeEvaluation.criteriaMalformedText,
      };
  }
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

function questionKeys(criteria) {
  return criteria.flatMap((criterion) =>
    criterion.questions.map((question) =>
      questionKey(criterion.criterionId, question.criterionQuestionId),
    ),
  );
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
  const [challengeId, setChallengeId] = useState(null);

  const [team, setTeam] = useState(null);
  const [teamStatus, setTeamStatus] = useState("loading");

  const [values, setValues] = useState({});
  const [comments, setComments] = useState({});
  const [skips, setSkips] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [savedCriteria, setSavedCriteria] = useState(() => new Set());
  const [publishStates, setPublishStates] = useState({});

  const teamIdRef = useRef(teamId);
  teamIdRef.current = teamId;

  const loadSequence = useRef(0);
  const submitSequence = useRef(0);
  const publishRefreshSequence = useRef(0);
  const submissionPending = useRef(false);
  const publicationPending = useRef(new Set());

  useEffect(() => {
    document.title = `${judgeEvaluation.title} — ${site.name}`;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const sequence = loadSequence.current + 1;
    loadSequence.current = sequence;
    submitSequence.current += 1;
    publishRefreshSequence.current += 1;
    submissionPending.current = false;
    publicationPending.current.clear();

    setTeam(null);
    setTeamStatus("loading");
    setCriteria([]);
    setCriteriaStatus("loading");
    setCriteriaError("");
    setCriteriaErrorTitle(judgeEvaluation.criteriaErrorTitle);
    setChallengeId(null);
    setValues({});
    setComments({});
    setSkips({});
    setFieldErrors({});
    setFormError("");
    setSubmitted(null);
    setIsSubmitting(false);
    setSavedCriteria(new Set());
    setPublishStates({});

    if (teamId === null) {
      setTeamStatus("error");
      setCriteriaStatus("error");
      setCriteriaErrorTitle(judgeEvaluation.criteriaChallengeTitle);
      setCriteriaError(judgeEvaluation.criteriaChallengeText);
      return () => controller.abort();
    }

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

        const nextChallengeId = getTeamChallengeId(detail);
        if (nextChallengeId === null) {
          setCriteriaStatus("error");
          setCriteriaErrorTitle(judgeEvaluation.criteriaChallengeTitle);
          setCriteriaError(judgeEvaluation.criteriaChallengeText);
          return;
        }

        setChallengeId(nextChallengeId);
        phase = "criteria";

        const rawCriteria = await fetchJudgingCriteria({
          challengeId: nextChallengeId,
          signal: controller.signal,
        });
        if (sequence !== loadSequence.current || controller.signal.aborted) {
          return;
        }

        const reviewed = reviewCriteria(rawCriteria, nextChallengeId);
        if (reviewed.error) {
          const copy = blockedCriteriaCopy(reviewed.error);
          setCriteria([]);
          setCriteriaStatus("error");
          setCriteriaErrorTitle(copy.title);
          setCriteriaError(copy.text);
          return;
        }

        setCriteria(reviewed.criteria);
        setCriteriaStatus("ready");
        setValues(
          Object.fromEntries(questionKeys(reviewed.criteria).map((key) => [key, ""])),
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

    loadTeamAndCriteria();

    return () => controller.abort();
  }, [teamId]);

  const totalQuestions = useMemo(
    () =>
      criteria.reduce(
        (count, criterion) => count + criterion.questions.length,
        0,
      ),
    [criteria],
  );

  const clearFieldError = useCallback((key) => {
    setFieldErrors((previous) => {
      if (!previous[key]) {
        return previous;
      }
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }, []);

  const markCriterionUnsaved = useCallback((key) => {
    const criterionId = toPositiveInteger(String(key).split(":")[0]);

    if (criterionId === null) {
      return;
    }

    setSavedCriteria((previous) => {
      if (!previous.has(criterionId)) {
        return previous;
      }
      const next = new Set(previous);
      next.delete(criterionId);
      return next;
    });
  }, []);

  const handleValueChange = useCallback(
    (key, value) => {
      setValues((previous) => ({ ...previous, [key]: value }));
      setSubmitted(null);
      clearFieldError(key);
      markCriterionUnsaved(key);
    },
    [clearFieldError, markCriterionUnsaved],
  );

  const handleCommentChange = useCallback(
    (key, value) => {
      setComments((previous) => ({ ...previous, [key]: value }));
      setSubmitted(null);
      markCriterionUnsaved(key);
    },
    [markCriterionUnsaved],
  );

  const handleSkipChange = useCallback(
    (key, skipped) => {
      setSkips((previous) => ({ ...previous, [key]: skipped }));
      setSubmitted(null);
      clearFieldError(key);
      markCriterionUnsaved(key);
    },
    [clearFieldError, markCriterionUnsaved],
  );

  const validate = useCallback(() => {
    const errors = {};

    criteria.forEach((criterion) => {
      const maxScore = Number(criterion.maxScore);

      criterion.questions.forEach((question) => {
        const key = questionKey(
          criterion.criterionId,
          question.criterionQuestionId,
        );

        if (skips[key]) {
          return;
        }

        const text = String(values[key] ?? "").trim();

        if (text === "") {
          errors[key] = judgeEvaluation.requiredError;
          return;
        }

        const numeric = Number(text);
        if (!Number.isFinite(numeric)) {
          errors[key] = judgeEvaluation.numberError;
          return;
        }

        if (numeric < 0 || numeric > maxScore) {
          errors[key] = judgeEvaluation.rangeError(maxScore);
        }
      });
    });

    return errors;
  }, [criteria, skips, values]);

  function buildScores() {
    const scores = [];

    criteria.forEach((criterion) => {
      const maxScore = Number(criterion.maxScore);

      criterion.questions.forEach((question) => {
        const key = questionKey(
          criterion.criterionId,
          question.criterionQuestionId,
        );
        const comment = String(comments[key] ?? "").trim();
        const skipped = Boolean(skips[key]);

        scores.push({
          criterionId: criterion.criterionId,
          criterionQuestionId: question.criterionQuestionId,
          maxScore,
          score: skipped ? 0 : Number(String(values[key] ?? "").trim()),
          skipped,
          ...(comment ? { comment } : {}),
        });
      });
    });

    return scores;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || submissionPending.current) {
      return;
    }

    if (
      teamStatus !== "ready" ||
      !team ||
      toPositiveInteger(team.teamId) !== teamId
    ) {
      setFormError(judgeEvaluation.teamMismatchError);
      return;
    }

    setFormError("");
    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      document.getElementById(scoreInputId(firstErrorKey))?.focus();
      return;
    }

    const scores = buildScores();
    if (scores.length === 0) {
      setFormError(judgeEvaluation.noScoresError);
      return;
    }

    const submissionTeamId = teamId;
    const sequence = submitSequence.current + 1;
    submitSequence.current = sequence;

    submissionPending.current = true;
    setIsSubmitting(true);
    setSubmitted(null);

    try {
      const result = await submitScores({
        teamId: submissionTeamId,
        scores,
      });

      if (
        sequence !== submitSequence.current ||
        teamIdRef.current !== submissionTeamId
      ) {
        return;
      }

      if (!Array.isArray(result) || result.length === 0) {
        setFormError(judgeEvaluation.unexpectedResponseError);
        return;
      }

      setSavedCriteria((previous) => {
        const next = new Set(previous);
        scores.forEach((score) => next.add(score.criterionId));
        result.forEach((record) => {
          const recordCriterionId = toPositiveInteger(record?.criterionId);
          if (recordCriterionId !== null) {
            next.add(recordCriterionId);
          }
        });
        return next;
      });
      setSubmitted({ count: result.length });
    } catch (error) {
      if (
        sequence !== submitSequence.current ||
        teamIdRef.current !== submissionTeamId
      ) {
        return;
      }
      setFormError(describeApiError(error, judgeEvaluation.errorTitle));
    } finally {
      if (sequence === submitSequence.current) {
        submissionPending.current = false;
        setIsSubmitting(false);
      }
    }
  }

  async function handlePublication(criterion, action) {
    const criterionId = criterion.criterionId;
    const currentState = publishStates[criterionId];

    if (
      currentState?.status === "pending" ||
      publicationPending.current.has(criterionId)
    ) {
      return;
    }

    publicationPending.current.add(criterionId);

    setPublishStates((previous) => ({
      ...previous,
      [criterionId]: { status: "pending", message: "" },
    }));

    try {
      if (action === "publish") {
        await publishCriterion(criterionId);
      } else {
        await unpublishCriterion(criterionId);
      }

      if (teamIdRef.current !== teamId) {
        return;
      }

      setCriteria((previous) =>
        previous.map((item) => {
          if (item.criterionId !== criterionId) {
            return item;
          }

          const next = {
            ...item,
            isPublishedByCaller: action === "publish",
          };

          if (typeof item.publishedJudgeCount === "number") {
            if (action === "publish" && item.isPublishedByCaller !== true) {
              next.publishedJudgeCount = item.publishedJudgeCount + 1;
            } else if (
              action === "unpublish" &&
              item.isPublishedByCaller === true
            ) {
              next.publishedJudgeCount = Math.max(
                0,
                item.publishedJudgeCount - 1,
              );
            }
          }

          return next;
        }),
      );

      setPublishStates((previous) => ({
        ...previous,
        [criterionId]: {
          status: "success",
          message:
            action === "publish"
              ? judgeEvaluation.publishSuccess
              : judgeEvaluation.unpublishSuccess,
        },
      }));

      if (challengeId !== null) {
        const refreshSequence = publishRefreshSequence.current + 1;
        publishRefreshSequence.current = refreshSequence;

        fetchJudgingCriteria({ challengeId })
          .then((rawCriteria) => {
            if (
              refreshSequence !== publishRefreshSequence.current ||
              teamIdRef.current !== teamId
            ) {
              return;
            }

            const reviewed = reviewCriteria(rawCriteria, challengeId);
            if (reviewed.error) {
              return;
            }

            setCriteria((previous) =>
              previous.map((item) => {
                const fresh = reviewed.criteria.find(
                  (candidate) => candidate.criterionId === item.criterionId,
                );

                if (!fresh) {
                  return item;
                }

                return {
                  ...item,
                  isPublished: fresh.isPublished,
                  isPublishedByCaller: fresh.isPublishedByCaller,
                  publishedAt: fresh.publishedAt,
                  publishedJudgeCount: fresh.publishedJudgeCount,
                };
              }),
            );
          })
          .catch(() => {});
      }
    } catch (error) {
      if (teamIdRef.current !== teamId) {
        return;
      }

      setPublishStates((previous) => ({
        ...previous,
        [criterionId]: {
          status: "error",
          message: describeApiError(
            error,
            judgeEvaluation.publishErrorTitle,
          ),
        },
      }));
    } finally {
      publicationPending.current.delete(criterionId);
    }
  }

  const headerName = useMemo(() => {
    if (teamStatus !== "ready" || !team) {
      return null;
    }
    return team.name?.trim() || judgeDashboard.table.fallbackName;
  }, [team, teamStatus]);

  const canScore = criteriaStatus === "ready" && totalQuestions > 0;

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

        {submitted && (
          <div className="judge-eval-success" role="status" data-reveal-item>
            <span className="judge-eval-success-icon" aria-hidden="true">
              <CheckIcon size={20} />
            </span>
            <div>
              <p className="judge-eval-success-title">{judgeEvaluation.successTitle}</p>
              <p className="judge-eval-success-text">
                {judgeEvaluation.successText(submitted.count)}
              </p>
            </div>
          </div>
        )}

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

        {criteriaStatus === "ready" &&
          criteria.length > 0 &&
          totalQuestions === 0 && (
            <div className="judge-eval-state" role="status">
              <p className="judge-eval-state-text">
                {judgeEvaluation.criteriaNoQuestions}
              </p>
            </div>
          )}

        {canScore && (
          <form className="judge-eval-form" onSubmit={handleSubmit} noValidate>
            <h2 className="judge-eval-criteria-title" data-reveal-item>
              {judgeEvaluation.criteriaTitle}
            </h2>

            <ul className="judge-eval-criteria">
              {criteria.map((criterion) => {
                const maxScore = Number(criterion.maxScore);
                const publishedByCaller = criterion.isPublishedByCaller === true;
                const publicationKnown =
                  typeof criterion.isPublishedByCaller === "boolean";
                const hasSavedScores = savedCriteria.has(criterion.criterionId);
                const publicationState = publishStates[criterion.criterionId];
                const publishPending = publicationState?.status === "pending";

                return (
                  <li
                    className="judge-eval-criterion"
                    key={criterion.criterionId}
                    data-reveal-item
                  >
                    <div className="judge-eval-criterion-head">
                      <h3 className="judge-eval-criterion-name">
                        {criterion.name || `Criterion ${criterion.criterionId}`}
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

                    {criterion.questions.length === 0 ? (
                      <p className="judge-eval-question-empty">
                        {judgeEvaluation.criterionNoQuestions}
                      </p>
                    ) : (
                      <ul className="judge-eval-questions">
                        {criterion.questions.map((question, index) => {
                          const key = questionKey(
                            criterion.criterionId,
                            question.criterionQuestionId,
                          );
                          const inputId = scoreInputId(key);
                          const commentId = `comment-${inputId}`;
                          const errorId = `${inputId}-error`;
                          const error = fieldErrors[key];
                          const skipped = Boolean(skips[key]);

                          return (
                            <li
                              className={
                                skipped
                                  ? "judge-eval-question judge-eval-question--skipped"
                                  : "judge-eval-question"
                              }
                              key={key}
                            >
                              <div className="judge-eval-question-head">
                                <span
                                  className="judge-eval-question-index"
                                  aria-hidden="true"
                                >
                                  {index + 1}
                                </span>
                                <p className="judge-eval-question-text">
                                  {question.text?.trim() || `Question ${index + 1}`}
                                </p>
                                {skipped && (
                                  <span className="judge-eval-badge judge-eval-badge--muted">
                                    {judgeEvaluation.skippedBadge}
                                  </span>
                                )}
                              </div>

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
                                    min={0}
                                    max={maxScore}
                                    step="0.5"
                                    placeholder={judgeEvaluation.scorePlaceholder}
                                    value={values[key] ?? ""}
                                    onChange={(event) =>
                                      handleValueChange(key, event.target.value)
                                    }
                                    disabled={isSubmitting || skipped}
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
                                    value={comments[key] ?? ""}
                                    onChange={(event) =>
                                      handleCommentChange(key, event.target.value)
                                    }
                                    disabled={isSubmitting || skipped}
                                  />
                                </div>
                              </div>

                              <label className="judge-eval-skip">
                                <input
                                  type="checkbox"
                                  checked={skipped}
                                  onChange={(event) =>
                                    handleSkipChange(key, event.target.checked)
                                  }
                                  disabled={isSubmitting}
                                />
                                <span>{judgeEvaluation.skipLabel}</span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {criterion.questions.length > 0 && (
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

                          {!publishedByCaller && !hasSavedScores && (
                            <span className="judge-eval-publication-note">
                              {judgeEvaluation.saveBeforePublish}
                            </span>
                          )}

                          {!publicationKnown && (
                            <span className="judge-eval-publication-note">
                              {judgeEvaluation.publicationUnknownNote}
                            </span>
                          )}
                        </div>

                        {publishedByCaller ? (
                          <button
                            type="button"
                            className="btn judge-eval-publish judge-eval-publish--unpublish"
                            onClick={() =>
                              handlePublication(criterion, "unpublish")
                            }
                            disabled={publishPending || isSubmitting}
                          >
                            {publishPending
                              ? judgeEvaluation.unpublishing
                              : judgeEvaluation.unpublishAction}
                          </button>
                        ) : hasSavedScores ? (
                          <button
                            type="button"
                            className="btn judge-eval-publish"
                            onClick={() => handlePublication(criterion, "publish")}
                            disabled={publishPending || isSubmitting}
                          >
                            {publishPending
                              ? judgeEvaluation.publishing
                              : judgeEvaluation.publishAction}
                          </button>
                        ) : null}
                      </div>
                    )}

                    {publicationState?.message && (
                      <p
                        className={
                          publicationState.status === "error"
                            ? "judge-eval-publish-feedback judge-eval-publish-feedback--error"
                            : "judge-eval-publish-feedback"
                        }
                        role={publicationState.status === "error" ? "alert" : "status"}
                      >
                        {publicationState.message}
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
              <button
                type="submit"
                className="btn judge-eval-submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? judgeEvaluation.submitting : judgeEvaluation.submit}
              </button>
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
