import "./AttendanceTable.css";

import { staffData } from "../../../data/staffData";
import { formatDateTime, formatEventDate } from "../../../utils/dates";
import StatusBadge from "../StatusBadge/StatusBadge";

/**
 * Attendance records as a table on wide screens and as cards on narrow ones.
 *
 * Both presentations are rendered from the same normalised rows; CSS decides
 * which one is visible, so no data is duplicated in the page. The table is
 * wrapped in a labelled, focusable scroll region for keyboard users.
 */
export default function AttendanceTable({ rows }) {
  const copy = staffData.attendance;
  const dash = staffData.common.dash;

  return (
    <>
      <div
        className="staff-attendance-table-wrap"
        role="region"
        aria-label={copy.table.regionLabel}
        tabIndex={0}
      >
        <table className="staff-attendance-table">
          <caption className="visually-hidden">{copy.table.caption}</caption>
          <thead>
            <tr>
              <th scope="col">{copy.table.student}</th>
              <th scope="col">{copy.table.team}</th>
              <th scope="col">{copy.table.date}</th>
              <th scope="col">{copy.table.status}</th>
              <th scope="col">{copy.table.markedBy}</th>
              <th scope="col">{copy.table.timestamp}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th scope="row">
                  {row.studentName || copy.studentFallback}
                </th>
                <td>{row.teamName}</td>
                <td>{formatEventDate(row.eventDate)}</td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
                <td>{row.markedBy || dash}</td>
                <td>{formatDateTime(row.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="staff-attendance-cards" aria-label={copy.cardsLabel}>
        {rows.map((row) => (
          <li className="staff-attendance-card" key={row.key}>
            <div className="staff-attendance-card-head">
              <div>
                <p className="staff-attendance-card-name">
                  {row.studentName || copy.studentFallback}
                </p>
                <p className="staff-attendance-card-team">{row.teamName}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <dl className="staff-attendance-card-facts">
              <div>
                <dt>{copy.table.date}</dt>
                <dd>{formatEventDate(row.eventDate)}</dd>
              </div>
              <div>
                <dt>{copy.table.markedBy}</dt>
                <dd>{row.markedBy || dash}</dd>
              </div>
              <div>
                <dt>{copy.table.timestamp}</dt>
                <dd>{formatDateTime(row.timestamp)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
