import "./CheckInTeamCard.css";

import { staffData } from "../../../data/staffData";
import { canonicalAttendanceStatus } from "../../../utils/staffStatus";
import StatusBadge from "../StatusBadge/StatusBadge";

/**
 * One team in the check-in list.
 *
 * Presentational only: the page owns the saved and draft status maps, the save
 * request and all error text. A radio group is used for the three statuses so
 * each group gets native keyboard arrow behaviour; the saved value is always
 * shown separately, even while the draft differs from it.
 */
export default function CheckInTeamCard({
  team,
  draftStatuses,
  savedStatuses,
  onChange,
  disabled = false,
}) {
  const copy = staffData.checkIn;
  const students = Array.isArray(team?.students) ? team.students : [];
  const teamName =
    team?.teamName || team?.name || copy.teamFallback(team?.teamId);

  return (
    <li className="staff-checkin-team">
      <div className="staff-checkin-team-head">
        <div className="staff-checkin-team-identity">
          <h3 className="staff-checkin-team-name">{teamName}</h3>
          <p className="staff-checkin-team-meta">
            {team?.username ? <span>@{team.username}</span> : null}
            <span>{copy.studentsCount(students.length)}</span>
          </p>
        </div>
        <StatusBadge status={team?.status} />
      </div>

      {students.length === 0 ? (
        <p className="staff-checkin-empty">{copy.states.noStudents}</p>
      ) : (
        <ul className="staff-checkin-students">
          {students.map((student) => {
            const studentId = student?.studentId;
            const saved = savedStatuses?.[studentId] ?? null;
            const draft = draftStatuses?.[studentId] ?? "";
            const savedValue = canonicalAttendanceStatus(saved);
            const draftValue = canonicalAttendanceStatus(draft);
            const isDirty = draftValue !== savedValue;
            const studentName = student?.name?.trim() || copy.studentFallback;
            const groupName = `attendance-${team?.teamId ?? "team"}-${
              studentId ?? "student"
            }`;
            const labelId = `attendance-label-${team?.teamId ?? "team"}-${
              studentId ?? "student"
            }`;

            return (
              <li className="staff-checkin-student" key={studentId}>
                <div className="staff-checkin-student-head">
                  <span
                    className="staff-checkin-student-name"
                    id={labelId}
                  >
                    {studentName}
                  </span>
                  <span className="staff-checkin-student-state">
                    <StatusBadge
                      status={saved}
                      fallback={staffData.common.unmarked}
                    />
                    {isDirty ? (
                      <span className="staff-checkin-dirty">
                        {copy.dirtyMark}
                      </span>
                    ) : null}
                  </span>
                </div>

                <div
                  className="staff-checkin-options"
                  role="radiogroup"
                  aria-labelledby={labelId}
                  aria-label={`${copy.statusLabel} ${studentName}`}
                >
                  {copy.statuses.map((option) => (
                    <label
                      className={`staff-checkin-option${
                        draftValue === option ? " is-selected" : ""
                      }`}
                      key={option}
                    >
                      <input
                        type="radio"
                        name={groupName}
                        value={option}
                        checked={draftValue === option}
                        onChange={() => onChange(studentId, option)}
                        disabled={disabled}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
