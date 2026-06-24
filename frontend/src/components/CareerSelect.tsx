"use client";

import { Career, ArcProgress } from "@careersim/engine";
import { CAREER_LIST, hasArc } from "@careersim/engine";
import { themeFor } from "./theme";
import { formatClock } from "@careersim/engine";
import { SavedRunsPreview } from "./SavedRuns";
import { LogoMark } from "./Logo";
import { careerAmbientUrl } from "./careerAmbient";

export function CareerSelect({
  arcs,
  onPick,
  onContinue,
  onViewRuns,
  onHowItWorks,
  runsRefreshKey,
}: {
  arcs: Record<string, ArcProgress>;
  onPick: (c: Career, opts?: { freshArc?: boolean }) => void;
  onContinue: (c: Career) => void;
  onViewRuns: () => void;
  onHowItWorks?: () => void;
  runsRefreshKey?: number;
}) {
  const inProgressCount = CAREER_LIST.filter((c) => {
    const arc = arcs[c.id];
    return arc && hasArc(c.id) && !arc.complete && arc.completedDays.length > 0;
  }).length;

  return (
    <div className="landing">
      <section className="landing-hero scene-in">
        <div className="landing-hero__copy">
          <div className="landing-hero__kicker faint">
            <LogoMark size={16} />
            career day simulator
          </div>
          <h1 className="display landing-hero__title">
            Don&apos;t read about a career. Live a day of it.
          </h1>
          <p className="dim landing-hero__lede">
            Eight careers - each a 3-day arc - grounded in how they actually
            feel. Make the calls. See what the week costs you.
          </p>
          {onHowItWorks && (
            <div className="landing-hero__actions">
              <button
                type="button"
                className="landing-cta"
                onClick={onHowItWorks}
              >
                How it works
              </button>
            </div>
          )}
        </div>
        <aside className="landing-hero__stats" aria-label="At a glance">
          <div className="landing-stat">
            <span className="landing-stat__value">8</span>
            <span className="landing-stat__label faint">careers</span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat__value">3</span>
            <span className="landing-stat__label faint">days per arc</span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat__value">0</span>
            <span className="landing-stat__label faint">
              scores - just reflection
            </span>
          </div>
          {inProgressCount > 0 && (
            <div className="landing-stat landing-stat--accent">
              <span className="landing-stat__value">{inProgressCount}</span>
              <span className="landing-stat__label faint">in progress</span>
            </div>
          )}
        </aside>
      </section>

      <section className="landing-section" aria-labelledby="careers-heading">
        <div className="landing-section__head">
          <h2 id="careers-heading" className="display landing-section__title">
            Pick a career
          </h2>
          <p className="faint landing-section__sub">
            Every tile is a full week in someone&apos;s shoes.
          </p>
        </div>
        <div className="career-grid">
          {CAREER_LIST.map((c) => (
            <CareerTile
              key={c.id}
              career={c}
              arc={arcs[c.id]}
              onPick={onPick}
              onContinue={onContinue}
            />
          ))}
        </div>
      </section>

      <SavedRunsPreview onViewAll={onViewRuns} refreshKey={runsRefreshKey} />
    </div>
  );
}

function CareerTile({
  career,
  arc,
  onPick,
  onContinue,
}: {
  career: Career;
  arc?: ArcProgress;
  onPick: (c: Career, opts?: { freshArc?: boolean }) => void;
  onContinue: (c: Career) => void;
}) {
  const t = themeFor(career);
  const photo = careerAmbientUrl(career.id);
  const inProgress =
    arc && hasArc(career.id) && !arc.complete && arc.completedDays.length > 0;
  const arcCareer = hasArc(career.id);

  return (
    <button
      type="button"
      onClick={() => (inProgress ? onContinue(career) : onPick(career))}
      className={`career-tile${photo ? " career-tile--photo" : ""}`}
      style={{
        // @ts-expect-error custom props
        "--bg": t.bg,
        "--glow": t.glow,
        "--accent": t.accent,
        "--edge": t.edge,
        "--tile-photo": photo ? `url(${photo})` : "none",
      }}
    >
      {photo && (
        <>
          <span className="career-tile__photo" aria-hidden />
          <span className="career-tile__veil" aria-hidden />
        </>
      )}
      <span className="career-tile__content">
        <span className="career-tile__top">
          <span className="display career-tile__name">{career.title}</span>
          <span className="career-tile__tags">
            <span className="career-tile__tag">{t.texture}</span>
            {arcCareer && (
              <span className="career-tile__tag career-tile__tag--arc">
                3-day arc
              </span>
            )}
          </span>
        </span>
        <span className="career-tile__line">{career.realityLine}</span>
        <span className="career-tile__foot eyebrow faint">
          <span
            className="career-tile__dot pulse-dot"
            style={{ background: t.accent }}
            aria-hidden
          />
          {formatClock(career.dayStart)} – {formatClock(career.dayEndApprox)}
          {inProgress && (
            <span className="career-tile__continue">
              · continue day {arc!.currentDay}
            </span>
          )}
          {arc?.complete && <span> · arc complete</span>}
        </span>
        {inProgress && (
          <span
            role="button"
            tabIndex={0}
            className="career-tile__fresh eyebrow faint"
            onClick={(e) => {
              e.stopPropagation();
              onPick(career, { freshArc: true });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onPick(career, { freshArc: true });
              }
            }}
          >
            start fresh instead
          </span>
        )}
      </span>
    </button>
  );
}
