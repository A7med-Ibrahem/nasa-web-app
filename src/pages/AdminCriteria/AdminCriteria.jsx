import { useEffect, useMemo, useRef, useState } from "react";
import "./AdminCriteria.css";

import {
  createCriterion,
  deleteCriterion,
  fetchCriteriaAdmin,
  updateCriterion,
} from "../../api/admin/criteria";
import { fetchChallenges } from "../../api/challenges";
import { adminData } from "../../data/adminData";
import { site } from "../../data/site";
import useApiResource from "../../hooks/useApiResource";
import { codeKey, loadMessage, statusCode } from "../../utils/adminErrors";
import { formatNumber, parseDecimalInput, toFiniteNumber } from "../../utils/numbers";

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
    case "challenge_not_found":
      return {
        fields: { challengeId: copy.challenge_not_found },
        refresh: true,
      };
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

function CriterionFormDialog({
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
  const copy = adminData.criteria.form;
  const isEdit = mode === "edit";

  const initial = useMemo(
    () => ({
      name: row?.name ?? "",
      description: row?.description ?? "",
      maxScore:
        row?.maxScore === null || row?.maxScore === undefined
          ? ""
          : String(row.maxScore),
      weight:
        row?.weight === null || row?.weight === undefined
          ? "0"
          : String(row.weight),
      challengeId:
        row?.challengeId === null || row?.challengeId === undefined
          ? mode === "create"
            ? defaultChallengeId || ""
            : ""
          : String(row.challengeId),
      questions: toQuestionDrafts(row?.questions),
    }),
    [defaultChallengeId, mode, row],
  );

  const [values, setValues] = useState(initial);
  const [clientErrors, setClientErrors] = useState({});

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initial),
    [initial, values],
  );

  const challengeOptions = useMemo(() => {
    const options = challenges.map((challenge) => ({
      value: String(challenge.challengeId),
      label:
        challenge.title || `Challenge ${challenge.challengeId}`,
    }));

    const current = values.challengeId;
    if (current && !options.some((option) => option.value === current)) {
      options.unshift({
        value: current,
        label: `Challenge ${current}`,
      });
    }

    return [
      { value: "", label: copy.noChallenge },
      ...options,
    ];
  }, [challenges, copy.noChallenge, values.challengeId]);

  function setValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setClientErrors((current) => ({ ...current, [key]: "" }));
  }

  function validate() {
    const next = {};
    const maxScore = parseDecimalInput(values.maxScore);
    const weight = parseDecimalInput(values.weight);

    if (!values.name.trim()) {
      next.name = copy.validation.nameRequired;
    }
    if (!Number.isFinite(maxScore) || maxScore < 0) {
      next.maxScore = copy.validation.maxScoreInvalid;
    }
    if (!Number.isFinite(weight) || weight < 0) {
      next.weight = copy.validation.weightInvalid;
    }
    if (
      values.challengeId !== "" &&
      !/^[1-9]\d*$/.test(values.challengeId)
    ) {
      next.challengeId = copy.validation.challengeInvalid;
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

    onSubmit({
      name: values.name.trim(),
      description: values.description.trim() || null,
      maxScore: parseDecimalInput(values.maxScore),
      weight: parseDecimalInput(values.weight),
      challengeId:
        values.challengeId === "" ? null : Number(values.challengeId),
      questions: values.questions.map((question, index) => ({
        text: question.text.trim(),
        displayOrder: index + 1,
      })),
    });
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
        <p className="admin-criteria-warning">{copy.editWarning}</p>
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

        <AdminSelectField
          id="criteria-challenge"
          label={copy.challenge}
          hint={
            challengesStatus === "error"
              ? adminData.criteria.states.challengesError
              : copy.challengeHint
          }
          value={values.challengeId}
          onChange={(event) => setValue("challengeId", event.target.value)}
          error={errors.challengeId}
          disabled={challengesStatus === "loading"}
          options={challengeOptions}
        />

        <AdminNumberField
          id="criteria-max-score"
          label={copy.maxScore}
          hint={copy.maxScoreHint}
          value={values.maxScore}
          onChange={(event) => setValue("maxScore", event.target.value)}
          error={errors.maxScore}
          required
          min="0"
          step="any"
          inputMode="decimal"
        />

        <AdminNumberField
          id="criteria-weight"
          label={copy.weight}
          hint={copy.weightHint}
          value={values.weight}
          onChange={(event) => setValue("weight", event.target.value)}
          error={errors.weight}
          required
          min="0"
          step="any"
          inputMode="decimal"
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

  const [challengeId, setChallengeId] = useState("");
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

  const challengesResource = useApiResource(fetchChallenges);
  const challenges = useMemo(
    () =>
      Array.isArray(challengesResource.data) ? challengesResource.data : [],
    [challengesResource.data],
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

      <section className="admin-criteria-filter" aria-label={copy.filter.challenge}>
        <label className="admin-criteria-filter-field" htmlFor="criteria-challenge-filter">
          <span className="admin-field-label">{copy.filter.challenge}</span>
          <select
            id="criteria-challenge-filter"
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

        {challengesResource.status === "loading" ? (
          <p className="admin-criteria-note">
            {copy.states.challengesLoading}
          </p>
        ) : null}

        {challengesResource.status === "error" ? (
          <p className="admin-criteria-note admin-criteria-note--error" role="alert">
            {copy.states.challengesError}
            <button
              type="button"
              className="admin-criteria-link"
              onClick={challengesResource.retry}
            >
              {adminData.common.retry}
            </button>
          </p>
        ) : null}

        {challengesResource.status === "ready" && challenges.length === 0 ? (
          <p className="admin-criteria-note">
            {copy.states.challengesEmpty}
          </p>
        ) : null}

        <p className="admin-criteria-hint">{copy.filter.hint}</p>
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
            emptyTitle={challengeId ? copy.states.empty : copy.states.emptyAll}
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
