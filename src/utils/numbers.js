/* ==========================================================================
   Number helpers
   --------------------------------------------------------------------------
   API numbers arrive as JSON numbers but form controls always hold strings.
   These helpers make the conversion explicit and never let NaN reach a
   request body.
   ========================================================================== */

export function toFiniteNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function formatNumber(value) {
  const numeric = toFiniteNumber(value);
  if (numeric === null) {
    return "—";
  }
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function parseDecimalInput(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return Number.NaN;
  }
  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric : Number.NaN;
}

export function parseIntegerInput(value) {
  const text = String(value ?? "").trim();
  if (!/^\d+$/.test(text)) {
    return Number.NaN;
  }
  const numeric = Number(text);
  return Number.isSafeInteger(numeric) ? numeric : Number.NaN;
}
