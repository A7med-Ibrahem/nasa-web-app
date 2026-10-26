import { useEffect, useMemo, useState } from "react";
import "./AdminSponsors.css";

import {
  createSponsor,
  createSponsorTier,
  deleteSponsor,
  deleteSponsorTier,
  fetchSponsorTiersAdmin,
  fetchSponsorsAdmin,
  updateSponsor,
  updateSponsorTier,
} from "../../api/admin/sponsors";
import { ApiError } from "../../api/client";
import { adminData } from "../../data/adminData";
import { site } from "../../data/site";
import useApiResource from "../../hooks/useApiResource";
import { isHttpUrl } from "../../utils/apiContent";
import { toImageSrc } from "../../utils/image";

import AdminPageHeader from "../../components/admin/AdminPageHeader/AdminPageHeader";
import ConfirmDialog from "../../components/admin/ConfirmDialog/ConfirmDialog";
import {
  AdminCheckboxField,
  AdminNumberField,
  AdminSelectField,
  AdminTextField,
} from "../../components/admin/Fields/Fields";
import FormDialog from "../../components/admin/FormDialog/FormDialog";
import ImageField from "../../components/admin/ImageField/ImageField";
import InlineNotice from "../../components/admin/InlineNotice/InlineNotice";
import ResourceTable from "../../components/admin/ResourceTable/ResourceTable";
import DataState from "../../components/common/DataState/DataState";

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

/* Error codes arrive in both dotted and underscore forms depending on the
   endpoint, so the switch below only has to know one spelling. */
function codeKey(cause) {
  if (!(cause instanceof ApiError)) {
    return "";
  }
  return String(cause.code || "").replace(/\./g, "_");
}

function sponsorErrorState(cause) {
  const copy = adminData.sponsors.errors;
  const code = codeKey(cause);

  switch (code) {
    case "sponsor_invalid":
      return { form: copy.sponsor_invalid };
    case "sponsor_tier_not_found":
      return { fields: { tierId: copy.sponsor_tier_not_found }, refresh: true };
    case "sponsor_not_found":
      return { form: copy.sponsor_not_found, refresh: true };
    case "image_invalid_type":
      return { fields: { logo: copy.image_invalid_type } };
    case "image_invalid_base64":
      return { fields: { logo: copy.image_invalid_base64 } };
    case "image_too_large":
      return { fields: { logo: copy.image_too_large } };
    default:
      return { form: loadMessage(cause, copy.generic) };
  }
}

function tierErrorState(cause) {
  const copy = adminData.sponsors.errors;
  const code = codeKey(cause);

  switch (code) {
    case "sponsor_tier_invalid":
      return { form: copy.sponsor_tier_invalid };
    case "sponsor_tier_not_found":
      return { form: copy.sponsor_tier_not_found, refresh: true };
    default:
      return { form: loadMessage(cause, copy.generic) };
  }
}

function parseWholeNumber(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }
  if (!/^\d+$/.test(text)) {
    return Number.NaN;
  }
  const numeric = Number(text);
  return Number.isSafeInteger(numeric) ? numeric : Number.NaN;
}

function tierRank(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : Number.POSITIVE_INFINITY;
}

function sortTiers(list) {
  return [...list].sort((first, second) => {
    const firstRank = tierRank(first?.priority);
    const secondRank = tierRank(second?.priority);
    if (firstRank !== secondRank) {
      return firstRank < secondRank ? -1 : 1;
    }
    return String(first?.name || "").localeCompare(String(second?.name || ""), undefined, {
      sensitivity: "base",
    });
  });
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return adminData.common.dash;
  }
  return value;
}

function SponsorLogo({ logo, name }) {
  const [failedSrc, setFailedSrc] = useState("");
  const src = toImageSrc(logo);
  const failed = Boolean(src) && failedSrc === src;

  if (!src || failed) {
    return (
      <span className="admin-sponsor-wordmark">
        {name || adminData.common.dash}
      </span>
    );
  }

  return (
    <span className="admin-sponsor-logo">
      <img
        src={src}
        alt={name ? `${name} logo` : "Sponsor logo"}
        loading="lazy"
        onError={() => setFailedSrc(src)}
      />
    </span>
  );
}

