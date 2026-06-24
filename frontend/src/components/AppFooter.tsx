"use client";

import { LogoMark } from "./Logo";

export function AppFooter({ onHowItWorks }: { onHowItWorks?: () => void }) {
  return (
    <footer className="app-footer">
      <div className="app-footer__brand">
        <LogoMark size={18} />
        <span className="app-footer__name">A Day In</span>
      </div>
      <p className="app-footer__tagline faint">
        Eight grounded 3-day arcs. No grades - just what the week felt like.
      </p>
      <p className="app-footer__meta faint">
        Choices compound. Energy drains. Compare two days side by side.
        {onHowItWorks && (
          <>
            {" "}
            <button
              type="button"
              className="app-footer__link"
              onClick={onHowItWorks}
            >
              How it works
            </button>
          </>
        )}
      </p>
    </footer>
  );
}
