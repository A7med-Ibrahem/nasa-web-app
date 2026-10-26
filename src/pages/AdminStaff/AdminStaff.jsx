import { useEffect, useMemo, useRef, useState } from "react";
import "./AdminStaff.css";

import {
  createStaff,
  deleteStaff,
  fetchStaff,
  fetchStaffMemberTypes,
  setStaffActive,
  updateStaff,
} from "../../api/admin/staff";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/useAuth";
import { adminData } from "../../data/adminData";
import { site } from "../../data/site";
import useApiResource from "../../hooks/useApiResource";
import { formatDateTime } from "../../utils/dates";
import { getInitials } from "../../utils/initials";
import { toImageSrc } from "../../utils/image";

import AdminPageHeader from "../../components/admin/AdminPageHeader/AdminPageHeader";
import ConfirmDialog from "../../components/admin/ConfirmDialog/ConfirmDialog";
import {
  AdminPasswordField,
  AdminSelectField,
  AdminTextField,
} from "../../components/admin/Fields/Fields";
import FormDialog from "../../components/admin/FormDialog/FormDialog";
import ImageField from "../../components/admin/ImageField/ImageField";
import InlineNotice from "../../components/admin/InlineNotice/InlineNotice";
import ResourceTable from "../../components/admin/ResourceTable/ResourceTable";
import DataState from "../../components/common/DataState/DataState";