function SponsorFormDialog({
  mode,
  row,
  tiers,
  tiersStatus,
  saving,
  formError,
  fieldErrors,
  onClose,
  onSubmit,
}) {
  const copy = adminData.sponsors.form;
  const validation = copy.validation;
  const isEdit = mode === "edit";

  const initial = useMemo(
    () => ({
      name: row?.name ?? "",
      logo: row?.logo ?? null,
      link: row?.link ?? "",
      tierId:
        row?.tierId !== null && row?.tierId !== undefined
          ? String(row.tierId)
          : row?.tier?.tierId !== null && row?.tier?.tierId !== undefined
            ? String(row.tier.tierId)
            : "",
      active: row ? row.active !== false : true,
      displayOrder: row?.displayOrder ?? "",
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
    const link = values.link.trim();
    const order = parseWholeNumber(values.displayOrder);

    if (!values.name.trim()) {
      next.name = validation.nameRequired;
    }
    if (link && !isHttpUrl(link)) {
      next.link = validation.linkInvalid;
    }
    if (!values.tierId) {
      next.tierId = validation.tierRequired;
    }
    if (Number.isNaN(order)) {
      next.displayOrder = validation.orderInvalid;
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

    const link = values.link.trim();

    onSubmit({
      name: values.name.trim(),
      logo: values.logo ?? null,
      link: link || null,
      tierId: Number(values.tierId),
      active: Boolean(values.active),
      displayOrder: parseWholeNumber(values.displayOrder),
    });
  }

  const errors = { ...fieldErrors, ...clientErrors };
  const tierOptions = tiers.map((tier) => ({
    value: String(tier.tierId),
    label: tier.name || `Tier ${tier.tierId}`,
  }));

  return (
    <FormDialog
      title={isEdit ? copy.sponsorEditTitle : copy.sponsorCreateTitle}
      description={copy.sponsorDescription}
      titleId="sponsor-dialog-title"
      descriptionId="sponsor-dialog-description"
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
          id="sponsor-name"
          label={copy.name}
          value={values.name}
          onChange={(event) => setValue("name", event.target.value)}
          error={errors.name}
          required
          autoComplete="organization"
          maxLength={180}
        />

        <AdminTextField
          id="sponsor-link"
          label={copy.link}
          type="url"
          value={values.link}
          onChange={(event) => setValue("link", event.target.value)}
          hint={copy.linkHint}
          error={errors.link}
          autoComplete="url"
          maxLength={500}
        />

        <AdminSelectField
          id="sponsor-tier"
          label={copy.tier}
          value={values.tierId}
          onChange={(event) => setValue("tierId", event.target.value)}
          hint={
            tiersStatus === "ready"
              ? copy.tierHint
              : adminData.sponsors.states.tiersLoading
          }
          error={errors.tierId}
          required
          disabled={tiersStatus !== "ready" && tiers.length === 0}
          placeholder="Select a tier"
          options={tierOptions}
        />

        <AdminNumberField
          id="sponsor-display-order"
          label={copy.displayOrder}
          value={values.displayOrder}
          onChange={(event) => setValue("displayOrder", event.target.value)}
          hint={copy.displayOrderHint}
          error={errors.displayOrder}
          min={0}
          step={1}
        />

        <AdminCheckboxField
          id="sponsor-active"
          label={copy.active}
          hint={copy.activeHint}
          checked={values.active}
          onChange={(event) => setValue("active", event.target.checked)}
        />

        <div className="admin-form-span">
          <ImageField
            id="sponsor-logo"
            label={copy.logo}
            value={values.logo}
            onChange={(value) => setValue("logo", value)}
            error={errors.logo}
            hint={adminData.common.image.hint}
            disabled={saving}
          />
        </div>
      </div>

      <p className="admin-dialog-note">{copy.required}</p>
    </FormDialog>
  );
}

function TierFormDialog({
  mode,
  row,
  saving,
  formError,
  fieldErrors,
  onClose,
  onSubmit,
}) {
  const copy = adminData.sponsors.form;
  const validation = copy.validation;
  const isEdit = mode === "edit";

  const initial = useMemo(
    () => ({
      name: row?.name ?? "",
      priority: row?.priority ?? 0,
      bannerEnabled: row?.bannerEnabled === true,
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

    if (!values.name.trim()) {
      next.name = validation.tierNameRequired;
    }
    if (Number.isNaN(parseWholeNumber(values.priority))) {
      next.priority = validation.priorityInvalid;
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
      priority: parseWholeNumber(values.priority),
      bannerEnabled: Boolean(values.bannerEnabled),
    });
  }

  const errors = { ...fieldErrors, ...clientErrors };

  return (
    <FormDialog
      title={isEdit ? copy.tierEditTitle : copy.tierCreateTitle}
      description={copy.tierDescription}
      titleId="tier-dialog-title"
      descriptionId="tier-dialog-description"
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
          id="tier-name"
          label={copy.name}
          value={values.name}
          onChange={(event) => setValue("name", event.target.value)}
          error={errors.name}
          required
          autoComplete="off"
          maxLength={120}
        />

        <AdminNumberField
          id="tier-priority"
          label={copy.priority}
          value={values.priority}
          onChange={(event) => setValue("priority", event.target.value)}
          hint={copy.priorityHint}
          error={errors.priority}
          required
          min={0}
          step={1}
        />

        <AdminCheckboxField
          id="tier-banner"
          label={copy.bannerEnabled}
          hint={copy.bannerEnabledHint}
          checked={values.bannerEnabled}
          onChange={(event) => setValue("bannerEnabled", event.target.checked)}
        />
      </div>

      <p className="admin-dialog-note">{copy.required}</p>
    </FormDialog>
  );
}

export default function AdminSponsors() {
  const copy = adminData.sponsors;
  const sponsorsResource = useApiResource(fetchSponsorsAdmin);
  const tiersResource = useApiResource(fetchSponsorTiersAdmin);

  const [includeInactive, setIncludeInactive] = useState(true);
  const [tierFilter, setTierFilter] = useState("");

  const [formState, setFormState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [confirmState, setConfirmState] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const [notice, setNotice] = useState(null);

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

  const tiers = useMemo(
    () =>
      sortTiers(Array.isArray(tiersResource.data) ? tiersResource.data : []),
    [tiersResource.data],
  );

  const sponsors = useMemo(
    () => (Array.isArray(sponsorsResource.data) ? sponsorsResource.data : []),
    [sponsorsResource.data],
  );

  const visibleSponsors = useMemo(
    () =>
      sponsors.filter((sponsor) => {
        if (!includeInactive && sponsor?.active === false) {
          return false;
        }
        if (!tierFilter) {
          return true;
        }
        const tierId = sponsor?.tierId ?? sponsor?.tier?.tierId ?? null;
        return tierId !== null && String(tierId) === tierFilter;
      }),
    [includeInactive, sponsors, tierFilter],
  );

  const sponsorCounts = useMemo(() => {
    const counts = new Map();
    sponsors.forEach((sponsor) => {
      const tierId = sponsor?.tierId ?? sponsor?.tier?.tierId ?? null;
      if (tierId === null || tierId === undefined) {
        return;
      }
      const key = String(tierId);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [sponsors]);

  const addSponsorDisabled =
    tiersResource.status !== "ready" || tiers.length === 0;
  const hasSponsorFilters = !includeInactive || Boolean(tierFilter);

  function refreshAll() {
    sponsorsResource.retry();
    tiersResource.retry();
  }

  function openSponsorCreate() {
    if (addSponsorDisabled) {
      return;
    }
    setFormState({ kind: "sponsor", mode: "create", row: null });
    setFormError("");
    setFieldErrors({});
    setNotice(null);
  }

  function openSponsorEdit(row) {
    setFormState({ kind: "sponsor", mode: "edit", row });
    setFormError("");
    setFieldErrors({});
    setNotice(null);
  }

  function openTierCreate() {
    setFormState({ kind: "tier", mode: "create", row: null });
    setFormError("");
    setFieldErrors({});
    setNotice(null);
  }

  function openTierEdit(row) {
    setFormState({ kind: "tier", mode: "edit", row });
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
      if (formState.kind === "sponsor") {
        if (formState.mode === "create") {
          await createSponsor(payload);
          setNotice({
            tone: "success",
            message: copy.notice.sponsorCreated(payload.name),
          });
        } else {
          await updateSponsor(formState.row.sponsorId, payload);
          setNotice({
            tone: "success",
            message: copy.notice.sponsorUpdated(payload.name),
          });
        }
      } else if (formState.mode === "create") {
        await createSponsorTier(payload);
        setNotice({
          tone: "success",
          message: copy.notice.tierCreated(payload.name),
        });
      } else {
        await updateSponsorTier(formState.row.tierId, payload);
        setNotice({
          tone: "success",
          message: copy.notice.tierUpdated(payload.name),
        });
      }

      setFormState(null);
      refreshAll();
    } catch (cause) {
      const next =
        formState.kind === "sponsor"
          ? sponsorErrorState(cause)
          : tierErrorState(cause);
      setFieldErrors(next.fields || {});
      setFormError(next.form || "");
      if (next.refresh) {
        refreshAll();
      }
    } finally {
      setSaving(false);
    }
  }

  function openDelete(kind, row) {
    setActionError("");
    setConfirmState({ kind, row });
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
      if (confirmState.kind === "sponsor") {
        await deleteSponsor(confirmState.row.sponsorId);
        setNotice({
          tone: "success",
          message: copy.notice.sponsorDeleted(confirmState.row.name),
        });
      } else {
        await deleteSponsorTier(confirmState.row.tierId);
        if (tierFilter === String(confirmState.row.tierId)) {
          setTierFilter("");
        }
        setNotice({
          tone: "success",
          message: copy.notice.tierDeleted(confirmState.row.name),
        });
      }

      setConfirmState(null);
      refreshAll();
    } catch (cause) {
      setActionError(loadMessage(cause, copy.errors.deleteGeneric));
    } finally {
      setActionBusy(false);
    }
  }

  const sponsorColumns = [
    {
      key: "logo",
      header: copy.table.logo,
      render: (row) => <SponsorLogo logo={row.logo} name={row.name} />,
    },
    {
      key: "name",
      header: copy.table.name,
      render: (row) => (
        <span className="admin-sponsor-name">
          {row.name || adminData.common.dash}
        </span>
      ),
    },
    {
      key: "link",
      header: copy.table.link,
      render: (row) => {
        const link = typeof row.link === "string" ? row.link.trim() : "";
        if (!isHttpUrl(link)) {
          return adminData.common.dash;
        }
        return (
          <a
            className="admin-sponsor-link"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link}
          </a>
        );
      },
    },
    {
      key: "tier",
      header: copy.table.tier,
      render: (row) => {
        const nested = row.tier && typeof row.tier === "object" ? row.tier : null;
        if (nested?.name) {
          return nested.name;
        }
        const tierId = row.tierId ?? nested?.tierId ?? null;
        const match =
          tierId === null || tierId === undefined
            ? null
            : tiers.find((tier) => String(tier.tierId) === String(tierId));
        return match?.name || adminData.common.dash;
      },
    },
    {
      key: "active",
      header: copy.table.active,
      render: (row) => (
        <span
          className={`admin-sponsor-flag ${
            row.active === false
              ? "admin-sponsor-flag--off"
              : "admin-sponsor-flag--on"
          }`}
        >
          {row.active === false ? copy.inactiveLabel : copy.activeLabel}
        </span>
      ),
    },
    {
      key: "displayOrder",
      header: copy.table.displayOrder,
      render: (row) => (
        <span className="admin-sponsor-number">
          {displayValue(row.displayOrder)}
        </span>
      ),
    },
  ];

  const tierColumns = [
    {
      key: "name",
      header: copy.table.tierName,
      render: (row) => (
        <span className="admin-tier-name">
          {row.name || adminData.common.dash}
        </span>
      ),
    },
    {
      key: "priority",
      header: copy.table.priority,
      render: (row) => (
        <span className="admin-sponsor-number">
          {displayValue(row.priority)}
        </span>
      ),
    },
    {
      key: "bannerEnabled",
      header: copy.table.banner,
      render: (row) => (
        <span
          className={`admin-sponsor-flag ${
            row.bannerEnabled === true
              ? "admin-sponsor-flag--on"
              : "admin-sponsor-flag--off"
          }`}
        >
          {row.bannerEnabled === true ? adminData.common.yes : adminData.common.no}
        </span>
      ),
    },
    {
      key: "sponsorCount",
      header: copy.table.sponsorCount,
      render: (row) => (
        <span className="admin-sponsor-number">
          {sponsorCounts.get(String(row.tierId)) || 0}
        </span>
      ),
    },
  ];

  return (
    <div className="admin-sponsors">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        titleId="admin-sponsors-title"
        actionLabel={copy.addSponsor}
        onAction={openSponsorCreate}
        actionDisabled={addSponsorDisabled}
      />

      {notice ? (
        <InlineNotice
          tone={notice.tone}
          message={notice.message}
          onDismiss={() => setNotice(null)}
        />
      ) : null}

      {tiersResource.status === "ready" && tiers.length === 0 ? (
        <InlineNotice tone="info" message={copy.noTiersHint} />
      ) : null}

      <section
        className="admin-panel"
        aria-labelledby="admin-sponsors-section-title"
      >
        <div className="admin-panel-head">
          <div className="admin-panel-heading">
            <h3 className="admin-panel-title" id="admin-sponsors-section-title">
              {copy.sponsorsTitle}
            </h3>
            <p className="admin-panel-copy">{copy.includeInactiveHint}</p>
          </div>

          <div className="admin-panel-tools">
            <AdminCheckboxField
              id="admin-sponsors-inactive"
              label={copy.includeInactive}
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.target.checked)}
            />

            <label className="admin-tier-filter" htmlFor="admin-tier-filter">
              <span className="admin-field-label">{copy.tierFilter}</span>
              <select
                id="admin-tier-filter"
                className="admin-input admin-select"
                value={tierFilter}
                onChange={(event) => setTierFilter(event.target.value)}
                disabled={tiersResource.status !== "ready"}
              >
                <option value="">{copy.allTiers}</option>
                {tiers.map((tier) => (
                  <option key={tier.tierId} value={String(tier.tierId)}>
                    {tier.name || `Tier ${tier.tierId}`}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {sponsorsResource.status === "loading" ? (
          <DataState
            status="loading"
            title={copy.states.sponsorsLoading}
            tone="dark"
            compact
          />
        ) : null}

        {sponsorsResource.status === "error" ? (
          <DataState
            status="error"
            title={copy.states.sponsorsError}
            message={sponsorsResource.error?.message}
            retryLabel={adminData.common.retry}
            onRetry={sponsorsResource.retry}
            tone="dark"
            compact
          />
        ) : null}

        {sponsorsResource.status === "ready" ? (
          <ResourceTable
            caption={copy.table.caption}
            columns={sponsorColumns}
            rows={visibleSponsors}
            rowKey={(row) => row.sponsorId}
            emptyTitle={
              hasSponsorFilters
                ? copy.states.sponsorsEmpty
                : copy.states.sponsorsEmptyAll
            }
            actionsHeader={copy.table.actions}
            actions={(row) => (
              <span className="admin-row-actions">
                <button
                  type="button"
                  className="admin-sponsor-action"
                  onClick={() => openSponsorEdit(row)}
                >
                  {copy.actions.edit}
                </button>
                <button
                  type="button"
                  className="admin-sponsor-action admin-sponsor-action--danger"
                  onClick={() => openDelete("sponsor", row)}
                >
                  {copy.actions.delete}
                </button>
              </span>
            )}
          />
        ) : null}
      </section>

      <section className="admin-panel" aria-labelledby="admin-tiers-section-title">
        <div className="admin-panel-head">
          <div className="admin-panel-heading">
            <h3 className="admin-panel-title" id="admin-tiers-section-title">
              {copy.tiersTitle}
            </h3>
          </div>

          <button
            type="button"
            className="btn btn--ghost-dark admin-panel-action"
            onClick={openTierCreate}
          >
            {copy.addTier}
          </button>
        </div>

        {tiersResource.status === "loading" ? (
          <DataState
            status="loading"
            title={copy.states.tiersLoading}
            tone="dark"
            compact
          />
        ) : null}

        {tiersResource.status === "error" ? (
          <DataState
            status="error"
            title={copy.states.tiersError}
            message={tiersResource.error?.message}
            retryLabel={adminData.common.retry}
            onRetry={tiersResource.retry}
            tone="dark"
            compact
          />
        ) : null}

        {tiersResource.status === "ready" ? (
          <ResourceTable
            caption={copy.table.tierCaption}
            columns={tierColumns}
            rows={tiers}
            rowKey={(row) => row.tierId}
            emptyTitle={copy.states.tiersEmpty}
            actionsHeader={copy.table.tierActions}
            actions={(row) => (
              <span className="admin-row-actions">
                <button
                  type="button"
                  className="admin-sponsor-action"
                  onClick={() => openTierEdit(row)}
                >
                  {copy.actions.edit}
                </button>
                <button
                  type="button"
                  className="admin-sponsor-action admin-sponsor-action--danger"
                  onClick={() => openDelete("tier", row)}
                >
                  {copy.actions.delete}
                </button>
              </span>
            )}
          />
        ) : null}
      </section>

      {formState ? (
        formState.kind === "sponsor" ? (
          <SponsorFormDialog
            mode={formState.mode}
            row={formState.row}
            tiers={tiers}
            tiersStatus={tiersResource.status}
            saving={saving}
            formError={formError}
            fieldErrors={fieldErrors}
            onClose={closeForm}
            onSubmit={handleFormSubmit}
          />
        ) : (
          <TierFormDialog
            mode={formState.mode}
            row={formState.row}
            saving={saving}
            formError={formError}
            fieldErrors={fieldErrors}
            onClose={closeForm}
            onSubmit={handleFormSubmit}
          />
        )
      ) : null}

      {confirmState ? (
        <ConfirmDialog
          title={
            confirmState.kind === "sponsor"
              ? copy.confirm.deleteSponsorTitle
              : copy.confirm.deleteTierTitle
          }
          message={
            confirmState.kind === "sponsor"
              ? copy.confirm.deleteSponsorMessage(confirmState.row.name)
              : copy.confirm.deleteTierMessage(confirmState.row.name)
          }
          confirmLabel={
            confirmState.kind === "sponsor"
              ? copy.confirm.confirmSponsor
              : copy.confirm.confirmTier
          }
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
