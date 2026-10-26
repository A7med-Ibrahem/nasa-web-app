import { useEffect, useMemo, useRef, useState } from "react";
import "./AdminQuestions.css";

import {
  createQuestion,
  deleteQuestion,
  fetchQuestionsAdmin,
  publishQuestion,
  unpublishQuestion,
  updateQuestion,
} from "../../api/admin/questions";
import { fetchChallenges } from "../../api/challenges";
import { adminData } from "../../data/adminData";
import { site } from "../../data/site";
import useApiResource from "../../hooks/useApiResource";
import { codeKey, loadMessage, statusCode } from "../../utils/adminErrors";
import { formatNumber, parseIntegerInput, toFiniteNumber } from "../../utils/numbers";

import AdminPageHeader from "../../components/admin/AdminPageHeader/AdminPageHeader";
import ConfirmDialog from "../../components/admin/ConfirmDialog/ConfirmDialog";
import {
  AdminNumberField,
  AdminSelectField,
  AdminTextareaField,
  AdminTextField,
} from "../../components/admin/Fields/Fields";
import FormDialog from "../../components/admin/FormDialog/FormDialog";
import InlineNotice from "../../components/admin/InlineNotice/InlineNotice";
import OptionsEditor from "../../components/admin/OptionsEditor/OptionsEditor";
import ResourceTable from "../../components/admin/ResourceTable/ResourceTable";
import StatusPill from "../../components/admin/StatusPill/StatusPill";
import DataState from "../../components/common/DataState/DataState";

const TYPE_MULTIPLE_CHOICE = "multiple-choice";
const TYPE_TEXT = "text";

let optionSequence = 0;

function nextOptionKey() {
  optionSequence += 1;
  return `questions-option-${optionSequence}`;
}

function blankOption() {
  return { key: nextOptionKey(), text: "" };
}

function normalizeType(type) {
  return type === TYPE_MULTIPLE_CHOICE ? TYPE_MULTIPLE_CHOICE : TYPE_TEXT;
}

function parseStoredOptions(raw) {
  const copy = adminData.questions.form;

  if (raw === null || raw === undefined || raw === "") {
    return { options: [blankOption(), blankOption()], error: "" };
  }

  if (typeof raw !== "string") {
    return { options: [blankOption(), blankOption()], error: copy.optionsRebuild };
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      !Array.isArray(parsed) ||
      parsed.some((option) => typeof option !== "string")
    ) {
      throw new Error("unexpected option shape");
    }

    if (parsed.length < 2) {
      return {
        options: [
          ...parsed.map((text) => ({ key: nextOptionKey(), text })),
          ...Array.from({ length: 2 - parsed.length }, blankOption),
        ],
        error: copy.optionsRebuild,
      };
    }

    return {
      options: parsed.map((text) => ({ key: nextOptionKey(), text })),
      error: "",
    };
  } catch {
    return { options: [blankOption(), blankOption()], error: copy.optionsRebuild };
  }
}

function questionErrorState(cause) {
  const copy = adminData.questions.errors;
  const code = codeKey(cause);

  switch (code) {
    case "question_invalid":
      return { form: copy.question_invalid };
    case "question_not_found":
      return { form: copy.question_not_found, refresh: true };
    case "challenge_not_found":
      return {
        fields: { challengeId: copy.challenge_not_found },
        refresh: true,
      };
    default:
      if (statusCode(cause) >= 500) {
        return { form: copy.generic };
      }
      return { form: loadMessage(cause, copy.generic) };
  }
}

function actionErrorState(cause, fallback) {
  const copy = adminData.questions.errors;
  const code = codeKey(cause);

  if (code === "question_not_found") {
    return { message: copy.question_not_found, refresh: true };
  }
  if (code === "challenge_not_found") {
    return { message: copy.challenge_not_found, refresh: true };
  }
  if (statusCode(cause) >= 500) {
    return { message: fallback };
  }
  return { message: loadMessage(cause, fallback) };
}

