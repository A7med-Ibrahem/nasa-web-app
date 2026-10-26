import "./StatusPill.css";

/**
 * Small state label used by the criteria, publishing and question tables.
 * The tone only changes colour; the text always comes from page copy.
 */
export default function StatusPill({ tone = "neutral", children }) {
  return (
    <span className={`admin-status-pill admin-status-pill--${tone}`}>
      {children}
    </span>
  );
}
