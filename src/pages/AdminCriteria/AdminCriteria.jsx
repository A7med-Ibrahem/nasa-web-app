import { useEffect, useMemo, useRef, useState } from "react";
import "./AdminCriteria.css";

import {
  createCriterion,
  deleteCriterion,
  fetchCriteriaAdmin,
  updateCriterion,
} from "../../api/admin/criteria";
import { adminData } from "../../data/adminData";
import { site } from "../../data/site";
import { codeKey, loadMessage, statusCode } from "../../utils/adminErrors";
import { formatNumber, toFiniteNumber } from "../../utils/numbers";

import AdminPageHeader from "../../components/admin/AdminPageHeader/AdminPageHeader";
import ConfirmDialog from "../../components/admin/ConfirmDialog/ConfirmDialog";
import {
  AdminTextareaField,
  AdminTextField,
} from "../../components/admin/Fields/Fields";
import FormDialog from "../../components/admin/FormDialog/FormDialog";
import InlineNotice from "../../components/admin/InlineNotice/InlineNotice";
import QuestionRepeater from "../../components/admin/QuestionRepeater/QuestionRepeater";
import ResourceTable from "../../components/admin/ResourceTable/ResourceTable";
import StatusPill from "../../components/admin/StatusPill/StatusPill";
import DataState from "../../components/common/DataState/DataState";

let draftSequence = 0;

function nextDraftKey() {
  draftSequence += 1;
  return `criteria-draft-${draftSequence}`;
}

function toQuestionDrafts(questions) {
  return [...(Array.isArray(questions) ? questions : [])]
    .sort(
      (first, second) =>
        (toFiniteNumber(first?.displayOrder) ?? 0) -
        (toFiniteNumber(second?.displayOrder) ?? 0),
    )
    .map((question) => ({
      key: nextDraftKey(),
      text: question?.text ?? "",
    }));
}

function criterionName(row) {
  const name = String(row?.name ?? "").trim();
  if (name) {
    return name;
  }
  return `Criterion ${row?.criterionId ?? ""}`.trim();
}

function criterionErrorState(cause, { deleting = false } = {}) {
  const copy = adminData.criteria.errors;
  const code = codeKey(cause);

  switch (code) {
    case "criterion_not_found":
      return { form: copy.criterion_not_found, refresh: true };
    case "criterion_invalid":
      return { form: copy.criterion_invalid };
    case "question_invalid":
      return { form: copy.question_invalid };
    case "judging_no_scores":
      return { form: copy.judging_no_scores };
    default:
      if (statusCode(cause) >= 500) {
        return {
          form: deleting ? copy.deleteGeneric : copy.updateConflict,
          refresh: true,
        };
      }
      return {
        form: loadMessage(cause, deleting ? copy.deleteGeneric : copy.generic),
      };
  }
}

function normalizeQuestionsForCompare(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }
  return [...questions]
    .sort(
      (first, second) =>
        (toFiniteNumber(first?.displayOrder) ?? 0) -
        (toFiniteNumber(second?.displayOrder) ?? 0),
    )
    .map((question) => String(question?.text ?? "").trim());
}

