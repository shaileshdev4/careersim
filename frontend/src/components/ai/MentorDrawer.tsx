"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Beat, Career, CareerMentor, Choice } from "@careersim/engine";
import { Theme } from "../theme";
import { StreamingText } from "../StreamingText";
import { LiveDot } from "./LiveDot";

type ExchangeStatus = "pending" | "streaming" | "done" | "error";

type Exchange = {
  id: string;
  q: string;
  a?: string;
  status: ExchangeStatus;
  live?: boolean;
};

const NEUTRAL_TEMPO = 0.45;

export function MentorDrawer({
  open,
  onClose,
  career,
  beat,
  committed,
  mentor,
  theme,
  questionsLeft,
  onAsked,
  recentTranscript,
}: {
  open: boolean;
  onClose: () => void;
  career: Career;
  beat: Beat;
  committed: Choice;
  mentor: CareerMentor;
  theme: Theme;
  questionsLeft: number;
  onAsked: (success: boolean) => void;
  recentTranscript: string;
}) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Exchange[]>([]);
  const [busy, setBusy] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const suggested = mentor.suggestedQuestions ?? [
    "What would you do?",
    "Why does this matter?",
    "Is this normal?",
  ];

  const busyMsg = `${mentor.name} is tied up - try again in a sec.`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history]);

  const ask = useCallback(
    async (q: string) => {
      if (!q.trim() || busy || questionsLeft <= 0) return;

      const userQ = q.trim();
      const id = `m-${Date.now()}`;

      setQuestion("");
      setBusy(true);
      setHistory((h) => [...h, { id, q: userQ, status: "pending" }]);

      try {
        const res = await fetch("/api/mentor", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            careerId: career.id,
            beatId: beat.id,
            scene: beat.scene,
            choiceLabel: committed.label,
            consequence: committed.consequence,
            recentTranscript,
            userQuestion: userQ,
          }),
        });
        const data = await res.json();

        if (data.ok && data.reply) {
          setHistory((h) =>
            h.map((ex) =>
              ex.id === id
                ? {
                    ...ex,
                    status: "streaming",
                    a: data.reply,
                    live: true,
                  }
                : ex,
            ),
          );
          onAsked(true);
        } else {
          setHistory((h) =>
            h.map((ex) =>
              ex.id === id
                ? {
                    ...ex,
                    status: "error",
                    a: data.reply || busyMsg,
                  }
                : ex,
            ),
          );
          onAsked(false);
        }
      } catch {
        setHistory((h) =>
          h.map((ex) =>
            ex.id === id ? { ...ex, status: "error", a: busyMsg } : ex,
          ),
        );
        onAsked(false);
      } finally {
        setBusy(false);
      }
    },
    [
      beat,
      busy,
      busyMsg,
      career.id,
      committed,
      onAsked,
      questionsLeft,
      recentTranscript,
    ],
  );

  const finishStreaming = useCallback((id: string) => {
    setHistory((h) =>
      h.map((ex) => (ex.id === id ? { ...ex, status: "done" } : ex)),
    );
  }, []);

  if (!open) return null;

  const initials = mentor.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const streamTheme = { ...theme, tempo: NEUTRAL_TEMPO };

  return (
    <>
      <button
        type="button"
        className="mentor-scrim"
        aria-label="Close mentor panel"
        onClick={onClose}
      />
      <aside className="mentor-drawer ai-surface" aria-label="Talk to a senior">
        <button
          type="button"
          className="mentor-drawer__close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="mentor-card">
          <div
            className="mentor-card__avatar"
            style={{
              background: theme.accentSoft,
              color: theme.accent,
              borderColor: theme.edge,
            }}
          >
            {initials}
          </div>
          <div>
            <div className="display" style={{ fontSize: 16 }}>
              {mentor.name}
            </div>
            <div
              className="eyebrow faint"
              style={{ fontSize: 11, marginTop: 2 }}
            >
              {mentor.role}
            </div>
            <p
              className="dim"
              style={{ fontSize: 12, marginTop: 8, lineHeight: 1.45 }}
            >
              {mentor.now}
            </p>
          </div>
        </div>

        <div className="mentor-thread" ref={threadRef}>
          {history.length === 0 && (
            <p className="mentor-thread__hint dim">
              Ask about what just happened - {questionsLeft} question
              {questionsLeft === 1 ? "" : "s"} left today.
            </p>
          )}

          {history.map((ex) => (
            <div key={ex.id} className="mentor-thread__exchange mentor-msg-in">
              <p className="mentor-thread__q">{ex.q}</p>

              {ex.status === "pending" && (
                <div
                  className="mentor-thread__a mentor-thread__a--pending"
                  style={{ borderLeftColor: theme.accent }}
                >
                  <MentorTyping accent={theme.accent} />
                </div>
              )}

              {(ex.status === "streaming" ||
                ex.status === "done" ||
                ex.status === "error") &&
                ex.a && (
                  <p
                    className={`mentor-thread__a${ex.status === "error" ? " mentor-thread__a--error" : ""}`}
                    style={{ borderLeftColor: theme.accent }}
                  >
                    {ex.status === "streaming" ? (
                      <StreamingText
                        text={ex.a}
                        streamKey={`mentor:${ex.id}`}
                        theme={streamTheme}
                        onComplete={() => finishStreaming(ex.id)}
                      />
                    ) : (
                      ex.a
                    )}
                    {ex.live && ex.status === "done" && (
                      <span className="mentor-thread__live">
                        <LiveDot accent={theme.accent} />
                      </span>
                    )}
                  </p>
                )}
            </div>
          ))}
          <div ref={threadEndRef} aria-hidden />
        </div>

        {history.length === 0 && (
          <div className="mentor-suggestions">
            {suggested.map((s) => (
              <button
                key={s}
                type="button"
                className="choice-btn mentor-chip"
                disabled={busy || questionsLeft <= 0}
                onClick={() => void ask(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="mentor-footer">
          <div className="mentor-footer__meta">
            <span className="mentor-footer__count">
              {questionsLeft} left today
            </span>
            {busy && (
              <span className="mentor-footer__waiting eyebrow faint">
                waiting…
              </span>
            )}
          </div>
          <form
            className="mentor-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(question);
            }}
          >
            <input
              className="mentor-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                questionsLeft > 0 ? "Ask something…" : "No questions left today"
              }
              disabled={busy || questionsLeft <= 0}
              autoFocus
            />
            <button
              type="submit"
              className={`choice-btn mentor-send${busy ? " mentor-send--busy" : ""}`}
              disabled={busy || questionsLeft <= 0 || !question.trim()}
              aria-busy={busy}
            >
              {busy ? (
                <span
                  className="mentor-send__spinner"
                  style={{ borderColor: theme.accent }}
                />
              ) : (
                "Send"
              )}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

function MentorTyping({ accent }: { accent: string }) {
  return (
    <span className="mentor-typing" aria-label="Waiting for reply">
      <span className="mentor-typing__dots">
        <span style={{ background: accent }} />
        <span style={{ background: accent }} />
        <span style={{ background: accent }} />
      </span>
    </span>
  );
}
