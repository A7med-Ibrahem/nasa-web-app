import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./ParticipantGame.css";

import { ApiError } from "../../api/client";
import { fetchGameLeaderboard, fetchQuestions, submitAnswer } from "../../api/game";
import { useAuth } from "../../auth/useAuth";
import { participantData } from "../../data/participantData";
import { useRevealGroup } from "../../hooks/useReveal";

function parseOptions(options) {
  if (options === null || options === undefined) {
    return { type: "text", options: null };
  }
  if (Array.isArray(options)) {
    return { type: "multiple-choice", options };
  }
  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);
      if (Array.isArray(parsed)) {
        return { type: "multiple-choice", options: parsed };
      }
      return { type: "unknown", options: null };
    } catch {
      return { type: "unknown", options: null };
    }
  }
  return { type: "unknown", options: null };
}

function storageKey(teamId) {
  return `spaceapps.hurghada.game.${teamId}`;
}

function loadLocked(teamId) {
  if (!teamId) {
    return {};
  }
  try {
    const raw = localStorage.getItem(storageKey(teamId));
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveLocked(teamId, value) {
  if (!teamId) {
    return;
  }
  try {
    localStorage.setItem(storageKey(teamId), JSON.stringify(value));
  } catch {
    // ignore
  }
}

export default function ParticipantGame() {
  const { user } = useAuth();
  const pageRef = useRef(null);
  useRevealGroup(pageRef, { stagger: 80, rootMargin: "0px 0px -6% 0px" });

  const teamId = user?.teamId ?? user?.team?.teamId ?? null;

  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [submitting, setSubmitting] = useState({});
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(() => loadLocked(teamId));
  const [questionErrors, setQuestionErrors] = useState({});

  useEffect(() => {
    document.title = "Game — NASA Space Apps Hurghada";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const loadQuestions = useCallback(
    async (signal) => {
      setStatus("loading");
      setError("");
      try {
        const result = await fetchQuestions({ signal });
        const list = Array.isArray(result) ? result : [];
        setQuestions(list);
        setStatus("ready");
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }
        setStatus("error");
        if (err instanceof ApiError) {
          setError(err.message || participantData.game.errorTitle);
        } else {
          setError(participantData.game.errorTitle);
        }
      }
    },
    [],
  );

  const loadLeaderboard = useCallback(
    async (signal) => {
      try {
        const result = await fetchGameLeaderboard({ signal });
        setLeaderboard(Array.isArray(result) ? result : []);
      } catch {
        setLeaderboard([]);
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadQuestions(controller.signal);
    loadLeaderboard(controller.signal);

    function handleFocus() {
      if (document.visibilityState !== "visible") {
        return;
      }
      loadQuestions(new AbortController().signal);
      loadLeaderboard(new AbortController().signal);
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      controller.abort();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [loadLeaderboard, loadQuestions]);

  useEffect(() => {
    saveLocked(teamId, results);
  }, [results, teamId]);

  const standing = useMemo(() => {
    if (!teamId) {
      return null;
    }
    const match = leaderboard.find((item) => item.teamId === teamId);
    if (!match) {
      return null;
    }
    return match;
  }, [leaderboard, teamId]);

  const topFive = useMemo(() => leaderboard.slice(0, 5), [leaderboard]);

  async function handleSubmit(question) {
    const questionId = question.questionId;
    if (submitting[questionId] || results[questionId]) {
      return;
    }

    const parsed = parseOptions(question.options);
    let answerValue = answers[questionId] ?? "";
    if (parsed.type === "multiple-choice" && Array.isArray(parsed.options)) {
      // answer should be option text
      answerValue = String(answerValue).trim();
      if (answerValue === "") {
        setQuestionErrors((prev) => ({
          ...prev,
          [questionId]: participantData.game.question.answerEmpty,
        }));
        return;
      }
    } else if (parsed.type === "text") {
      answerValue = String(answerValue).trim();
      if (answerValue === "") {
        setQuestionErrors((prev) => ({
          ...prev,
          [questionId]: participantData.game.question.answerEmpty,
        }));
        return;
      }
    } else {
      setQuestionErrors((prev) => ({
        ...prev,
        [questionId]: participantData.game.question.cannotDisplay,
      }));
      return;
    }

    setQuestionErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setSubmitting((prev) => ({ ...prev, [questionId]: true }));

    try {
      const result = await submitAnswer(questionId, answerValue);
      const locked = {
        correct: Boolean(result?.correct),
        points: result?.points ?? 0,
        submittedAt: result?.submittedAt ?? null,
      };
      setResults((prev) => ({ ...prev, [questionId]: locked }));
      loadLeaderboard();
    } catch (err) {
      if (err instanceof ApiError) {
        const code = err.code || "";
        if (code === "answer.already_submitted") {
          setResults((prev) => ({ ...prev, [questionId]: { alreadyAnswered: true } }));
        } else if (code === "answer.empty") {
          setQuestionErrors((prev) => ({
            ...prev,
            [questionId]: participantData.game.errors.answer.empty,
          }));
        } else if (code === "question.not_found") {
          setQuestionErrors((prev) => ({
            ...prev,
            [questionId]: participantData.game.errors.answer.question_not_found,
          }));
        } else {
          setQuestionErrors((prev) => ({
            ...prev,
            [questionId]: err.message,
          }));
        }
      } else {
        setQuestionErrors((prev) => ({
          ...prev,
          [questionId]: participantData.game.errorTitle,
        }));
      }
    } finally {
      setSubmitting((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  }

  return (
    <div className="participant-game" ref={pageRef}>
      <header className="participant-game-header" data-reveal-item>
        <div>
          <p className="eyebrow">{participantData.game.title}</p>
          <h2 className="participant-game-title">{participantData.game.subtitle}</h2>
        </div>
        <button
          type="button"
          className="btn participant-refresh"
          onClick={() => {
            const controller = new AbortController();
            loadQuestions(controller.signal);
            loadLeaderboard(controller.signal);
          }}
        >
          {participantData.game.refresh}
        </button>
      </header>

      <section className="participant-card" data-reveal-item>
        <header className="participant-card-header">
          <h3 className="participant-card-title">{participantData.game.standing.title}</h3>
          <Link to="/leaderboard/game" className="participant-leaderboard-link">
            {participantData.game.fullLeaderboard}
          </Link>
        </header>
        {standing ? (
          <div className="participant-standing">
            <div className="participant-standing-item">
              <span className="participant-standing-label">{participantData.game.standing.rank}</span>
              <span className="participant-standing-value">#{standing.rank}</span>
              {standing.isTied ? (
                <span className="participant-standing-tie">{participantData.game.standing.tie}</span>
              ) : null}
            </div>
            <div className="participant-standing-item">
              <span className="participant-standing-label">{participantData.game.standing.correct}</span>
              <span className="participant-standing-value">{standing.correctCount}</span>
            </div>
            <div className="participant-standing-item">
              <span className="participant-standing-label">{participantData.game.standing.points}</span>
              <span className="participant-standing-value">{standing.totalPoints}</span>
            </div>
          </div>
        ) : (
          <p className="participant-muted">{participantData.game.standing.notListed}</p>
        )}
        {topFive.length > 0 ? (
          <div className="participant-top">
            <p className="participant-top-title">{participantData.game.leaderboardTop}</p>
            <ol className="participant-top-list">
              {topFive.map((item) => (
                <li key={item.teamId} className={item.teamId === teamId ? "is-current" : ""}>
                  <span>#{item.rank}</span>
                  <span>{item.teamName}</span>
                  <span>{item.totalPoints} pts</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      {status === "loading" && (
        <div className="participant-state" role="status">
          <span className="team-state-spinner" aria-hidden="true" />
          <p>{participantData.game.loading}</p>
        </div>
      )}

      {status === "error" && (
        <div className="participant-state participant-state--error" role="alert">
          <p className="participant-state-title">{participantData.game.errorTitle}</p>
          <p className="participant-state-text">{error}</p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              const controller = new AbortController();
              loadQuestions(controller.signal);
              loadLeaderboard(controller.signal);
            }}
          >
            {participantData.game.retry}
          </button>
        </div>
      )}

      {status === "ready" && questions.length === 0 && (
        <div className="participant-state" role="status">
          <p className="participant-state-title">{participantData.game.empty}</p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              const controller = new AbortController();
              loadQuestions(controller.signal);
              loadLeaderboard(controller.signal);
            }}
          >
            {participantData.game.refresh}
          </button>
        </div>
      )}

      {status === "ready" && questions.length > 0 && (
        <div className="participant-questions">
          {questions.map((question) => {
            const questionId = question.questionId;
            const parsed = parseOptions(question.options);
            const locked = results[questionId];
            const isSubmitting = Boolean(submitting[questionId]);
            const qError = questionErrors[questionId];

            return (
              <article className="participant-card participant-question" key={questionId} data-reveal-item>
                <header className="participant-question-header">
                  <div>
                    <h3 className="participant-question-text">{question.text}</h3>
                    <p className="participant-question-meta">
                      {participantData.game.question.points}: {question.points}
                    </p>
                  </div>
                </header>

                {locked ? (
                  <div className="participant-question-locked">
                    {locked.alreadyAnswered ? (
                      <p className="participant-question-locked-text">
                        {participantData.game.question.alreadyAnswered}
                      </p>
                    ) : (
                      <>
                        <p className="participant-question-result">
                          {locked.correct
                            ? participantData.game.question.correct
                            : participantData.game.question.incorrect}
                          {" • "}
                          {locked.points} pts
                        </p>
                        {locked.submittedAt ? (
                          <p className="participant-question-meta">
                            {participantData.game.question.submittedAt}: {locked.submittedAt}
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {parsed.type === "multiple-choice" && Array.isArray(parsed.options) ? (
                      <div className="participant-options">
                        {parsed.options.map((option, index) => (
                          <label className="participant-option" key={index}>
                            <input
                              type="radio"
                              name={`q-${questionId}`}
                              value={option}
                              checked={answers[questionId] === option}
                              onChange={(e) => {
                                setAnswers((prev) => ({ ...prev, [questionId]: e.target.value }));
                                setQuestionErrors((prev) => {
                                  const next = { ...prev };
                                  delete next[questionId];
                                  return next;
                                });
                              }}
                              disabled={isSubmitting}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : parsed.type === "text" ? (
                      <textarea
                        className="participant-textarea"
                        rows={3}
                        placeholder={participantData.game.question.textPlaceholder}
                        value={answers[questionId] ?? ""}
                        onChange={(e) => {
                          setAnswers((prev) => ({ ...prev, [questionId]: e.target.value }));
                          setQuestionErrors((prev) => {
                            const next = { ...prev };
                            delete next[questionId];
                            return next;
                          });
                        }}
                        disabled={isSubmitting}
                      />
                    ) : (
                      <p className="participant-muted">{participantData.game.question.cannotDisplay}</p>
                    )}

                    {qError ? (
                      <p className="participant-question-error" role="alert">
                        {qError}
                      </p>
                    ) : null}

                    <div className="participant-question-actions">
                      <button
                        type="button"
                        className="btn"
                        onClick={() => handleSubmit(question)}
                        disabled={
                          isSubmitting ||
                          parsed.type === "unknown" ||
                          (parsed.type === "multiple-choice" && !Array.isArray(parsed.options))
                        }
                      >
                        {isSubmitting
                          ? participantData.game.question.submitting
                          : participantData.game.question.submit}
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