function CriterionFormDialog({
  mode,
  row,
  saving,
  formError,
  fieldErrors,
  onClose,
  onSubmit,
}) {
  const copy = adminData.criteria.form;
  const isEdit = mode === "edit";

  const initial = useMemo(
    () => ({
      name: row?.name ?? "",
      description: row?.description ?? "",
      questions: toQuestionDrafts(row?.questions),
    }),
    [row],
  );

  const initialQuestionTexts = useMemo(
    () => normalizeQuestionsForCompare(row?.questions),
    [row],
  );

  const [values, setValues] = useState(initial);
  const [clientErrors, setClientErrors] = useState({});

  const currentQuestionTexts = useMemo(
    () =>
      values.questions.map((question) =>
        String(question?.text ?? "").trim(),
      ),
    [values.questions],
  );

  const questionsChanged = useMemo(() => {
    if (!isEdit) {
      return true;
    }
    if (currentQuestionTexts.length !== initialQuestionTexts.length) {
      return true;
    }
    for (let index = 0; index < currentQuestionTexts.length; index += 1) {
      if (currentQuestionTexts[index] !== initialQuestionTexts[index]) {
        return true;
      }
    }
    return false;
  }, [currentQuestionTexts, initialQuestionTexts, isEdit]);

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initial),
    [initial, values],
  );

  function setValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setClientErrors((current) => ({ ...current, [key]: "" }));
  }

  function validate() {
    const next = {};

    if (!values.name.trim()) {
      next.name = copy.validation.nameRequired;
    }
    if (values.questions.some((question) => !question.text.trim())) {
      next.questions = copy.validation.questionEmpty;
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

    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || null,
    };

    if (isEdit) {
      if (questionsChanged) {
        payload.questions = values.questions.map((question, index) => ({
          text: question.text.trim(),
          displayOrder: index + 1,
        }));
      }
    } else {
      payload.questions = values.questions.map((question, index) => ({
        text: question.text.trim(),
        displayOrder: index + 1,
      }));
    }

    onSubmit(payload);
  }

  const errors = { ...fieldErrors, ...clientErrors };

  return (
    <FormDialog
      title={isEdit ? copy.editTitle : copy.createTitle}
      description={copy.description}
      titleId="criteria-dialog-title"
      descriptionId="criteria-dialog-description"
      onSubmit={handleSubmit}
      onClose={onClose}
      busy={saving}
      dirty={dirty}
      submitLabel={isEdit ? copy.submitEdit : copy.submitCreate}
      busyLabel={copy.saving}
    >
      {formError ? <InlineNotice tone="error" message={formError} /> : null}
      {isEdit ? (
        <>
          <p className="admin-criteria-warning">{copy.editWarning}</p>
          {questionsChanged ? (
            <p className="admin-criteria-warning">
              Changing questions regenerates their ids; editing questions that already have scores may fail on the server.
            </p>
          ) : null}
        </>
      ) : null}

      <div className="admin-form-grid">
        <AdminTextField
          id="criteria-name"
          label={copy.name}
          hint={copy.nameHint}
          value={values.name}
          onChange={(event) => setValue("name", event.target.value)}
          error={errors.name}
          required
          maxLength={180}
          autoComplete="off"
        />

        <div className="admin-form-span">
          <AdminTextareaField
            id="criteria-description"
            label={copy.descriptionLabel}
            hint={copy.descriptionHint}
            value={values.description}
            onChange={(event) => setValue("description", event.target.value)}
            rows={3}
            maxLength={2000}
          />
        </div>

        <div className="admin-form-span admin-criteria-questions">
          <span className="admin-field-label">{copy.questions}</span>
          <QuestionRepeater
            idPrefix={isEdit ? `criteria-${row?.criterionId}` : "criteria-new"}
            questions={values.questions}
            onChange={(questions) => setValue("questions", questions)}
            disabled={saving}
            error={errors.questions}
            showErrors={Boolean(clientErrors.questions)}
          />
        </div>
      </div>

      <p className="admin-dialog-note">{copy.hint}</p>
    </FormDialog>
  );
}

