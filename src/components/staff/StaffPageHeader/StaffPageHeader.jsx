import "./StaffPageHeader.css";

/**
 * Page heading shared by the staff routes. The staff layout owns the area
 * title; each page states its own title and optional actions here.
 */
export default function StaffPageHeader({
  eyebrow,
  title,
  description,
  titleId = "staff-page-title",
  children,
}) {
  return (
    <header className="staff-page-header" data-reveal-item>
      <div className="staff-page-header-copy">
        {eyebrow ? <p className="eyebrow staff-page-eyebrow">{eyebrow}</p> : null}
        <h2 className="staff-page-title" id={titleId}>
          {title}
        </h2>
        {description ? (
          <p className="staff-page-description">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="staff-page-header-actions">{children}</div>
      ) : null}
    </header>
  );
}
