import { useEffect, useState } from "react";
import "./AdminGame.css";

import { fetchGameState, startGame, stopGame } from "../../api/game";
import { adminData } from "../../data/adminData";
import { site } from "../../data/site";
import useApiResource from "../../hooks/useApiResource";
import { loadMessage } from "../../utils/adminErrors";
import { formatDateTime } from "../../utils/dates";

import AdminPageHeader from "../../components/admin/AdminPageHeader/AdminPageHeader";
import ConfirmDialog from "../../components/admin/ConfirmDialog/ConfirmDialog";
import InlineNotice from "../../components/admin/InlineNotice/InlineNotice";
import StatusPill from "../../components/admin/StatusPill/StatusPill";
import DataState from "../../components/common/DataState/DataState";

export default function AdminGame() {
  const copy = adminData.game;

  const gameResource = useApiResource(fetchGameState);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    document.title = `${copy.title} — ${site.name}`;
  }, [copy.title]);

  const gameState = gameResource.data;
  const isStarted = gameState?.isStarted === true;
  const canStart =
    gameResource.status === "ready" && Boolean(gameState) && !isStarted;
  const canStop =
    gameResource.status === "ready" && Boolean(gameState) && isStarted;

  function openConfirm(action) {
    setActionError("");
    setConfirmAction(action);
  }

  function closeConfirm() {
    if (actionBusy) {
      return;
    }
    setConfirmAction(null);
    setActionError("");
  }

  async function handleConfirm() {
    if (!confirmAction || actionBusy) {
      return;
    }

    const action = confirmAction;
    setActionBusy(true);
    setActionError("");

    try {
      if (action === "start") {
        await startGame();
        setNotice({ tone: "success", message: copy.notice.started });
      } else {
        await stopGame();
        setNotice({ tone: "success", message: copy.notice.stopped });
      }

      setConfirmAction(null);
      gameResource.retry();
    } catch (cause) {
      setActionError(
        loadMessage(
          cause,
          action === "start" ? copy.errors.start : copy.errors.stop,
        ),
      );
    } finally {
      setActionBusy(false);
    }
  }

  const confirmCopy =
    confirmAction === "start"
      ? {
          title: copy.confirm.startTitle,
          message: copy.confirm.startMessage,
          label: copy.confirm.confirmStart,
          danger: false,
        }
      : confirmAction === "stop"
        ? {
            title: copy.confirm.stopTitle,
            message: copy.confirm.stopMessage,
            label: copy.confirm.confirmStop,
            danger: true,
          }
        : null;

  return (
    <div className="admin-game">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        titleId="admin-game-title"
      />

      {notice ? (
        <InlineNotice
          tone={notice.tone}
          message={notice.message}
          onDismiss={() => setNotice(null)}
        />
      ) : null}

      {gameResource.status === "loading" ? (
        <DataState
          status="loading"
          title={copy.states.loading}
          tone="dark"
          compact
        />
      ) : null}

      {gameResource.status === "error" ? (
        <DataState
          status="error"
          title={copy.states.errorTitle}
          message={loadMessage(gameResource.error, copy.states.errorTitle)}
          retryLabel={adminData.common.retry}
          onRetry={gameResource.retry}
          tone="dark"
          compact
        />
      ) : null}

      {gameResource.status === "ready" && gameState ? (
        <>
          <section className="admin-game-panel" aria-labelledby="admin-game-status">
            <div className="admin-game-status">
              <p className="admin-game-label" id="admin-game-status">
                {copy.statusLabel}
              </p>
              <StatusPill tone={isStarted ? "on" : "off"}>
                {isStarted ? copy.status.started : copy.status.stopped}
              </StatusPill>
              <p className="admin-game-hint">
                {isStarted ? copy.status.startedHint : copy.status.stoppedHint}
              </p>
            </div>

            <div className="admin-game-actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => openConfirm("start")}
                disabled={!canStart}
              >
                {copy.start}
              </button>
              <button
                type="button"
                className="btn btn--ghost-dark"
                onClick={() => openConfirm("stop")}
                disabled={!canStop}
              >
                {copy.stop}
              </button>
              <button
                type="button"
                className="btn btn--ghost-dark"
                onClick={gameResource.retry}
              >
                {adminData.common.refresh}
              </button>
            </div>
          </section>

          <section className="admin-game-details" aria-label={copy.detailsLabel}>
            <dl className="admin-game-detail-list">
              <div className="admin-game-detail">
                <dt>{copy.startedAt}</dt>
                <dd>{formatDateTime(gameState.startedAt)}</dd>
              </div>
              <div className="admin-game-detail">
                <dt>{copy.stoppedAt}</dt>
                <dd>{formatDateTime(gameState.stoppedAt)}</dd>
              </div>
              <div className="admin-game-detail">
                <dt>{copy.updatedAt}</dt>
                <dd>{formatDateTime(gameState.updatedAt)}</dd>
              </div>
            </dl>
            <p className="admin-game-hint">{copy.detailsHint}</p>
          </section>
        </>
      ) : null}

      {confirmCopy ? (
        <ConfirmDialog
          title={confirmCopy.title}
          message={confirmCopy.message}
          confirmLabel={confirmCopy.label}
          danger={confirmCopy.danger}
          busy={actionBusy}
          error={actionError}
          onConfirm={handleConfirm}
          onClose={closeConfirm}
        />
      ) : null}
    </div>
  );
}
