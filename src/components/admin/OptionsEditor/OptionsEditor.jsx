import { useState } from "react";
import "./OptionsEditor.css";

import { adminData } from "../../../data/adminData";

let optionSequence = 0;

function nextOptionKey() {
  optionSequence += 1;
  return `option-draft-${optionSequence}`;
}

/**
 * Multiple-choice answer list with one radio for the correct answer.
 *
 * The correct answer is tracked by option key, not by index or text. Renaming
 * or moving an option therefore keeps the same radio selected, and removing the
 * selected option moves the selection to the first remaining option. The page
 * serialises the trimmed texts with JSON.stringify at save time.
 */
export default function OptionsEditor({
  idPrefix = "question",
  options = [],
  correctKey = "",
  onOptionsChange,
  onCorrectKeyChange,
  disabled = false,
  error = "",
  correctError = "",
  showErrors = false,
}) {
  const copy = adminData.questions.form;
  const [liveMessage, setLiveMessage] = useState("");
  const [focusKey, setFocusKey] = useState("");

  const trimmed = options.map((option) => option.text.trim());
  const counts = new Map();
  trimmed.forEach((text) => {
    const key = text.toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  function optionError(index) {
    if (!showErrors) {
      return "";
    }
    if (!trimmed[index]) {
      return copy.validation.optionEmpty;
    }
    if ((counts.get(trimmed[index].toLowerCase()) || 0) > 1) {
      return copy.validation.optionsUnique;
    }
    return "";
  }

  function commit(next, message) {
    onOptionsChange(next);
    setLiveMessage(message);
  }

  function addOption() {
    if (disabled) {
      return;
    }
    const draft = { key: nextOptionKey(), text: "" };
    const next = [...options, draft];
    commit(next, copy.optionsAdded(next.length));
    setFocusKey(draft.key);
  }

  function removeOption(index) {
    if (disabled || options.length <= 2) {
      return;
    }
    const removed = options[index];
    const next = options.filter((_, position) => position !== index);
    commit(next, copy.optionsRemoved(index + 1, next.length));
    if (removed.key === correctKey) {
      onCorrectKeyChange(next[0]?.key || "");
    }
  }

  function moveOption(index, offset) {
    if (disabled) {
      return;
    }
    const target = index + offset;
    if (target < 0 || target >= options.length) {
      return;
    }
    const next = [...options];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    commit(next, copy.optionsMoved(index + 1, target + 1));
  }

  function setOptionText(index, text) {
    const next = options.map((option, position) =>
      position === index ? { ...option, text } : option,
    );
    onOptionsChange(next);
  }

  function chooseCorrect(index) {
    const key = options[index]?.key || "";
    onCorrectKeyChange(key);
    setLiveMessage(copy.correctSelected(index + 1));
  }

  return (
    <fieldset className="admin-options" disabled={disabled}>
      <legend className="admin-options-legend">{copy.options}</legend>
      <p className="admin-options-hint">{copy.optionsHint}</p>

      <div
        className="admin-option-list"
        role="group"
        aria-label={copy.optionListLabel}
      >
        {options.map((option, index) => {
          const inputId = `${idPrefix}-option-${option.key}`;
          const rowError = optionError(index);
          const errorId = `${inputId}-error`;

          return (
            <div className="admin-option-row" key={option.key}>
              <input
                type="radio"
                className="admin-option-radio"
                name={`${idPrefix}-correct-answer`}
                id={`${idPrefix}-correct-${option.key}`}
                checked={correctKey === option.key}
                onChange={() => chooseCorrect(index)}
                aria-label={copy.optionCorrect(index + 1)}
                aria-invalid={correctError ? true : undefined}
              />

              <div className="admin-option-main">
                <label className="admin-option-label" htmlFor={inputId}>
                  {copy.optionLabel(index + 1)}
                </label>
                <input
                  id={inputId}
                  className="admin-input admin-option-input"
                  type="text"
                  value={option.text}
                  placeholder={copy.optionPlaceholder}
                  onChange={(event) => setOptionText(index, event.target.value)}
                  autoFocus={focusKey === option.key}
                  aria-invalid={rowError ? true : undefined}
                  aria-describedby={rowError ? errorId : undefined}
                  autoComplete="off"
                />
                {rowError ? (
                  <p className="admin-option-error" id={errorId} role="alert">
                    {rowError}
                  </p>
                ) : null}
              </div>

              <div className="admin-option-actions">
                <button
                  type="button"
                  className="admin-option-action"
                  onClick={() => moveOption(index, -1)}
                  disabled={index === 0}
                  aria-label={copy.optionMoveUp(index + 1)}
                >
                  ↑<span className="admin-option-action-text">{copy.moveUp}</span>
                </button>
                <button
                  type="button"
                  className="admin-option-action"
                  onClick={() => moveOption(index, 1)}
                  disabled={index === options.length - 1}
                  aria-label={copy.optionMoveDown(index + 1)}
                >
                  ↓
                  <span className="admin-option-action-text">
                    {copy.moveDown}
                  </span>
                </button>
                <button
                  type="button"
                  className="admin-option-action admin-option-action--danger"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                  aria-label={copy.optionRemove(index + 1)}
                >
                  {copy.removeOption}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="admin-options-correct-hint">{copy.correctOptionHint}</p>

      {correctError ? (
        <p className="admin-options-error" role="alert">
          {correctError}
        </p>
      ) : null}

      {error ? (
        <p className="admin-options-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        className="btn btn--ghost-dark admin-option-add"
        onClick={addOption}
      >
        {copy.addOption}
      </button>

      <p className="visually-hidden" role="status" aria-live="polite">
        {liveMessage}
      </p>
    </fieldset>
  );
}
