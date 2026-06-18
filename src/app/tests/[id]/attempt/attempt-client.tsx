"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AttemptNavbar } from "@/src/components/layout/navbar";
import { Button } from "@/src/components/ui/button";
import { ConfirmModal } from "@/src/components/ui/modal";
import { saveAnswer, submitAttempt, fetchAttemptAnswers } from "@/src/services/platform/actions";

type QuestionData = {
  question_id: number;
  order_index: number | null;
  questions: {
    id: number;
    question: string;
    options: Record<string, string>;
  };
};

export default function AttemptTestClient({
  testTitle,
  timeLimitMinutes,
  testId,
  attemptId,
  questions,
}: {
  testTitle: string;
  timeLimitMinutes: number;
  testId: number;
  attemptId: number;
  questions: QuestionData[];
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes * 60);
  const [loading, setLoading] = useState(true);

  const sortedQuestions = [...questions].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  // Load existing progress
  useEffect(() => {
    const loadProgress = async () => {
      const { data } = await fetchAttemptAnswers(attemptId);
      const initialAnswers: Record<number, string> = {};
      data.forEach((row) => {
        if (row.selected_answer) {
          initialAnswers[row.question_id] = row.selected_answer;
        }
      });
      setAnswers(initialAnswers);

      // Load flags from localStorage
      const savedFlags = localStorage.getItem(`test_flags_${attemptId}`);
      if (savedFlags) {
        try {
          const parsed = JSON.parse(savedFlags);
          if (Array.isArray(parsed)) {
            setFlagged(new Set(parsed));
          }
        } catch (e) {
          console.error("Error loading flags from localStorage", e);
        }
      }
      setLoading(false);
    };
    loadProgress();
  }, [attemptId]);

  // Persist flags to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(`test_flags_${attemptId}`, JSON.stringify([...flagged]));
    }
  }, [flagged, attemptId, loading]);

  const current = sortedQuestions[currentIndex];
  const q = current?.questions;

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    const result = await submitAttempt(attemptId);
    setSubmitting(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    // Clear flags on submission
    localStorage.removeItem(`test_flags_${attemptId}`);
    router.replace(`/tests/${testId}/result/${attemptId}`);
  }, [attemptId, testId, router]);

  useEffect(() => {
    if (secondsLeft <= 0 && !loading) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, handleSubmit, loading]);

  useEffect(() => {
    history.pushState(null, "", location.href);
    const onPopState = () => history.pushState(null, "", location.href);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const selectAnswer = async (value: string) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    await saveAnswer(attemptId, q.id, value);
  };

  const toggleFlag = () => {
    if (!q) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) next.delete(q.id);
      else next.add(q.id);
      return next;
    });
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timerUrgent = secondsLeft < 120;

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted animate-pulse">Loading progress...</p>
    </div>
  );

  if (!q) return null;

  const optionEntries = Object.entries(q.options ?? {}).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <>
      <AttemptNavbar
        title={testTitle}
        timer={
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted">
              {currentIndex + 1}/{sortedQuestions.length}
            </span>
            <span
              className={`font-mono text-sm font-medium tabular-nums ${
                timerUrgent ? "text-error" : "text-ink"
              }`}
            >
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
          </div>
        }
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card-soft mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-muted">
              Question {currentIndex + 1}
            </span>
            <button
              type="button"
              onClick={toggleFlag}
              className={`text-xs px-2 py-1 rounded-sm border transition-colors ${
                flagged.has(q.id)
                  ? "bg-signature-yellow text-ink border-signature-mustard font-medium"
                  : "border-hairline text-muted hover:border-border-strong"
              }`}
            >
              {flagged.has(q.id) ? "Flagged for review" : "Mark for review"}
            </button>
          </div>
          <p className="text-lg text-ink mb-6 leading-relaxed">{q.question}</p>
          <div className="space-y-3">
            {optionEntries.map(([key, value]) => (
              <label
                key={key}
                className={`flex items-start gap-3 p-4 rounded-md border cursor-pointer transition-all ${
                  answers[q.id] === value
                    ? "border-info bg-surface-soft ring-1 ring-info"
                    : "border-hairline hover:border-info/50"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === value}
                  onChange={() => selectAnswer(value)}
                  className="mt-0.5 accent-info"
                />
                <span className="text-sm">
                  <span className="font-medium text-ink mr-2">{key}.</span>
                  {value}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {sortedQuestions.map((sq, i) => {
            const qid = sq.questions.id;
            const isAnswered = !!answers[qid];
            const isFlagged = flagged.has(qid);
            const isCurrent = i === currentIndex;

            let statusClass = "bg-surface-strong text-body border-hairline";
            
            if (isAnswered) {
              statusClass = "bg-info/10 text-info border-info/40";
            }
            
            if (isFlagged) {
              statusClass = "bg-signature-yellow text-ink border-signature-mustard shadow-sm";
              if (isAnswered) {
                // If both answered and flagged, show yellow but maybe with a dot or different border
                statusClass = "bg-signature-yellow text-ink border-signature-mustard ring-2 ring-inset ring-info/30";
              }
            }

            if (isCurrent) {
              statusClass += " ring-2 ring-primary-ink ring-offset-2";
            }

            return (
              <button
                key={qid}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`w-9 h-9 rounded-sm text-xs font-medium border transition-all relative ${statusClass}`}
                title={`${isAnswered ? 'Answered' : 'Unanswered'}${isFlagged ? ', Marked for review' : ''}`}
              >
                {i + 1}
                {isFlagged && isAnswered && (
                   <span className="absolute top-0 right-0 w-2 h-2 bg-info rounded-full -mt-1 -mr-1 border border-canvas" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            Previous
          </Button>
          {currentIndex < sortedQuestions.length - 1 ? (
            <Button size="sm" onClick={() => setCurrentIndex((i) => i + 1)}>
              Next
            </Button>
          ) : (
            <Button size="sm" onClick={() => setShowSubmitModal(true)}>
              Submit Test
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showSubmitModal}
        title="Submit test?"
        description={`Once submitted, you cannot change your answers. ${flagged.size > 0 ? `Note: You still have ${flagged.size} question(s) marked for review.` : ''}`}
        confirmLabel="Submit"
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitModal(false)}
        loading={submitting}
      />
    </>
  );
}
