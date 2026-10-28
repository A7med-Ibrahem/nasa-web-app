import { useEffect, useMemo, useRef, useState } from "react";
import "./AdminSeasonMedia.css";

import {
  createSeasonMedia,
  deleteSeasonMedia,
  fetchSeasonMediaAdmin,
  updateSeasonMedia,
} from "../../api/admin/seasonMedia";
import { adminData } from "../../data/adminData";
import { site } from "../../data/site";
import { codeKey, loadMessage, statusCode } from "../../utils/adminErrors";
import { isHttpUrl } from "../../utils/apiContent";
import { toImageSrc } from "../../utils/image";
import { parseIntegerInput, toFiniteNumber } from "../../utils/numbers";

import AdminPageHeader from "../../components/admin/AdminPageHeader/AdminPageHeader";
import ConfirmDialog from "../../components/admin/ConfirmDialog/ConfirmDialog";
import {
  AdminCheckboxField,
  AdminNumberField,
  AdminSelectField,
  AdminTextField,
  AdminTextareaField,
} from "../../components/admin/Fields/Fields";
import FormDialog from "../../components/admin/FormDialog/FormDialog";
import ImageField from "../../components/admin/ImageField/ImageField";
import InlineNotice from "../../components/admin/InlineNotice/InlineNotice";
import ResourceTable from "../../components/admin/ResourceTable/ResourceTable";
import StatusPill from "../../components/admin/StatusPill/StatusPill";
import DataState from "../../components/common/DataState/DataState";

function seasonMediaErrorState(cause, { deleting = false } = {}) {
  const copy = adminData.seasonMedia.errors;
  const code = codeKey(cause);

  switch (code) {
    case "season_media_invalid":
      return { form: copy.season_media_invalid };
    case "season_media_not_found":
      return { form: copy.season_media_not_found, refresh: true };
    case "image_invalid_type":
      return { fields: { image: copy.image_invalid_type } };
    case "image_invalid_base64":
      return { fields: { image: copy.image_invalid_base64 } };
    case "image_too_large":
      return { fields: { image: copy.image_too_large } };
    default:
      if (statusCode(cause) >= 500) {
        return { form: deleting ? copy.deleteGeneric : copy.generic, refresh: true };
      }
      return { form: loadMessage(cause, deleting ? copy.deleteGeneric : copy.generic) };
  }
}

function sortMedia(list) {
  return [...list].sort((a, b) => {
    const sa = String(a?.season || "");
    const sb = String(b?.season || "");
    if (sa !== sb) {
      return sb.localeCompare(sa);
    }
    const oa = toFiniteNumber(a?.displayOrder) ?? 0;
    const ob = toFiniteNumber(b?.displayOrder) ?? 0;
    if (oa !== ob) return oa - ob;
    return String(a?.title || "").localeCompare(String(b?.title || ""));
  });
}