const DEBOUNCE_MS = 350;
const EMPTY_FILTERS = { role: "", memberType: "", search: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function loadMessage(cause, fallback) {
  if (cause instanceof ApiError) {
    if (cause.isForbidden) {
      return cause.message || adminData.common.forbidden;
    }
    if (cause.isUnauthorized) {
      return cause.message || adminData.common.unauthorized;
    }
    if (cause.isNetworkError) {
      return cause.message || adminData.common.network;
    }
    return cause.message || fallback;
  }
  return fallback;
}

function staffErrorState(cause) {
  const copy = adminData.staff.errors;
  const code = cause instanceof ApiError ? cause.code : "";

  switch (code) {
    case "staff.username_taken":
      return { fields: { username: copy.staff_username_taken } };
    case "staff.email_taken":
      return { fields: { email: copy.staff_email_taken } };
    case "staff.weak_password":
      return { fields: { password: copy.staff_weak_password } };
    case "staff.member_type_required":
      return { fields: { memberType: copy.staff_member_type_required } };
    case "staff.invalid_member_type":
      return { fields: { memberType: copy.staff_invalid_member_type } };
    case "staff.invalid_role":
      return { fields: { role: copy.staff_invalid_role } };
    case "staff.not_found":
      return { form: copy.staff_not_found, refresh: true };
    case "image.invalid_type":
      return { fields: { photo: copy.image_invalid_type } };
    case "image.invalid_base64":
      return { fields: { photo: copy.image_invalid_base64 } };
    case "image.too_large":
      return { fields: { photo: copy.image_too_large } };
    case "staff.invalid":
      return { form: copy.staff_invalid };
    default:
      return { form: loadMessage(cause, copy.generic) };
  }
}

function roleLabel(role) {
  return adminData.staff.roleLabels[role] || role || adminData.common.dash;
}

function isActiveRow(row) {
  return String(row?.status ?? "").trim().toLowerCase() === "active";
}

function StaffFormDialog({
  mode,
  row,
  memberTypes,
  memberTypesStatus,
  saving,
  formError,
  fieldErrors,
  selfProtected,
  onClose,
  onSubmit,
}) {
  const copy = adminData.staff.form;
  const imageCopy = adminData.common.image;
  const isEdit = mode === "edit";

  const initial = useMemo(
    () => ({
      fullName: row?.fullName ?? "",
      username: row?.username ?? "",
      email: row?.email ?? "",
      password: "",
      role: row?.role ?? "CoreTeam",
      memberType: row?.memberType ?? "",
      status: row?.status ?? "Active",
      photo: row?.photo ?? null,
    }),
    [row],
  );

  const [values, setValues] = useState(initial);
  const [clientErrors, setClientErrors] = useState({});

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

    if (!values.fullName.trim()) {
      next.fullName = "Enter the full name.";
    }
    if (!values.username.trim()) {
      next.username = "Enter a username.";
    }
    if (!values.email.trim()) {
      next.email = "Enter an email address.";
    } else if (!EMAIL_PATTERN.test(values.email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!isEdit && !values.password) {
      next.password = "Enter a password of at least 6 characters.";
    } else if (values.password && values.password.length < 6) {
      next.password = "The password must be at least 6 characters.";
    }

    if (!adminData.staff.roles.includes(values.role)) {
      next.role = adminData.staff.errors.staff_invalid_role;
    }

    if (values.role === "CoreTeam" && !values.memberType) {
      next.memberType = adminData.staff.errors.staff_member_type_required;
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
      fullName: values.fullName.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      password: isEdit ? (values.password ? values.password : null) : values.password,
      role: values.role,
      memberType: values.role === "CoreTeam" ? values.memberType : null,
      ...(isEdit ? { status: values.status } : {}),
      photo: values.photo ?? null,
    });
  }

  const errors = { ...fieldErrors, ...clientErrors };
  const memberTypeOptions = (memberTypes || []).map((value) => ({
    value,
    label: value,
  }));

  return (
    <FormDialog
      title={isEdit ? copy.editTitle : copy.createTitle}
      description={copy.description}
      titleId="staff-dialog-title"
      descriptionId="staff-dialog-description"
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
          id="staff-full-name"
          label={copy.fullName}
          value={values.fullName}
          onChange={(event) => setValue("fullName", event.target.value)}
          error={errors.fullName}
          required
          autoComplete="name"
          maxLength={180}
        />

        <AdminTextField
          id="staff-username"
          label={copy.username}
          value={values.username}
          onChange={(event) => setValue("username", event.target.value)}
          error={errors.username}
          required
          autoComplete="off"
          maxLength={80}
        />

        <AdminTextField
          id="staff-email"
          label={copy.email}
          type="email"
          value={values.email}
          onChange={(event) => setValue("email", event.target.value)}
          error={errors.email}
          required
          autoComplete="email"
          maxLength={180}
        />

        <AdminPasswordField
          id="staff-password"
          label={copy.password}
          value={values.password}
          onChange={(event) => setValue("password", event.target.value)}
          hint={isEdit ? copy.passwordEditHint : copy.passwordCreateHint}
          error={errors.password}
          required={!isEdit}
          autoComplete="new-password"
          maxLength={200}
        />

        <AdminSelectField
          id="staff-role"
          label={copy.role}
          value={values.role}
          onChange={(event) => setValue("role", event.target.value)}
          error={errors.role}
          required
          disabled={selfProtected}
          hint={selfProtected ? adminData.staff.self.editHint : undefined}
          options={adminData.staff.roles.map((role) => ({
            value: role,
            label: roleLabel(role),
          }))}
        />

        {values.role === "CoreTeam" ? (
          <AdminSelectField
            id="staff-member-type"
            label={copy.memberType}
            value={values.memberType}
            onChange={(event) => setValue("memberType", event.target.value)}
            error={errors.memberType}
            hint={
              memberTypesStatus === "error"
                ? adminData.staff.states.memberTypesError
                : copy.memberTypeHint
            }
            required
            disabled={memberTypesStatus !== "ready"}
            placeholder="Select a member type"
            options={memberTypeOptions}
          />
        ) : null}

        {isEdit ? (
          <AdminSelectField
            id="staff-status"
            label={copy.status}
            value={values.status}
            onChange={(event) => setValue("status", event.target.value)}
            required
            disabled={selfProtected}
            hint={selfProtected ? adminData.staff.self.editHint : undefined}
            options={adminData.staff.statuses.map((status) => ({
              value: status,
              label: status,
            }))}
          />
        ) : null}

        <div className="admin-form-span">
          <ImageField
            id="staff-photo"
            label={copy.photo}
            value={values.photo}
            onChange={(value) => setValue("photo", value)}
            error={errors.photo}
            hint={imageCopy.hint}
            disabled={saving}
          />
        </div>
      </div>

      <p className="admin-dialog-note">{copy.hint}</p>
    </FormDialog>
  );
}

