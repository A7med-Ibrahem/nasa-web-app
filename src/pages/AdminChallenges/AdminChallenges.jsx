import { useEffect, useRef, useState } from "react";
import "./AdminChallenges.css";

import { fetchChallenges } from "../../api/challenges";
import { updateChallengeImage } from "../../api/admin/challenges";
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

function challengeImageErrorState(cause) {
  const copy = adminData.challenges.errors;
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

function ChallengeImageDialog({ row, saving, error, onClose, onSave }) {
  const copy = adminData.challenges.imageDialog;
  const [image, setImage] = useState(row?.image ?? null);
  const dirty = image !== (row?.image ?? null);

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
      titleId="challenge-image-dialog-title"
      descriptionId="challenge-image-dialog-description"
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
            id="challenge-image"
            label={copy.imageLabel}
            value={image}
            onChange={(value) => setImage(value)}
            maxDimension={1280}
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

export default function AdminChallenges() {
  const copy = adminData.challenges;

  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [dialogState, setDialogState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [notice, setNotice] = useState(null);

  const requestIdRef = useRef(0);

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

  useEffect(() => {
    const controller = new AbortController();
    const runId = requestIdRef.current + 1;
    requestIdRef.current = runId;

    fetchChallenges({ signal: controller.signal })
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
  }, [reloadKey, copy.states.errorTitle]);

  function handleRetry() {
    setStatus("loading");
    setError("");
    setReloadKey((current) => current + 1);
  }

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
      await updateChallengeImage(dialogState.row.challengeId, image);
      setNotice({ tone: "success", message: image === null ? copy.notice.removed : copy.notice.updated });
      setDialogState(null);
      setReloadKey((current) => current + 1);
    } catch (cause) {
      setDialogError(challengeImageErrorState(cause));
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: "image",
      header: copy.table.image,
      render: (row) => {
        const src = toImageSrc(row?.image);
        if (!src) return <span className="admin-challenges-image-placeholder">{adminData.common.dash}</span>;
        return <img className="admin-challenges-image" src={src} alt={row?.title || ""} loading="lazy" />;
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
      key: "source",
      header: copy.table.source,
      render: (row) => row?.source || adminData.common.dash,
    },
  ];

  return (
    <div className="admin-challenges">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        titleId="admin-challenges-title"
      />

      <p className="admin-challenges-note">{copy.note}</p>

      {notice ? <InlineNotice tone={notice.tone} message={notice.message} onDismiss={() => setNotice(null)} /> : null}

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
          rows={rows}
          rowKey={(row) => row.challengeId}
          emptyTitle={copy.states.empty}
          actionsHeader={copy.table.actions}
          actions={(row) => (
            <span className="admin-row-actions">
              <button type="button" className="admin-row-action" onClick={() => openDialog(row)}>
                {copy.actions.changeImage}
              </button>
              {row?.image ? (
                <button
                  type="button"
                  className="admin-row-action admin-row-action--danger"
                  onClick={() => {
                    setNotice(null);
                    updateChallengeImage(row.challengeId, null)
                      .then(() => {
                        setNotice({ tone: "success", message: copy.notice.removed });
                        setReloadKey((current) => current + 1);
                      })
                      .catch((cause) => {
                        setNotice({ tone: "error", message: challengeImageErrorState(cause) });
                      });
                  }}
                >
                  {copy.actions.removeImage}
                </button>
              ) : null}
            </span>
          )}
        />
      ) : null}

      {dialogState ? (
        <ChallengeImageDialog row={dialogState.row} saving={saving} error={dialogError} onClose={closeDialog} onSave={handleSave} />
      ) : null}
    </div>
  );
}
