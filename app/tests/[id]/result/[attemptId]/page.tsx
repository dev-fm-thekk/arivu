import Link from "next/link";
import { notFound } from "next/navigation";
import { LinkButton } from "@/components/ui/button";
import { TestShell } from "@/components/layout/test-shell";
import { fetchAttemptResult } from "@/services/platform/actions";

type Props = {
  params: Promise<{ id: string; attemptId: string }>;
};

export default async function ResultPage({ params }: Props) {
  const { id, attemptId } = await params;
  const { attempt, answers } = await fetchAttemptResult(Number(attemptId));

  if (!attempt || attempt.test_id !== Number(id)) notFound();

  const correct = answers.filter((a) => a.is_correct).length;
  const wrong = answers.filter((a) => a.is_correct === false).length;
  const unanswered = answers.filter((a) => !a.selected_answer).length;
  const score = Math.round(Number(attempt.score));
  const passed = score >= 50;

  const started = new Date(attempt.started_at);
  const submitted = attempt.submitted_at
    ? new Date(attempt.submitted_at)
    : new Date();
  const timeTakenMin = Math.round((submitted.getTime() - started.getTime()) / 60000);

  return (
    <TestShell>
    <div className="page-container max-w-3xl">
      <div
        className={`rounded-lg p-12 text-center mb-8 ${
          passed ? "bg-signature-forest text-white" : "bg-signature-coral text-white"
        }`}
      >
        <p className="text-sm uppercase tracking-widest opacity-80 mb-2">
          {passed ? "Well done!" : "Keep practicing"}
        </p>
        <p className="text-6xl font-normal mb-2">{score}%</p>
        <p className="text-sm opacity-80">
          {attempt.tests?.title}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card-soft text-center py-6">
          <p className="text-2xl font-medium text-success">{correct}</p>
          <p className="text-xs text-muted mt-1">Correct</p>
        </div>
        <div className="card-soft text-center py-6">
          <p className="text-2xl font-medium text-error">{wrong}</p>
          <p className="text-xs text-muted mt-1">Wrong</p>
        </div>
        <div className="card-soft text-center py-6">
          <p className="text-2xl font-medium text-muted">{unanswered}</p>
          <p className="text-xs text-muted mt-1">Unanswered</p>
        </div>
      </div>

      <p className="text-sm text-body mb-8 text-center">
        Time taken: {timeTakenMin} min
        {attempt.tests?.time_limit && ` / ${attempt.tests.time_limit} min limit`}
      </p>

      <div className="flex gap-3 justify-center mb-12">
        <LinkButton href={`/tests/${id}`}>Reattempt Test</LinkButton>
        <LinkButton href="/tests" variant="secondary">
          Back to Tests
        </LinkButton>
      </div>

      <h2 className="section-title mb-6">Answer Review</h2>
      <div className="space-y-6">
        {answers.map((a, i) => {
          const q = a.questions;
          if (!q) return null;
          const isCorrect = a.is_correct;

          return (
            <div
              key={a.question_id}
              className={`card-soft border-l-4 ${
                isCorrect ? "border-l-success" : "border-l-error"
              }`}
            >
              <p className="text-xs text-muted mb-2">Question {i + 1}</p>
              <p className="text-ink mb-4">{q.question}</p>
              <div className="space-y-2 text-sm">
                <p className={isCorrect ? "text-success" : "text-error"}>
                  Your answer: {a.selected_answer ?? "Not answered"}
                </p>
                {!isCorrect && (
                  <p className="text-success">Correct answer: {q.answer}</p>
                )}
                {q.explanation && (
                  <p className="text-body mt-2 pt-2 border-t border-hairline">
                    {q.explanation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link href={`/leaderboard/${id}`} className="text-link text-sm">
          View leaderboard →
        </Link>
      </div>
    </div>
    </TestShell>
  );
}