function SeasonMediaFormDialog({
  mode,
  row,
  saving,
  formError,
  fieldErrors,
  onClose,
  onSubmit,
}) {
  const copy = adminData.seasonMedia.form;
  const isEdit = mode === "edit";

  const initial = useMemo(
    () => ({
      season: row?.season ?? "",
      title: row?.title ?? "",
      description: row?.description ?? "",
      image: row?.image ?? null,
      link: row?.link ?? "",
      mediaType: row?.mediaType ?? "image",
      displayOrder:
        row?.displayOrder === null || row?.displayOrder === undefined ? "" : String(row.displayOrder),
      active: row ? row.active !== false : true,
    }),
    [row],
  );

  const [values, setValues] = useState(initial);
  const [clientErrors, setClientErrors] = useState({});

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initial), [initial, values]);

  function setValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setClientErrors((current) => ({ ...current, [key]: "" }));
  }

  function validate() {
    const next = {};
    if (!values.season.trim()) next.season = copy.validation.seasonRequired;
    if (!values.title.trim()) next.title = copy.validation.titleRequired;
    if (values.link && !isHttpUrl(values.link)) {
      next.link = copy.validation.linkInvalid;
    }
    if (values.displayOrder !== "") {
      const parsed = parseIntegerInput(values.displayOrder);
      if (Number.isNaN(parsed)) next.displayOrder = copy.validation.orderInvalid;
    }
    return next;
  }

  function handleSubmit() {
    if (saving) return;
    const nextErrors = validate();
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      season: values.season.trim(),
      title: values.title.trim(),
      description: values.description.trim() || null,
      image: values.image === undefined ? null : values.image,
      link: values.link.trim() || null,
      mediaType: values.mediaType.trim() || null,
      displayOrder: values.displayOrder === "" ? null : parseIntegerInput(values.displayOrder),
      active: Boolean(values.active),
    };
    onSubmit(payload);
  }

  const errors = { ...fieldErrors, ...clientErrors };

  return (
    <FormDialog
      title={isEdit ? copy.editTitle : copy.createTitle}
      description={copy.description}
      titleId="season-media-dialog-title"
      descriptionId="season-media-dialog-description"
      onSubmit={handleSubmit}
      onClose={onClose}
      busy={saving}
      dirty={dirty}
      submitLabel={isEdit ? copy.submitEdit : copy.submitCreate}
      busyLabel={copy.saving}
    >
      {formError ? <InlineNotice tone="error" message={formError} /> : null}
      <div className="admin-form-grid">
        <AdminTextField
          id="season-media-season"
          label={copy.season}
          value={values.season}
          onChange={(event) => setValue("season", event.target.value)}
          error={errors.season}
          required
          autoComplete="off"
        />
        <AdminTextField
          id="season-media-title"
          label={copy.title}
          value={values.title}
          onChange={(event) => setValue("title", event.target.value)}
          error={errors.title}
          required
          autoComplete="off"
        />
        <div className="admin-form-span">
          <AdminTextareaField
            id="season-media-description"
            label={copy.descriptionLabel}
            value={values.description}
            onChange={(event) => setValue("description", event.target.value)}
            rows={3}
          />
        </div>
        <div className="admin-form-span">
          <ImageField
            id="season-media-image"
            label={copy.image}
            value={values.image}
            onChange={(value) => setValue("image", value)}
            error={errors.image}
            maxDimension={1280}
          />
        </div>
        <AdminTextField
          id="season-media-link"
          label={copy.link}
          hint={copy.linkHint}
          value={values.link}
          onChange={(event) => setValue("link", event.target.value)}
          error={errors.link}
          autoComplete="off"
        />
        <AdminSelectField
          id="season-media-type"
          label={copy.mediaType}
          value={values.mediaType}
          onChange={(event) => setValue("mediaType", event.target.value)}
          options={copy.mediaTypeOptions}
        />
        <AdminNumberField
          id="season-media-order"
          label={copy.displayOrder}
          hint={copy.displayOrderHint}
          value={values.displayOrder}
          onChange={(event) => setValue("displayOrder", event.target.value)}
          error={errors.displayOrder}
          min="0"
          step="1"
          inputMode="numeric"
        />
        <AdminCheckboxField
          id="season-media-active"
          label={copy.active}
          checked={values.active}
          onChange={(event) => setValue("active", event.target.checked)}
        />
      </div>
      <p className="admin-dialog-note">{copy.hint}</p>
    </FormDialog>
  );
}