export default function AdminCriteria() {
  const copy = adminData.criteria;

  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [formState, setFormState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [confirmState, setConfirmState] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const [notice, setNotice] = useState(null);

  const requestIdRef = useRef(0);

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

  useEffect(() => {
    const controller = new AbortController();
    const runId = requestIdRef.current + 1;
    requestIdRef.current = runId;

    fetchCriteriaAdmin({ signal: controller.signal })
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
  }, [copy.states.errorTitle, reloadKey]);

  function handleRetry() {
    setStatus("loading");
    setError("");
    setReloadKey((current) => current + 1);
  }

  function refreshList() {
    setReloadKey((current) => current + 1);
  }

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
        await createCriterion(payload);
        setNotice({
          tone: "success",
          message: copy.notice.created(payload.name),
        });
      } else {
        await updateCriterion(formState.row.criterionId, payload);
        setNotice({
          tone: "success",
          message: copy.notice.updated(payload.name),
        });
      }

      setFormState(null);
      refreshList();
    } catch (cause) {
      const next = criterionErrorState(cause);
      setFieldErrors(next.fields || {});
      setFormError(next.form || "");
      if (next.refresh) {
        refreshList();
      }
    } finally {
      setSaving(false);
    }
  }

  function openDelete(row) {
    setConfirmText("");
    setActionError("");
    setConfirmState({ row });
  }

  function closeConfirm() {
    if (actionBusy) {
      return;
    }
    setConfirmState(null);
    setConfirmText("");
    setActionError("");
  }

  async function handleConfirm() {
    if (!confirmState || actionBusy) {
      return;
    }

    const expected = criterionName(confirmState.row);
    if (confirmText !== expected) {
      return;
    }

    setActionBusy(true);
    setActionError("");

    try {
      await deleteCriterion(confirmState.row.criterionId);
      setNotice({
        tone: "success",
        message: copy.notice.deleted(confirmState.row.name),
      });
      setConfirmState(null);
      setConfirmText("");
      refreshList();
    } catch (cause) {
      const next = criterionErrorState(cause, { deleting: true });
      setActionError(next.form || "");
      if (next.refresh) {
        refreshList();
      }
    } finally {
      setActionBusy(false);
    }
  }

  const totalWeight = useMemo(
    () =>
      rows.reduce(
        (total, row) => total + (toFiniteNumber(row?.weight) ?? 0),
        0,
      ),
    [rows],
  );

  const columns = [
    {
      key: "name",
      header: copy.table.name,
      render: (row) => (
        <span className="admin-criteria-name-cell">
          <span className="admin-criteria-name">
            {row.name || adminData.common.dash}
          </span>
          {row.description ? (
            <span className="admin-criteria-description">
              {row.description}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "weight",
      header: copy.table.weight,
      render: (row) => (
        <span className="admin-criteria-number">
          {formatNumber(row.weight)}
        </span>
      ),
    },
    {
      key: "maxScore",
      header: copy.table.maxScore,
      render: (row) => (
        <span className="admin-criteria-number">
          {formatNumber(row.maxScore)}
        </span>
      ),
    },
    {
      key: "questions",
      header: copy.table.questions,
      render: (row) => (
        <span className="admin-criteria-number">
          {formatNumber(
            Array.isArray(row.questions) ? row.questions.length : 0,
          )}
        </span>
      ),
    },
    {
      key: "publishedJudgeCount",
      header: copy.table.published,
      render: (row) => (
        <span className="admin-criteria-number">
          {copy.status.judgeCount(
            toFiniteNumber(row.publishedJudgeCount) ?? 0,
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: copy.table.status,
      render: (row) => (
        <StatusPill tone={row.isPublished ? "on" : "off"}>
          {row.isPublished
            ? copy.status.published
            : copy.status.unpublished}
        </StatusPill>
      ),
    },
  ];

  const expectedDeleteName = confirmState
    ? criterionName(confirmState.row)
    : "";

  return (
    <div className="admin-criteria">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        titleId="admin-criteria-title"
        actionLabel={copy.add}
        onAction={openCreate}
      />

      {notice ? (
        <InlineNotice
          tone={notice.tone}
          message={notice.message}
          onDismiss={() => setNotice(null)}
        />
      ) : null}

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
        <>
          <p className="admin-criteria-summary">
            <span>{copy.summary.count(rows.length)}</span>
            <span>{copy.summary.totalWeight(formatNumber(totalWeight))}</span>
          </p>

          <ResourceTable
            caption={copy.table.caption}
            columns={columns}
            rows={rows}
            rowKey={(row) => row.criterionId}
            emptyTitle={copy.states.emptyAll}
            actionsHeader={copy.table.actions}
            actions={(row) => (
              <span className="admin-row-actions">
                <button
                  type="button"
                  className="admin-criteria-action"
                  onClick={() => openEdit(row)}
                >
                  {copy.actions.edit}
                </button>
                <button
                  type="button"
                  className="admin-criteria-action admin-criteria-action--danger"
                  onClick={() => openDelete(row)}
                >
                  {copy.actions.delete}
                </button>
              </span>
            )}
          />
        </>
      ) : null}

      {formState ? (
        <CriterionFormDialog
          mode={formState.mode}
          row={formState.row}
          saving={saving}
          formError={formError}
          fieldErrors={fieldErrors}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      ) : null}

      {confirmState ? (
        <ConfirmDialog
          title={copy.confirm.deleteTitle(expectedDeleteName)}
          message={copy.confirm.deleteMessage(
            expectedDeleteName,
            Array.isArray(confirmState.row.questions)
              ? confirmState.row.questions.length
              : 0,
            toFiniteNumber(confirmState.row.publishedJudgeCount) ?? 0,
          )}
          confirmLabel={copy.confirm.confirmDelete}
          danger
          busy={actionBusy}
          error={actionError}
          confirmDisabled={confirmText !== expectedDeleteName}
          cancelAutoFocus={false}
          onConfirm={handleConfirm}
          onClose={closeConfirm}
        >
          <label
            className="admin-confirm-label"
            htmlFor="criterion-delete-confirm"
          >
            {copy.confirm.typeLabel(expectedDeleteName)}
          </label>
          <input
            id="criterion-delete-confirm"
            className="admin-confirm-input"
            type="text"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            disabled={actionBusy}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          <p className="admin-confirm-input-hint">{copy.confirm.typeHint}</p>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
