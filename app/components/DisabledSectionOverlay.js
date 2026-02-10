"use client";

/**
 * When API data is unavailable, shows only this message (no static/sample data).
 * When `title` is set, only the overlay and message are shown; children are not rendered.
 */
export default function DisabledSectionOverlay({ title, description, children }) {
  const showOverlay = Boolean(title);
  return (
    <div className={showOverlay ? "disabled-section-wrap" : undefined}>
      {showOverlay ? <div className="disabled-section-spacer" aria-hidden /> : children}
      {showOverlay && (
        <div className="disabled-section-overlay" role="status" aria-live="polite">
          <div className="disabled-section-content">
            <div className="disabled-section-icon" aria-hidden>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p className="disabled-section-title">{title}</p>
            {description && <p className="disabled-section-desc">{description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