export default function AdminStaff() {
  const copy = adminData.staff;
  const { user } = useAuth();
  const selfId = user?.staffId ?? null;

  const [filters, setFilters] = useState(EMPTY_FILTERS);
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
  const filtersRef = useRef(filters);

  const memberTypesResource = useApiResource(fetchStaffMemberTypes);
  const memberTypes = useMemo(
    () => (Array.isArray(memberTypesResource.data) ? memberTypesResource.data : []),
    [memberTypesResource.data],
  );

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  /* Debounced server-side search: the timeout callback is the only place that
     commits the term, so the effect body itself never sets state. */
  useEffect(() => {
    const timer = setTimeout(() => {
      const term = searchInput.trim();
      if (filtersRef.current.search === term) {
        return;
      }
      setFilters((current) => ({ ...current, search: term }));
      setStatus("loading");
      setError("");
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const runId = requestIdRef.current + 1;
    requestIdRef.current = runId;

    fetchStaff({
      role: filters.role,
      memberType: filters.memberType,
      search: filters.search,
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
  }, [
    copy.states.errorTitle,
    filters.memberType,
    filters.role,
    filters.search,
    reloadKey,
  ]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setStatus("loading");
    setError("");
  }

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
        await createStaff(payload);
        setNotice({
          tone: "success",
          message: copy.notice.created(payload.fullName),
        });
      } else {
        await updateStaff(formState.row.staffId, payload);
        setNotice({
          tone: "success",
          message: copy.notice.updated(payload.fullName),
        });
      }

      setFormState(null);
      refreshList();
    } catch (cause) {
      const next = staffErrorState(cause);
      setFieldErrors(next.fields || {});
      setFormError(next.form || "");
      if (next.refresh) {
        refreshList();
      }
    } finally {
      setSaving(false);
    }
  }

  function openToggle(row) {
    const nextActive = !isActiveRow(row);
    setActionError("");
    setConfirmState({ kind: "toggle", row, nextActive });
  }

  function openDelete(row) {
    setActionError("");
    setConfirmState({ kind: "delete", row });
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

    setActionBusy(true);
    setActionError("");

    try {
      if (confirmState.kind === "delete") {
        await deleteStaff(confirmState.row.staffId);
        setNotice({
          tone: "success",
          message: copy.notice.deleted(confirmState.row.fullName),
        });
      } else {
        await setStaffActive(confirmState.row.staffId, confirmState.nextActive);
        setNotice({
          tone: "success",
          message: confirmState.nextActive
            ? copy.notice.activated(confirmState.row.fullName)
            : copy.notice.deactivated(confirmState.row.fullName),
        });
      }

      setConfirmState(null);
      refreshList();
    } catch (cause) {
      setActionError(loadMessage(cause, copy.errors.deleteGeneric));
    } finally {
      setActionBusy(false);
    }
  }

  const columns = [
    {
      key: "avatar",
      header: copy.table.avatar,
      cellClassName: "admin-staff-avatar-cell",
      render: (row) => {
        const src = toImageSrc(row.photo);
        return (
          <span className="admin-avatar" aria-hidden={src ? undefined : "true"}>
            {src ? (
              <img src={src} alt={`${row.fullName || "Staff"} photo`} loading="lazy" />
            ) : (
              getInitials(row.fullName)
            )}
          </span>
        );
      },
    },
    {
      key: "fullName",
      header: copy.table.name,
      render: (row) => (
        <span className="admin-staff-name">
          <span>{row.fullName || adminData.common.dash}</span>
          {selfId !== null && String(row.staffId) === String(selfId) ? (
            <span className="admin-self-badge">{copy.self.badge}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: "username",
      header: copy.table.username,
      render: (row) => row.username || adminData.common.dash,
    },
    {
      key: "email",
      header: copy.table.email,
      render: (row) =>
        row.email ? (
          <a className="admin-text-link" href={`mailto:${row.email}`}>
            {row.email}
          </a>
        ) : (
          adminData.common.dash
        ),
    },
    {
      key: "role",
      header: copy.table.role,
      render: (row) => (
        <span className={`admin-role admin-role--${String(row.role || "unknown").toLowerCase()}`}>
          {roleLabel(row.role)}
        </span>
      ),
    },
    {
      key: "memberType",
      header: copy.table.memberType,
      render: (row) => row.memberType || adminData.common.dash,
    },
    {
      key: "status",
      header: copy.table.status,
      render: (row) => (
        <span
          className={`admin-status ${
            isActiveRow(row) ? "admin-status--active" : "admin-status--inactive"
          }`}
        >
          {row.status || adminData.common.dash}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: copy.table.createdAt,
      render: (row) => (
        <span className="admin-date">{formatDateTime(row.createdAt)}</span>
      ),
    },
  ];

  const editingSelf =
    formState?.mode === "edit" &&
    selfId !== null &&
    String(formState.row?.staffId) === String(selfId);

  return (
    <div className="admin-staff">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        titleId="admin-staff-title"
        actionLabel={copy.add}
        onAction={openCreate}
      />

      <p className="admin-session-note">{copy.sessionNote}</p>

      {notice ? (
        <InlineNotice
          tone={notice.tone}
          message={notice.message}
          onDismiss={() => setNotice(null)}
        />
      ) : null}

      <section className="admin-filter-card" aria-label={copy.filters.caption}>
        <div className="admin-filter-grid">
          <label className="admin-filter-field" htmlFor="admin-staff-role">
            <span className="admin-field-label">{copy.filters.role}</span>
            <select
              id="admin-staff-role"
              className="admin-input admin-select"
              value={filters.role}
              onChange={(event) => updateFilter("role", event.target.value)}
            >
              <option value="">{copy.filters.allRoles}</option>
              {copy.roles.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-filter-field" htmlFor="admin-staff-member-type">
            <span className="admin-field-label">{copy.filters.memberType}</span>
            <select
              id="admin-staff-member-type"
              className="admin-input admin-select"
              value={filters.memberType}
              onChange={(event) => updateFilter("memberType", event.target.value)}
              disabled={memberTypesResource.status !== "ready"}
            >
              <option value="">{copy.filters.allMemberTypes}</option>
              {memberTypes.map((memberType) => (
                <option key={memberType} value={memberType}>
                  {memberType}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-filter-field" htmlFor="admin-staff-search">
            <span className="admin-field-label">{copy.filters.search}</span>
            <input
              id="admin-staff-search"
              className="admin-input"
              type="search"
              value={searchInput}
              placeholder={copy.filters.searchPlaceholder}
              onChange={(event) => setSearchInput(event.target.value)}
              autoComplete="off"
            />
          </label>
        </div>

        {memberTypesResource.status === "loading" ? (
          <p className="admin-inline-note">{copy.states.memberTypesLoading}</p>
        ) : null}

        {memberTypesResource.status === "error" ? (
          <p className="admin-inline-note admin-inline-note--error" role="alert">
            {copy.states.memberTypesError}
            <button
              type="button"
              className="admin-link-button"
              onClick={memberTypesResource.retry}
            >
              {adminData.common.retry}
            </button>
          </p>
        ) : null}

        {memberTypesResource.status === "ready" && memberTypes.length === 0 ? (
          <p className="admin-inline-note">{copy.states.memberTypesEmpty}</p>
        ) : null}

        <p className="admin-filter-hint">{copy.filters.searchHint}</p>
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
          rowKey={(row) => row.staffId}
          emptyTitle={
            filters.role || filters.memberType || filters.search
              ? copy.states.empty
              : copy.states.emptyAll
          }
          actionsHeader={copy.table.actions}
          actions={(row) => {
            const self = selfId !== null && String(row.staffId) === String(selfId);
            const active = isActiveRow(row);

            return (
              <span className="admin-row-actions">
                <button
                  type="button"
                  className="admin-row-action"
                  onClick={() => openEdit(row)}
                >
                  {copy.actions.edit}
                </button>
                <button
                  type="button"
                  className="admin-row-action"
                  onClick={() => openToggle(row)}
                  disabled={self}
                  title={
                    self
                      ? active
                        ? copy.self.deactivateHint
                        : copy.self.deactivateHint
                      : undefined
                  }
                >
                  {active ? copy.actions.deactivate : copy.actions.activate}
                </button>
                <button
                  type="button"
                  className="admin-row-action admin-row-action--danger"
                  onClick={() => openDelete(row)}
                  disabled={self}
                  title={self ? copy.self.deleteHint : undefined}
                >
                  {copy.actions.delete}
                </button>
              </span>
            );
          }}
        />
      ) : null}

      {formState ? (
        <StaffFormDialog
          mode={formState.mode}
          row={formState.row}
          memberTypes={memberTypes}
          memberTypesStatus={memberTypesResource.status}
          saving={saving}
          formError={formError}
          fieldErrors={fieldErrors}
          selfProtected={editingSelf}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      ) : null}

      {confirmState ? (
        <ConfirmDialog
          title={
            confirmState.kind === "delete"
              ? copy.confirm.deleteTitle
              : confirmState.nextActive
                ? copy.confirm.activateTitle
                : copy.confirm.deactivateTitle
          }
          message={
            confirmState.kind === "delete"
              ? copy.confirm.deleteMessage(confirmState.row.fullName)
              : confirmState.nextActive
                ? copy.confirm.activateMessage(confirmState.row.fullName)
                : copy.confirm.deactivateMessage(confirmState.row.fullName)
          }
          confirmLabel={
            confirmState.kind === "delete"
              ? copy.confirm.confirmDelete
              : confirmState.nextActive
                ? copy.confirm.confirmActivate
                : copy.confirm.confirmDeactivate
          }
          danger={confirmState.kind === "delete"}
          busy={actionBusy}
          error={actionError}
          onConfirm={handleConfirm}
          onClose={closeConfirm}
        />
      ) : null}
    </div>
  );
}
