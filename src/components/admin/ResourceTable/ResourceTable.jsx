import DataState from "../../common/DataState/DataState";
import { adminData } from "../../../data/adminData";
import "./ResourceTable.css";

/**
 * Real <table> on desktop, stacked cards below 720px. Columns are data, so
 * pages describe their own rows; this component owns nothing but structure.
 */
export default function ResourceTable({
  caption,
  columns = [],
  rows = [],
  rowKey,
  actions,
  actionsHeader = "Actions",
  emptyTitle = adminData.common.loading,
  emptyMessage,
  sticky = false,
  className = "",
}) {
  const hasActions = Boolean(actions);

  if (rows.length === 0) {
    return (
      <DataState
        status="ready"
        title={emptyTitle}
        message={emptyMessage}
        tone="dark"
        compact
      />
    );
  }

  return (
    <div className={`admin-table-wrap ${className}`.trim()}>
      <table className={`admin-table ${sticky ? "admin-table--sticky" : ""}`.trim()}>
        {caption ? <caption className="visually-hidden">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={column.headerClassName || undefined}
              >
                {column.header}
              </th>
            ))}
            {hasActions ? <th scope="col">{actionsHeader}</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey ? rowKey(row, index) : index}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  data-label={column.header}
                  className={column.cellClassName || undefined}
                >
                  {column.render
                    ? column.render(row)
                    : row?.[column.key] ?? adminData.common.dash}
                </td>
              ))}
              {hasActions ? (
                <td data-label={actionsHeader} className="admin-table-actions">
                  {actions(row)}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