function QuestionFormDialog({
  mode,
  row,
  defaultChallengeId,
  challenges,
  challengesStatus,
  saving,
  formError,
  fieldErrors,
  onClose,
  onSubmit,
}) {
  const copy = adminData.questions.form;
  const isEdit = mode === "edit";
  const rowType = normalizeType(row?.type);

  const initial = useMemo(() => {
    const parsed =
      mode === "edit" && rowType === TYPE_MULTIPLE_CHOICE
        ? parseStoredOptions(row?.options)
        : null;
    const options = parsed
      ? parsed.options
      : rowType === TYPE_MULTIPLE_CHOICE
        ? [blankOption(), blankOption()]
        : [];
    const correctText = String(row?.correctAnswer ?? "").trim();
    const matchingOption =
      rowType === TYPE_MULTIPLE_CHOICE && correctText
        ? options.find((option) => option.text.trim() === correctText)
        : null;
    let parseNotice = parsed?.error || "";
    if (
      !parseNotice &&
      rowType === TYPE_MULTIPLE_CHOICE &&
      correctText &&
      !matchingOption
    ) {
      parseNotice = copy.correctRebuild;
    }

    return {
      values: {
        challengeId:
          row?.challengeId === null || row?.challengeId === undefined
            ? mode === "create"
              ? defaultChallengeId || ""
              : ""
            : String(row.challengeId),
        type: rowType,
        text: row?.text ?? "",
        points:
          row?.points === null || row?.points === undefined
            ? ""
            : String(row.points),
        options,
        correctKey: matchingOption?.key || "",
        correctAnswer:
          rowType === TYPE_TEXT ? (row?.correctAnswer ?? "") : "",
      },
      parseNotice,
    };
  }, [
    copy.correctRebuild,
    defaultChallengeId,
    mode,
    row,
    rowType,
  ]);

  const [values, setValues] = useState(initial.values);
  const [parseNotice, setParseNotice] = useState(initial.parseNotice);
  const [clientErrors, setClientErrors] = useState({});

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initial.values),
    [initial.values, values],
  );

  const challengeOptions = useMemo(() => {
    const options = challenges.map((challenge) => ({
      value: String(challenge.challengeId),
      label: challenge.title || `Challenge ${challenge.challengeId}`,
    }));

    if (
      values.challengeId &&
      !options.some((option) => option.value === values.challengeId)
    ) {
      options.unshift({
        value: values.challengeId,
        label: `Challenge ${values.challengeId}`,
      });
    }

    return options;
  }, [challenges, values.challengeId]);

  function clearError(key) {
    setClientErrors((current) => ({ ...current, [key]: "" }));
  }

  function setValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    clearError(key);
  }

  function setType(nextType) {
    setValues((current) => {
      const needsOptions =
        nextType === TYPE_MULTIPLE_CHOICE && current.options.length < 2;
      return {
        ...current,
        type: nextType,
        options: needsOptions
          ? [blankOption(), blankOption()]
          : current.options,
        correctKey: needsOptions ? "" : current.correctKey,
      };
    });
    clearError("type");
    clearError("options");
    clearError("correct");
    clearError("correctAnswer");
    setParseNotice("");
  }

  function setOptions(nextOptions) {
    setValues((current) => ({ ...current, options: nextOptions }));
    setParseNotice("");
    clearError("options");
  }

  function setCorrectKey(nextKey) {
    setValues((current) => ({ ...current, correctKey: nextKey }));
    clearError("correct");
  }

  function validate() {
    const next = {};
    const points = parseIntegerInput(values.points);

    if (
      !values.challengeId ||
      !/^[1-9]\d*$/.test(values.challengeId)
    ) {
      next.challengeId = copy.validation.challengeRequired;
    }
    if (
      values.type !== TYPE_MULTIPLE_CHOICE &&
      values.type !== TYPE_TEXT
    ) {
      next.type = copy.validation.typeRequired;
    }
    if (!values.text.trim()) {
      next.text = copy.validation.textRequired;
    }
    if (!Number.isSafeInteger(points) || points < 0) {
      next.points = copy.validation.pointsInvalid;
    }

    if (values.type === TYPE_MULTIPLE_CHOICE) {
      const texts = values.options.map((option) => option.text.trim());
      if (texts.length < 2) {
        next.options = copy.validation.optionsMin;
      } else if (texts.some((text) => !text)) {
        next.options = copy.validation.optionEmpty;
      } else if (
        new Set(texts.map((text) => text.toLowerCase())).size !== texts.length
      ) {
        next.options = copy.validation.optionsUnique;
      }

      const selected = values.options.find(
        (option) => option.key === values.correctKey,
      );
      if (!selected || !selected.text.trim()) {
        next.correct = copy.validation.correctOptionRequired;
      }
    } else if (!values.correctAnswer.trim()) {
      next.correctAnswer = copy.validation.correctTextRequired;
    }

    return next;
  }

  function handleSubmit() {
    if (saving) {
      return;
    }

    const nextErrors = validate();
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const selectedOption = values.options.find(
      (option) => option.key === values.correctKey,
    );

    onSubmit({
      challengeId: Number(values.challengeId),
      type: values.type,
      text: values.text.trim(),
      options:
        values.type === TYPE_MULTIPLE_CHOICE
          ? JSON.stringify(
              values.options.map((option) => option.text.trim()),
            )
          : null,
      correctAnswer:
        values.type === TYPE_MULTIPLE_CHOICE
          ? selectedOption?.text.trim() || null
          : values.correctAnswer.trim(),
      points: parseIntegerInput(values.points),
    });
  }

  const errors = { ...fieldErrors, ...clientErrors };
  const optionType = values.type === TYPE_MULTIPLE_CHOICE;

  return (
    <FormDialog
      title={isEdit ? copy.editTitle : copy.createTitle}
      description={copy.description}
      titleId="questions-dialog-title"
      descriptionId="questions-dialog-description"
      onSubmit={handleSubmit}
      onClose={onClose}
      busy={saving}
      dirty={dirty}
      submitLabel={isEdit ? copy.submitEdit : copy.submitCreate}
      busyLabel={copy.saving}
    >
      {formError ? <InlineNotice tone="error" message={formError} /> : null}
      {parseNotice ? (
        <InlineNotice tone="error" message={parseNotice} />
      ) : null}

      <div className="admin-form-grid">
        <AdminSelectField
          id="questions-challenge"
          label={copy.challenge}
          hint={
            challengesStatus === "error"
              ? adminData.questions.states.challengesError
              : copy.challengeHint
          }
          value={values.challengeId}
          onChange={(event) => setValue("challengeId", event.target.value)}
          error={errors.challengeId}
          required
          disabled={challengesStatus === "loading"}
          options={challengeOptions}
        />

        <AdminSelectField
          id="questions-type"
          label={copy.type}
          hint={copy.typeHint}
          value={values.type}
          onChange={(event) => setType(event.target.value)}
          error={errors.type}
          required
          options={[
            {
              value: TYPE_MULTIPLE_CHOICE,
              label:
                adminData.questions.typeLabels[TYPE_MULTIPLE_CHOICE] ||
                "Multiple choice",
            },
            {
              value: TYPE_TEXT,
              label:
                adminData.questions.typeLabels[TYPE_TEXT] || "Free text",
            },
          ]}
        />

        <div className="admin-form-span">
          <AdminTextareaField
            id="questions-text"
            label={copy.text}
            hint={copy.textHint}
            value={values.text}
            onChange={(event) => setValue("text", event.target.value)}
            error={errors.text}
            required
            rows={3}
            maxLength={2000}
          />
        </div>

        <AdminNumberField
          id="questions-points"
          label={copy.points}
          hint={copy.pointsHint}
          value={values.points}
          onChange={(event) => setValue("points", event.target.value)}
          error={errors.points}
          required
          min="0"
          step="1"
          inputMode="numeric"
        />

        {optionType ? (
          <div className="admin-form-span">
            <OptionsEditor
              idPrefix={`question-${row?.questionId ?? "new"}`}
              options={values.options}
              correctKey={values.correctKey}
              onOptionsChange={setOptions}
              onCorrectKeyChange={setCorrectKey}
              disabled={saving}
              error={errors.options}
              correctError={errors.correct}
              showErrors={Boolean(
                clientErrors.options ||
                  clientErrors.correct ||
                  clientErrors.correctAnswer,
              )}
            />
          </div>
        ) : (
          <div className="admin-form-span">
            <AdminTextField
              id="questions-correct-text"
              label={copy.correctText}
              hint={copy.correctTextHint}
              value={values.correctAnswer}
              onChange={(event) =>
                setValue("correctAnswer", event.target.value)
              }
              error={errors.correctAnswer}
              required
              maxLength={500}
              autoComplete="off"
            />
          </div>
        )}
      </div>

      <p className="admin-dialog-note">{copy.hint}</p>
    </FormDialog>
  );
}

