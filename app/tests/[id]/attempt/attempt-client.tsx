"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AttemptNavbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import { saveAnswer, submitAttempt } from "@/services/platform/actions";

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

  const sortedQuestions = [...questions].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );
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

    router.replace(`/tests/${testId}/result/${attemptId}`);
  }, [attemptId, testId, router]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, handleSubmit]);

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
              className={`text-xs px-2 py-1 rounded-sm border ${
                flagged.has(q.id)
                  ? "bg-signature-yellow/50 border-signature-mustard"
                  : "border-hairline text-muted"
              }`}
            >
              {flagged.has(q.id) ? "Flagged" : "Flag for review"}
            </button>
          </div>
          <p className="text-lg text-ink mb-6 leading-relaxed">{q.question}</p>
          <div className="space-y-3">
            {optionEntries.map(([key, value]) => (
              <label
                key={key}
                className={`flex items-start gap-3 p-4 rounded-md border cursor-pointer ${
                  answers[q.id] === value
                    ? "border-info bg-surface-soft"
                    : "border-hairline"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === value}
                  onChange={() => selectAnswer(value)}
                  className="mt-0.5"
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
            let statusClass = "bg-surface-strong text-body";
            if (answers[qid]) statusClass = "bg-info/10 text-info border-info/30";
            if (flagged.has(qid)) statusClass = "bg-signature-yellow/50 text-ink";
            if (i === currentIndex) statusClass += " ring-2 ring-primary-ink";

            return (
              <button
                key={qid}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`w-9 h-9 rounded-sm text-xs font-medium border border-hairline ${statusClass}`}
              >
                {i + 1}
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
        description="Once submitted, you cannot change your answers."
        confirmLabel="Submit"
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitModal(false)}
        loading={submitting}
      />
    </>
  );
}
