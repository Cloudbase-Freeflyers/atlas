"use client";

/** Shown when a report has no API data – keeps layout, values show as —. */
export default function ReportsConnectMessage({ title, description }) {
  return (
    <div className="card reports-connect-message" role="status">
      <div className="card-inner">
        <p className="reports-connect-title">{title}</p>
        {description && <p className="reports-muted">{description}</p>}
      </div>
    </div>
  );
}
