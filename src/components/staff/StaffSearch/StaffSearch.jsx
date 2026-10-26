import { SearchIcon } from "../../common/Icons/Icons";
import "./StaffSearch.css";

/** Debounced server-side search input shared by check-in and the roster. */
export default function StaffSearch({
  id,
  label,
  placeholder,
  value,
  onChange,
  hint,
  disabled = false,
}) {
  return (
    <div className="staff-search">
      <label className="staff-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="staff-search-control">
        <span className="staff-search-icon" aria-hidden="true">
          <SearchIcon size={17} />
        </span>
        <input
          id={id}
          className="staff-search-input"
          type="search"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        />
      </div>
      {hint ? <p className="staff-search-hint">{hint}</p> : null}
    </div>
  );
}