export default function AdminQuestions() {
  const copy = adminData.questions;

  const [challengeId, setChallengeId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");

  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [formState, setFormState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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

  const challengeNames = useMemo(() => {
    const map = new Map();
    challenges.forEach((challenge) => {
      map.set(String(challenge.challengeId), challenge.title);
    });
    return map;
  }, [challenges]);

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

  useEffect(() => {
    const controller = new AbortController();
    const runId = requestIdRef.current + 1;
    requestIdRef.current = runId;

    fetchQuestionsAdmin({
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

  const filteredRows = useMemo(() => {
    const term = searchInput.trim().toLowerCase();

    return rows.filter((row) => {
      if (statusFilter === "published" && row.isPublished !== true) {
        return false;
      }
      if (statusFilter === "unpublished" && row.isPublished === true) {
        return false;
      }
      if (!term) {
        return true;
      }

      const typeText =
        copy.typeLabels[row.type] || String(row.type || "");
      const challengeText =
        challengeNames.get(String(row.challengeId)) ||
        `Challenge ${row.challengeId ?? ""}`;
      const haystack = [
        row.text,
        typeText,
        row.type,
        challengeText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [challengeNames, copy.typeLabels, rows, searchInput, statusFilter]);

  function openCreate() {
    setFormState({ mode: "create", row: null });
    setFormError("");
    setFieldErrors({});
    setNotice(null);
  }

  function openEdit(row) {
    setFormState({ mode: "edit", row });
    setFormError("");
    setFieldErrors({});
    setNotice(null);
  }

  function closeForm() {
    if (saving) {
      return;
    }
    setFormState(null);
    setFormError("");
    setFieldErrors({});
  }

  async function handleFormSubmit(payload) {
    if (!formState || saving) {
      return;
    }

    setSaving(true);
    setFormError("");
    setFieldErrors({});

    try {
      if (formState.mode === "create") {
        await createQuestion(payload);
        setNotice({
          tone: "success",
          message: copy.notice.created(payload.text),
        });
      } else {
        await updateQuestion(formState.row.questionId, payload);
        setNotice({
          tone: "success",
          message: copy.notice.updated(payload.text),
        });
      }

      setFormState(null);
      refreshList();
    } catch (cause) {
      const next = questionErrorState(cause);
      setFieldErrors(next.fields || {});
      setFormError(next.form || "");
      if (next.refresh) {
        refreshList();
      }
    } finally {
      setSaving(false);
    }
  }

  function openConfirm(row, action) {
    setActionError("");
    setConfirmState({ row, action });
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

    const { row, action } = confirmState;
    setActionBusy(true);
    setActionError("");

    try {
      if (action === "delete") {
        await deleteQuestion(row.questionId);
        setNotice({
          tone: "success",
          message: copy.notice.deleted(row.text),
        });
      } else if (action === "publish") {
        await publishQuestion(row.questionId);
        setNotice({
          tone: "success",
          message: copy.notice.published(row.text),
        });
      } else {
        await unpublishQuestion(row.questionId);
        setNotice({
          tone: "success",
          message: copy.notice.unpublished(row.text),
        });
      }

      setConfirmState(null);
      refreshList();
    } catch (cause) {
      const fallback =
        action === "delete"
          ? copy.errors.deleteGeneric
          : action === "publish"
            ? copy.errors.publishGeneric
            : copy.errors.unpublishGeneric;
      const next = actionErrorState(cause, fallback);
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
      key: "text",
      header: copy.table.text,
      render: (row) => (
        <span className="admin-questions-text">
          {row.text || adminData.common.dash}
        </span>
      ),
    },
    {
      key: "type",
      header: copy.table.type,
      render: (row) => (
        <span className="admin-questions-type">
          {copy.typeLabels[row.type] || row.type || adminData.common.dash}
        </span>
      ),
    },
    {
      key: "points",
      header: copy.table.points,
      render: (row) => (
        <span className="admin-questions-number">
          {formatNumber(toFiniteNumber(row.points) ?? 0)}
        </span>
      ),
    },
    {
      key: "published",
      header: copy.table.published,
      render: (row) => (
        <StatusPill tone={row.isPublished ? "on" : "off"}>
          {row.isPublished
            ? copy.status.published
            : copy.status.unpublished}
        </StatusPill>
      ),
    },
    {
      key: "challenge",
      header: copy.table.challenge,
      render: (row) => (
        <span className="admin-questions-challenge">
          {challengeNames.get(String(row.challengeId)) ||
            (row.challengeId
              ? `Challenge ${row.challengeId}`
              : adminData.common.dash)}
        </span>
      ),
    },
  ];

  const hasFilters =
    Boolean(challengeId) ||
    statusFilter !== "all" ||
    Boolean(searchInput.trim());

  const addDisabled =
    challengesResource.status !== "ready" || challenges.length === 0;

  const confirmStateCopy = confirmState
    ? confirmState.action === "delete"
      ? {
          title: copy.confirm.deleteTitle,
          message: copy.confirm.deleteMessage(confirmState.row.text),
          label: copy.confirm.confirmDelete,
          danger: true,
        }
      : confirmState.action === "publish"
        ? {
            title: copy.confirm.publishTitle,
            message: copy.confirm.publishMessage(confirmState.row.text),
            label: copy.confirm.confirmPublish,
            danger: false,
          }
        : {
            title: copy.confirm.unpublishTitle,
            message: copy.confirm.unpublishMessage(confirmState.row.text),
            label: copy.confirm.confirmUnpublish,
            danger: false,
          }
    : null;

  return (
    <div className="admin-questions">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        titleId="admin-questions-title"
        actionLabel={copy.add}
        onAction={openCreate}
        actionDisabled={addDisabled}
      />

      {notice ? (
        <InlineNotice
          tone={notice.tone}
          message={notice.message}
          onDismiss={() => setNotice(null)}
        />
      ) : null}

      {challengesResource.status === "ready" && challenges.length === 0 ? (
        <InlineNotice tone="info" message={copy.states.challengesEmpty} />
      ) : null}

      <section className="admin-questions-filters" aria-label={copy.filters.search}>
        <label className="admin-questions-field" htmlFor="questions-challenge-filter">
          <span className="admin-field-label">{copy.filters.challenge}</span>
          <select
            id="questions-challenge-filter"
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

        <label className="admin-questions-field" htmlFor="questions-status-filter">
          <span className="admin-field-label">{copy.filters.status}</span>
          <select
            id="questions-status-filter"
            className="admin-input admin-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">{copy.filters.allStatuses}</option>
            <option value="published">{copy.filters.published}</option>
            <option value="unpublished">{copy.filters.unpublished}</option>
          </select>
        </label>

        <label className="admin-questions-field" htmlFor="questions-search">
          <span className="admin-field-label">{copy.filters.search}</span>
          <input
            id="questions-search"
            className="admin-input"
            type="search"
            value={searchInput}
            placeholder={copy.filters.searchPlaceholder}
            onChange={(event) => setSearchInput(event.target.value)}
            autoComplete="off"
          />
        </label>

        <p className="admin-questions-hint">{copy.filters.searchHint}</p>

        {challengesResource.status === "loading" ? (
          <p className="admin-questions-note">{copy.states.challengesLoading}</p>
        ) : null}

        {challengesResource.status === "error" ? (
          <p className="admin-questions-note admin-questions-note--error" role="alert">
            {copy.states.challengesError}
            <button
              type="button"
              className="admin-questions-link"
              onClick={challengesResource.retry}
            >
              {adminData.common.retry}
            </button>
          </p>
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
          rows={filteredRows}
          rowKey={(row) => row.questionId}
          emptyTitle={hasFilters ? copy.states.empty : copy.states.emptyAll}
          actionsHeader={copy.table.actions}
          actions={(row) => (
            <span className="admin-row-actions">
              <button
                type="button"
                className="admin-questions-action"
                onClick={() => openEdit(row)}
              >
                {copy.actions.edit}
              </button>
              <button
                type="button"
                className="admin-questions-action"
                onClick={() =>
                  openConfirm(
                    row,
                    row.isPublished ? "unpublish" : "publish",
                  )
                }
              >
                {row.isPublished
                  ? copy.actions.unpublish
                  : copy.actions.publish}
              </button>
              <button
                type="button"
                className="admin-questions-action admin-questions-action--danger"
                onClick={() => openConfirm(row, "delete")}
              >
                {copy.actions.delete}
              </button>
            </span>
          )}
        />
      ) : null}

      {formState ? (
        <QuestionFormDialog
          mode={formState.mode}
          row={formState.row}
          defaultChallengeId={challengeId}
          challenges={challenges}
          challengesStatus={challengesResource.status}
          saving={saving}
          formError={formError}
          fieldErrors={fieldErrors}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      ) : null}

      {confirmState && confirmStateCopy ? (
        <ConfirmDialog
          title={confirmStateCopy.title}
          message={confirmStateCopy.message}
          confirmLabel={confirmStateCopy.label}
          danger={confirmStateCopy.danger}
          busy={actionBusy}
          error={actionError}
          onConfirm={handleConfirm}
          onClose={closeConfirm}
        />
      ) : null}
    </div>
  );
}
