import { useEffect, useRef } from "react";
import "./FormDialog.css";

import { adminData } from "../../../data/adminData";

/**
 * Modal form built on the native <dialog> element.
 *
 * showModal() provides the focus trap and the browser's own Esc handling;
 * this component only adds the labelled shell, a form submit path, a guarded
 * backdrop click and focus restoration to the trigger. It is mounted only
 * while open, which also clears password state on close.
 */
export default function FormDialog({
  title,
  description,
  titleId = "admin-dialog-title",
  descriptionId = "admin-dialog-description",
  onSubmit,
  onClose,
  busy = false,
  dirty = false,
  submitLabel = adminData.common.saved,
  busyLabel,
  cancelLabel = adminData.common.cancel,
  children,
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
    /* Esc closes natively and lands here; a close driven by requestClose()
       already called onClose, so it is not announced twice. */
    if (!closingRef.current) {
      onClose?.();
    }
    closingRef.current = false;
  }

  function handleBackdropClick(event) {
    if (event.target !== dialogRef.current) {
      return;
    }
    if (!dirty) {
      requestClose();
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!busy) {
      onSubmit?.();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="admin-dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={handleNativeClose}
      onCancel={(event) => {
        if (busy) {
          event.preventDefault();
        }
      }}
      onClick={handleBackdropClick}
    >
      <form className="admin-dialog-shell" onSubmit={handleSubmit} noValidate>
        <header className="admin-dialog-header">
          <div className="admin-dialog-heading">
            <h2 className="admin-dialog-title" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="admin-dialog-description" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="admin-dialog-close"
            onClick={requestClose}
            disabled={busy}
            aria-label={adminData.common.close}
          >
            ×
          </button>
        </header>

        <div className="admin-dialog-body">
          {children}
        </div>

        <footer className="admin-dialog-footer">
          <button
            type="button"
            className="btn btn--ghost-dark admin-dialog-button"
            onClick={requestClose}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            className="btn btn--primary admin-dialog-button"
            disabled={busy}
            aria-busy={busy || undefined}
          >
            {busy ? busyLabel || submitLabel : submitLabel}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
