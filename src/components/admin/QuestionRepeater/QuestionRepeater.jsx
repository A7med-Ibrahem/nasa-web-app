import { useState } from "react";
import "./QuestionRepeater.css";

import { adminData } from "../../../data/adminData";

let draftSequence = 0;

function nextDraftKey() {
  draftSequence += 1;
  return `question-draft-${draftSequence}`;
}

/**
 * Ordered list of criterion question prompts.
 *
 * The list order *is* the display order; the page turns each index into
 * `displayOrder: index + 1` when it saves. Reordering is button-driven, so it
 * works without drag and drop and every action is reachable from the keyboard.
 * A polite live region announces every add, remove and move without moving
 * focus away from the button that was pressed.
 */
export default function QuestionRepeater({
  idPrefix = "criterion",
  questions = [],
  onChange,
  disabled = false,
  error = "",
  showErrors = false,
}) {
  const copy = adminData.criteria.form;
  const [liveMessage, setLiveMessage] = useState("");
  const [focusKey, setFocusKey] = useState("");

  function commit(next, message) {
    onChange(next);
    setLiveMessage(message);
  }

  function addQuestion() {
    if (disabled) {
      return;
    }
    const draft = { key: nextDraftKey(), text: "" };
    const next = [...questions, draft];
    commit(next, copy.questionAdded(next.length));
    setFocusKey(draft.key);
  }

  function removeQuestion(index) {
    if (disabled) {
      return;
    }
    const next = questions.filter((_, position) => position !== index);
    commit(next, copy.questionRemoved(index + 1, next.length));
  }

  function moveQuestion(index, offset) {
    if (disabled) {
      return;
    }
    const target = index + offset;
    if (target < 0 || target >= questions.length) {
      return;
    }
    const next = [...questions];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    commit(next, copy.questionMoved(index + 1, target + 1));
  }

  function setQuestionText(index, text) {
    const next = questions.map((question, position) =>
      position === index ? { ...question, text } : question,
    );
    onChange(next);
  }

  return (
    <div className="admin-question-repeater">
      <div
        className="admin-question-list"
        role="group"
        aria-label={copy.questionListLabel}
      >
        {questions.length === 0 ? (
          <p className="admin-question-empty">{copy.noQuestions}</p>
        ) : null}

        {questions.map((question, index) => {
          const inputId = `${idPrefix}-question-${question.key}`;
          const errorId = `${inputId}-error`;
          const invalid = showErrors && !question.text.trim();

          return (
            <div className="admin-question-row" key={question.key}>
              <span className="admin-question-number" aria-hidden="true">
                {index + 1}
              </span>

              <div className="admin-question-main">
                <label className="admin-question-label" htmlFor={inputId}>
                  {copy.questionLabel(index + 1)}
                </label>
                <textarea
                  id={inputId}
                  className="admin-input admin-textarea admin-question-input"
                  rows={2}
                  value={question.text}
                  placeholder={copy.questionPlaceholder}
                  onChange={(event) => setQuestionText(index, event.target.value)}
                  disabled={disabled}
                  autoFocus={focusKey === question.key}
                  aria-invalid={invalid || undefined}
                  aria-describedby={invalid ? errorId : undefined}
                />
                {invalid ? (
                  <p
                    className="admin-question-error"
                    id={errorId}
                    role="alert"
                  >
                    {copy.validation.questionEmpty}
                  </p>
                ) : null}
              </div>

              <div className="admin-question-actions">
                <button
                  type="button"
                  className="admin-question-action"
                  onClick={() => moveQuestion(index, -1)}
                  disabled={disabled || index === 0}
                  aria-label={copy.questionMoveUp(index + 1)}
                >
                  ↑
                  <span className="admin-question-action-text">
                    {copy.moveUp}
                  </span>
                </button>
                <button
                  type="button"
                  className="admin-question-action"
                  onClick={() => moveQuestion(index, 1)}
                  disabled={disabled || index === questions.length - 1}
                  aria-label={copy.questionMoveDown(index + 1)}
                >
                  ↓
                  <span className="admin-question-action-text">
                    {copy.moveDown}
                  </span>
                </button>
                <button
                  type="button"
                  className="admin-question-action admin-question-action--danger"
                  onClick={() => removeQuestion(index)}
                  disabled={disabled}
                  aria-label={copy.questionRemove(index + 1)}
                >
                  {copy.removeQuestion}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {error ? (
        <p className="admin-question-summary-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="admin-question-footer">
        <button
          type="button"
          className="btn btn--ghost-dark admin-question-add"
          onClick={addQuestion}
          disabled={disabled}
        >
          {copy.addQuestion}
        </button>
        <p className="admin-question-hint">{copy.questionsHint}</p>
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {liveMessage}
      </p>
    </div>
  );
}
