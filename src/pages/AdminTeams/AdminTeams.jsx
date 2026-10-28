import { useEffect, useRef, useState } from "react";
import "./AdminTeams.css";

import { searchTeams } from "../../api/teams";
import { updateTeamLogo } from "../../api/admin/teams";
import { adminData } from "../../data/adminData";
import { site } from "../../data/site";
import { codeKey, loadMessage, statusCode } from "../../utils/adminErrors";
import { toImageSrc } from "../../utils/image";

import AdminPageHeader from "../../components/admin/AdminPageHeader/AdminPageHeader";
import FormDialog from "../../components/admin/FormDialog/FormDialog";
import ImageField from "../../components/admin/ImageField/ImageField";
import InlineNotice from "../../components/admin/InlineNotice/InlineNotice";
import ResourceTable from "../../components/admin/ResourceTable/ResourceTable";
import DataState from "../../components/common/DataState/DataState";

const DEBOUNCE_MS = 350;

function teamLogoErrorState(cause) {
  const copy = adminData.teams.errors;
  const code = codeKey(cause);

  switch (code) {
    case "image_invalid_type":
      return copy.image_invalid_type;
    case "image_invalid_base64":
      return copy.image_invalid_base64;
    case "image_too_large":
      return copy.image_too_large;
    default:
      if (statusCode(cause) >= 500) return copy.generic;
      return loadMessage(cause, copy.generic);
  }
}

function TeamLogoDialog({ row, saving, error, onClose, onSave }) {
  const copy = adminData.teams.logoDialog;
  const [image, setImage] = useState(row?.logo ?? null);
  const dirty = image !== (row?.logo ?? null);

  function handleSubmit() {
    if (saving) return;
    onSave(image);
  }

  function handleRemove() {
    if (saving) return;
    setImage(null);
  }

  return (
    <FormDialog
      title={copy.title}
      description={copy.description}
      titleId="team-logo-dialog-title"
      descriptionId="team-logo-dialog-description"
      onSubmit={handleSubmit}
      onClose={onClose}
      busy={saving}
      dirty={dirty}
      submitLabel={copy.submit}
      busyLabel={copy.saving}
    >
      {error ? <InlineNotice tone="error" message={error} /> : null}
      <div className="admin-form-grid">
        <div className="admin-form-span">
          <ImageField
            id="team-logo"
            label={copy.imageLabel}
            value={image}
            onChange={(value) => setImage(value)}
            maxDimension={512}
            disabled={saving}
          />
        </div>
      </div>
      <button type="button" className="btn btn--ghost-dark" onClick={handleRemove} disabled={saving}>
        {copy.remove}
      </button>
    </FormDialog>
  );
}

export default function AdminTeams() {
  const copy = adminData.teams;

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [dialogState, setDialogState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [notice, setNotice] = useState(null);

  const requestIdRef = useRef(0);
  const searchRef = useRef(searchTerm);

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

  useEffect(() => {
    searchRef.current = searchTerm;
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const term = searchInput.trim();
      if (searchRef.current === term) return;
      setSearchTerm(term);
      setStatus("loading");
      setError("");
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const runId = requestIdRef.current + 1;
    requestIdRef.current = runId;

    searchTeams(searchTerm, { signal: controller.signal })
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
  }, [searchTerm, copy.states.errorTitle]);

  function openDialog(row) {
    setDialogState({ row });
    setDialogError("");
    setNotice(null);
  }

  function closeDialog() {
    if (saving) return;
    setDialogState(null);
    setDialogError("");
  }

  async function handleSave(image) {
    if (!dialogState || saving) return;
    setSaving(true);
    setDialogError("");
    try {
      await updateTeamLogo(dialogState.row.teamId, image);
      setNotice({ tone: "success", message: image === null ? copy.notice.removed : copy.notice.updated });
      setDialogState(null);
      setStatus("loading");
      setError("");
      const result = await searchTeams(searchTerm);
      setRows(Array.isArray(result) ? result : []);
      setStatus("ready");
    } catch (cause) {
      setDialogError(teamLogoErrorState(cause));
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: "logo",
      header: copy.table.logo,
      render: (row) => {
        const src = toImageSrc(row?.logo);
        if (!src) return <span className="admin-teams-logo-placeholder">{adminData.common.dash}</span>;
        return <img className="admin-teams-logo" src={src} alt={row?.name || ""} loading="lazy" />;
      },
    },
    {
      key: "name",
      header: copy.table.name,
      render: (row) => row?.name || adminData.common.dash,
    },
    {
      key: "username",
      header: copy.table.username,
      render: (row) => row?.username || adminData.common.dash,
    },
    {
      key: "status",
      header: copy.table.status,
      render: (row) => (row?.isActive === false ? adminData.common.no : adminData.common.yes),
    },
  ];

  return (
    <div className="admin-teams">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        titleId="admin-teams-title"
      />

      <p className="admin-teams-note">{copy.note}</p>

      <label className="admin-teams-search">
        <span className="admin-field-label">{copy.search.label}</span>
        <input
          className="admin-input"
          type="search"
          value={searchInput}
          placeholder={copy.search.placeholder}
          onChange={(event) => setSearchInput(event.target.value)}
          autoComplete="off"
        />
        <span className="admin-field-hint">{copy.search.hint}</span>
      </label>

      {notice ? <InlineNotice tone={notice.tone} message={notice.message} onDismiss={() => setNotice(null)} /> : null}

      {status === "loading" ? <DataState status="loading" title={copy.states.loading} tone="dark" compact /> : null}
      {status === "error" ? (
        <DataState
          status="error"
          title={copy.states.errorTitle}
          message={error}
          retryLabel={adminData.common.retry}
          onRetry={() => {
            setStatus("loading");
            setError("");
            searchTeams(searchTerm)
              .then((result) => {
                setRows(Array.isArray(result) ? result : []);
                setStatus("ready");
              })
              .catch((cause) => {
                setStatus("error");
                setError(loadMessage(cause, copy.states.errorTitle));
              });
          }}
          tone="dark"
          compact
        />
      ) : null}
      {status === "ready" ? (
        <ResourceTable
          caption={copy.table.caption}
          columns={columns}
          rows={rows}
          rowKey={(row) => row.teamId}
          emptyTitle={copy.states.empty}
          actionsHeader={copy.table.actions}
          actions={(row) => (
            <span className="admin-row-actions">
              <button type="button" className="admin-row-action" onClick={() => openDialog(row)}>
                {copy.actions.changeLogo}
              </button>
              {row?.logo ? (
                <button
                  type="button"
                  className="admin-row-action admin-row-action--danger"
                  onClick={() => {
                    setNotice(null);
                    updateTeamLogo(row.teamId, null)
                      .then(async () => {
                        setNotice({ tone: "success", message: copy.notice.removed });
                        setStatus("loading");
                        const result = await searchTeams(searchTerm);
                        setRows(Array.isArray(result) ? result : []);
                        setStatus("ready");
                      })
                      .catch((cause) => {
                        setNotice({ tone: "error", message: teamLogoErrorState(cause) });
                      });
                  }}
                >
                  {copy.actions.removeLogo}
                </button>
              ) : null}
            </span>
          )}
        />
      ) : null}

      {dialogState ? (
        <TeamLogoDialog row={dialogState.row} saving={saving} error={dialogError} onClose={closeDialog} onSave={handleSave} />
      ) : null}
    </div>
  );
}