export default function AdminSeasonMedia() {
  const copy = adminData.seasonMedia;

  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [includeInactive, setIncludeInactive] = useState(true);

  const [formState, setFormState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [confirmState, setConfirmState] = useState(null);
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

    fetchSeasonMediaAdmin({ includeInactive, signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted || runId !== requestIdRef.current) return;
        setRows(Array.isArray(result) ? result : []);
        setStatus("ready");
        setError("");
      })
      .catch((cause) => {
        if (controller.signal.aborted || cause?.name === "AbortError" || runId !== requestIdRef.current) return;
        setStatus("error");
        setError(loadMessage(cause, copy.states.errorTitle));
      });

    return () => controller.abort();
  }, [includeInactive, reloadKey, copy.states.errorTitle]);

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
    if (saving) return;
    setFormState(null);
    setFormError("");
    setFieldErrors({});
  }

  async function handleFormSubmit(payload) {
    if (!formState || saving) return;
    setSaving(true);
    setFormError("");
    setFieldErrors({});

    try {
      if (formState.mode === "create") {
        await createSeasonMedia(payload);
        setNotice({ tone: "success", message: copy.notice.created(payload.title) });
      } else {
        await updateSeasonMedia(formState.row.mediaId, payload);
        setNotice({ tone: "success", message: copy.notice.updated(payload.title) });
      }
      setFormState(null);
      refreshList();
    } catch (cause) {
      const next = seasonMediaErrorState(cause);
      setFieldErrors(next.fields || {});
      setFormError(next.form || "");
      if (next.refresh) refreshList();
    } finally {
      setSaving(false);
    }
  }

  function openDelete(row) {
    setActionError("");
    setConfirmState({ row });
  }

  function closeConfirm() {
    if (actionBusy) return;
    setConfirmState(null);
    setActionError("");
  }

  async function handleConfirm() {
    if (!confirmState || actionBusy) return;
    setActionBusy(true);
    setActionError("");
    try {
      await deleteSeasonMedia(confirmState.row.mediaId);
      setNotice({ tone: "success", message: copy.notice.deleted(confirmState.row.title) });
      setConfirmState(null);
      refreshList();
    } catch (cause) {
      const next = seasonMediaErrorState(cause, { deleting: true });
      setActionError(next.form || "");
      if (next.refresh) refreshList();
    } finally {
      setActionBusy(false);
    }
  }

  const sortedRows = useMemo(() => sortMedia(rows), [rows]);

  const columns = [
    {
      key: "image",
      header: copy.table.image,
      render: (row) => {
        const src = toImageSrc(row?.image);
        if (!src) return <span className="admin-season-media-image-placeholder">{adminData.common.dash}</span>;
        return <img className="admin-season-media-image" src={src} alt={row?.title || ""} loading="lazy" />;
      },
    },
    {
      key: "title",
      header: copy.table.title,
      render: (row) => row?.title || adminData.common.dash,
    },
    {
      key: "season",
      header: copy.table.season,
      render: (row) => row?.season || adminData.common.dash,
    },
    {
      key: "mediaType",
      header: copy.table.mediaType,
      render: (row) => row?.mediaType || adminData.common.dash,
    },
    {
      key: "link",
      header: copy.table.link,
      render: (row) =>
        row?.link && isHttpUrl(row.link) ? (
          <a className="admin-season-media-link" href={row.link} target="_blank" rel="noreferrer">
            {row.link}
          </a>
        ) : (
          adminData.common.dash
        ),
    },
    {
      key: "displayOrder",
      header: copy.table.displayOrder,
      render: (row) => (row?.displayOrder === null || row?.displayOrder === undefined ? adminData.common.dash : row.displayOrder),
    },
    {
      key: "active",
      header: copy.table.active,
      render: (row) => (
        <StatusPill tone={row?.active !== false ? "on" : "off"}>
          {row?.active !== false ? copy.activeLabel : copy.inactiveLabel}
        </StatusPill>
      ),
    },
  ];

  return (
    <div className="admin-season-media">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        titleId="admin-season-media-title"
        actionLabel={copy.add}
        onAction={openCreate}
      />

      {notice ? <InlineNotice tone={notice.tone} message={notice.message} onDismiss={() => setNotice(null)} /> : null}

      <div className="admin-season-media-header-row">
        <label className="admin-season-media-toggle">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(event) => {
              setIncludeInactive(event.target.checked);
              setStatus("loading");
              setError("");
            }}
          />
          <span>{copy.includeInactive}</span>
        </label>
      </div>

      {status === "loading" ? <DataState status="loading" title={copy.states.loading} tone="dark" compact /> : null}
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
          rows={sortedRows}
          rowKey={(row) => row.mediaId}
          emptyTitle={copy.states.empty}
          actionsHeader={copy.table.actions}
          actions={(row) => (
            <span className="admin-row-actions">
              <button type="button" className="admin-row-action" onClick={() => openEdit(row)}>
                {copy.actions.edit}
              </button>
              <button type="button" className="admin-row-action admin-row-action--danger" onClick={() => openDelete(row)}>
                {copy.actions.delete}
              </button>
            </span>
          )}
        />
      ) : null}

      {formState ? (
        <SeasonMediaFormDialog
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
          title={copy.confirm.deleteTitle}
          message={copy.confirm.deleteMessage(confirmState.row.title)}
          confirmLabel={copy.confirm.confirmDelete}
          danger
          busy={actionBusy}
          error={actionError}
          onConfirm={handleConfirm}
          onClose={closeConfirm}
        />
      ) : null}
    </div>
  );
}
