import { useRef, useState } from "react";
import "../Fields/Fields.css";
import "./ImageField.css";

import { adminData } from "../../../data/adminData";
import { toImageSrc } from "../../../utils/image";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const SVG_MAX_BYTES = 200 * 1024;
const GIF_MAX_BYTES = 1024 * 1024;
const MAX_RASTER_SIDE = 512;

const MIME_BY_EXTENSION = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

const ALLOWED_MIME_TYPES = new Set(Object.values(MIME_BY_EXTENSION));

function extensionOf(name) {
  const value = typeof name === "string" ? name : "";
  const dot = value.lastIndexOf(".");
  return dot >= 0 ? value.slice(dot + 1).toLowerCase() : "";
}

function kindForMime(mime) {
  if (mime === "image/svg+xml") {
    return "svg";
  }
  if (mime === "image/gif") {
    return "gif";
  }
  if (mime === "image/png" || mime === "image/jpeg" || mime === "image/webp") {
    return "raster";
  }
  return "";
}

function detectKind(file) {
  const mime = String(file?.type || "").toLowerCase();
  const extension = extensionOf(file?.name);

  if (mime && !ALLOWED_MIME_TYPES.has(mime)) {
    return "";
  }
  if (extension && !MIME_BY_EXTENSION[extension]) {
    return "";
  }
  if (!mime && !extension) {
    return "";
  }

  return kindForMime(mime) || kindForMime(MIME_BY_EXTENSION[extension]);
}

function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("unreadable"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("unreadable"));
    image.src = src;
  });
}

function dataUrlBytes(dataUrl) {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) {
    return 0;
  }
  const encoded = dataUrl.slice(comma + 1);
  return Math.ceil((encoded.length * 3) / 4);
}

async function shrinkRaster(file) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const naturalWidth = image.naturalWidth || image.width;
    const naturalHeight = image.naturalHeight || image.height;

    if (!naturalWidth || !naturalHeight) {
      throw new Error("unreadable");
    }

    const scale = Math.min(
      1,
      MAX_RASTER_SIDE / Math.max(naturalWidth, naturalHeight),
    );
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("unreadable");
    }

    /* A fresh canvas is transparent, so dropping alpha-only pixels keeps
       transparency instead of flattening it onto black. */
    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);

    let dataUrl = canvas.toDataURL("image/webp", 0.9);
    if (!dataUrl.startsWith("data:image/webp")) {
      dataUrl = canvas.toDataURL("image/png");
    }

    return { dataUrl, width, height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Image input with local processing.
 *
 * Rasters are re-encoded to fit 512 px on the longest side; SVG and GIF are
 * kept byte-for-byte within their own limits. The emitted value is always a
 * data URI, `null` after Remove, or the previous value when nothing changed.
 */
export default function ImageField({
  id,
  label,
  hint,
  error,
  value,
  onChange,
  disabled = false,
  className = "",
}) {
  const copy = adminData.common.image;
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState("");
  const [info, setInfo] = useState("");
  const [processing, setProcessing] = useState(false);

  const preview = toImageSrc(value);
  const shownError = localError || error || "";
  const hintId = hint || info ? `${id}-hint` : undefined;
  const errorId = shownError ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  async function handleFile(event) {
    const file = event.target.files?.[0] || null;
    event.target.value = "";

    if (!file || processing) {
      return;
    }

    setLocalError("");
    setInfo("");

    if (file.size > MAX_FILE_BYTES) {
      setLocalError(copy.tooLarge);
      return;
    }

    const kind = detectKind(file);
    if (!kind) {
      setLocalError(copy.invalidType);
      return;
    }

    if (kind === "svg" && file.size > SVG_MAX_BYTES) {
      setLocalError(copy.svgTooLarge);
      return;
    }

    if (kind === "gif" && file.size > GIF_MAX_BYTES) {
      setLocalError(copy.gifTooLarge);
      return;
    }

    setProcessing(true);

    try {
      let dataUrl;
      let message = copy.ready;

      if (kind === "raster") {
        const result = await shrinkRaster(file);
        dataUrl = result.dataUrl;
        message = copy.resized(
          result.width,
          result.height,
          Math.max(1, Math.ceil(dataUrlBytes(dataUrl) / 1024)),
        );
      } else {
        dataUrl = await readDataUrl(file);
        if (!dataUrl.startsWith("data:image/")) {
          throw new Error("unreadable");
        }
      }

      if (dataUrlBytes(dataUrl) > MAX_FILE_BYTES) {
        setLocalError(copy.tooLarge);
        return;
      }

      onChange?.(dataUrl);
      setInfo(message);
    } catch {
      setLocalError(copy.unreadable);
    } finally {
      setProcessing(false);
    }
  }

  function handleRemove() {
    setLocalError("");
    setInfo("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onChange?.(null);
  }

  return (
    <div className={`admin-field admin-image-field ${className}`.trim()}>
      <span className="admin-field-label" id={`${id}-label`}>
        {label}
      </span>

      <div className="admin-image">
        <div className="admin-image-preview" aria-hidden={preview ? undefined : "true"}>
          {preview ? (
            <img src={preview} alt={`${label} preview`} />
          ) : (
            <span className="admin-image-empty">{copy.noImage}</span>
          )}
        </div>

        <div className="admin-image-actions">
          <input
            ref={inputRef}
            id={id}
            className="admin-image-input"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,.png,.jpg,.jpeg,.webp,.gif,.svg"
            onChange={handleFile}
            disabled={disabled || processing}
            aria-labelledby={`${id}-label`}
            aria-describedby={describedBy}
            aria-invalid={shownError ? true : undefined}
          />
          <label
            className="btn btn--ghost-dark admin-image-pick"
            htmlFor={id}
            aria-disabled={disabled || processing || undefined}
          >
            {processing ? copy.processing : preview ? copy.replace : copy.choose}
          </label>

          {value ? (
            <button
              type="button"
              className="btn btn--ghost-dark admin-image-remove"
              onClick={handleRemove}
              disabled={disabled || processing}
            >
              {copy.remove}
            </button>
          ) : null}
        </div>
      </div>

      {hint || info ? (
        <p className="admin-field-hint" id={hintId}>
          {info || hint}
        </p>
      ) : null}
      {shownError ? (
        <p className="admin-field-error" id={errorId} role="alert">
          {shownError}
        </p>
      ) : null}
    </div>
  );
}
