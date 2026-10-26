import { useEffect, useRef } from "react";
import "./ConfirmDialog.css";

import { adminData } from "../../../data/adminData";

/**
 * Confirmation modal on the native <dialog> element. Used for destructive or
 * access-changing actions; focus stays inside until the dialog closes and then
 * returns to the button that opened it.
 */
export default function ConfirmDialog({
  title,
  message,
  titleId = "admin-confirm-title",
  descriptionId = "admin-confirm-description",
  confirmLabel,
  cancelLabel = adminData.common.cancel,
  danger = false,
  busy = false,
  confirmDisabled = false,
  cancelAutoFocus = true,
  error = "",
  children,
  onConfirm,
  onClose,
}) {
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  const closingRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return undefined;
    }

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (!dialog.open) {
      dialog.showModal();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;

      if (dialog.open) {
        closingRef.current = true;
        dialog.close();
      }

      const target = returnFocusRef.current;
      if (target && document.contains(target)) {
        window.requestAnimationFrame(() => {
          if (document.contains(target)) {
            target.focus();
          }
        });
      }
    };
  }, []);

  function requestClose() {
    if (busy) {
      return;
    }

    closingRef.current = true;
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
    onClose?.();
  }

  function handleNativeClose() {
    if (!closingRef.current) {
      onClose?.();
    }
    closingRef.current = false;
  }

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) {
      requestClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="admin-confirm"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={handleNativeClose}
      onCancel={(event) => {
        if (busy) {
          event.preventDefault();
        }
      }}
      onClick={handleBackdropClick}
    >
      <div className="admin-confirm-shell">
        <h2 className="admin-confirm-title" id={titleId}>
          {title}
        </h2>
        <p className="admin-confirm-message" id={descriptionId}>
          {message}
        </p>

        {children ? (
          <div className="admin-confirm-children">{children}</div>
        ) : null}

        {error ? (
          <p className="admin-confirm-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="admin-confirm-actions">
          <button
            type="button"
            className="btn btn--ghost-dark admin-confirm-button"
            onClick={requestClose}
            disabled={busy}
            autoFocus={cancelAutoFocus}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn admin-confirm-button ${
              danger ? "admin-confirm-button--danger" : "btn--primary"
            }`}
            onClick={onConfirm}
            disabled={busy || confirmDisabled}
            aria-busy={busy || undefined}
          >
            {busy ? adminData.common.working : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
