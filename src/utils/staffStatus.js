/* ==========================================================================
   Staff status normalisation
   --------------------------------------------------------------------------
   The live API returns request statuses with its own casing ("In progress")
   even though the canonical UI values are "In Progress", "Resolved" and
   "Rejected". Comparisons here are case-insensitive so a row never offers the
   action that matches its current state.
   ========================================================================== */

export function canonicalRequestStatus(value) {
  const text = String(value ?? "").trim().toLowerCase();
  if (text === "pending") {
    return "Pending";
  }
  if (text === "in progress" || text === "in-progress") {
    return "In Progress";
  }
  if (text === "resolved" || text === "done") {
    return "Resolved";
  }
  if (text === "rejected" || text === "cancelled" || text === "canceled") {
    return "Rejected";
  }
  return "";
}

export function sameStatus(a, b) {
  return canonicalRequestStatus(a) === canonicalRequestStatus(b);
}

/** Canonical attendance value, or "" for a student who is not marked yet. */
export function canonicalAttendanceStatus(value) {
  const text = String(value ?? "").trim().toLowerCase();
  if (text === "present") {
    return "Present";
  }
  if (text === "late") {
    return "Late";
  }
  if (text === "absent") {
    return "Absent";
  }
  return "";
}

/** Visual tone shared by StatusBadge. */
export function statusTone(value) {
  const text = String(value ?? "").trim().toLowerCase();

  if (text === "in progress" || text === "in-progress") {
    return "progress";
  }
  if (text === "pending") {
    return "pending";
  }
  if (text === "resolved" || text === "done") {
    return "resolved";
  }
  if (text === "rejected" || text === "cancelled" || text === "canceled") {
    return "rejected";
  }
  if (text === "present") {
    return "present";
  }
  if (text === "late") {
    return "late";
  }
  if (text === "absent") {
    return "absent";
  }
  if (text === "active") {
    return "active";
  }
  return "neutral";
}
