/* ==========================================================================
   Date helpers for the staff area
   --------------------------------------------------------------------------
   Two different kinds of value are formatted differently:

   - `eventDate` is a calendar date serialised by the backend as UTC midnight
     ("2026-10-04T00:00:00Z"), so it must be formatted with timeZone: "UTC" or
     a viewer west of UTC can see the previous day.
   - `createdAt`, `timestamp` and `resolvedAt` are real instants, so they are
     formatted in the viewer's local time.
   ========================================================================== */

const dash = "—";

function toDate(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Today's calendar date from local parts, as YYYY-MM-DD (never toISOString). */
export function todayLocalDate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Calendar date in UTC, e.g. "Oct 4, 2026". */
export function formatEventDate(value) {
  const date = toDate(value);
  if (!date) {
    return typeof value === "string" && value.trim() ? value : dash;
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return String(value);
  }
}

/** Real instant in the viewer's local time, e.g. "Oct 4, 2026, 3:12 PM". */
export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) {
    return typeof value === "string" && value.trim() ? value : dash;
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return String(value);
  }
}
