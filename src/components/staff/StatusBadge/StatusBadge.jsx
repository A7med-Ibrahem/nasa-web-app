import "./StatusBadge.css";

import { staffData } from "../../../data/staffData";
import { statusTone } from "../../../utils/staffStatus";

/** Text badge for a request, attendance or team status. */
export default function StatusBadge({ status, fallback = staffData.common.dash }) {
  const text =
    typeof status === "string" && status.trim() ? status.trim() : fallback;
  const tone = typeof status === "string" ? statusTone(status) : "neutral";

  return (
    <span className={`staff-status staff-status--${tone}`}>{text}</span>
  );
}
