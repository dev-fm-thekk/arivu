import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { TestShell } from "@/components/layout/test-shell";
import {
  fetchTestById,
  fetchLeaderboard,
  fetchUserLastAttempt,
  startAttempt,
} from "@/services/platform/actions";
import { getCurrentUserProfile } from "@/services/auth/server-actions";

type Props = {
  params: Promise<{ id: string }>;
};

async function startTestAction(testId: number) {
  "use server";
  const result = await startAttempt(testId);
  if (result.error) throw new Error(result.error);
  redirect(`/tests/${testId}/attempt?attemptId=${result.attemptId}`);
}

export default async function TestDetailPage({ params }: Props) {
  const { id } = await params;
  const testId = Number(id);
  if (Number.isNaN(testId)) notFound();

  const profile = await getCurrentUserProfile();
  const [{ test, questions }, { attempts: leaderboard }, lastAttempt] =
    await Promise.all([
      fetchTestById(testId),
      fetchLeaderboard(testId),
      profile
        ? fetchUserLastAttempt(testId, profile.id)
        : Promise.resolve(null),
    ]);

  if (!test) notFound();

  return (
    <TestShell>
    <div className="page-container max-w-4xl">
      <h1 className="text-3xl font-normal text-ink mb-4">{test.title}</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        <Badge>{questions?.length ?? 0} questions</Badge>
        <Badge>{test.time_limit} min time limit</Badge>
        <Badge variant="category">{test.total_attempts} attempts</Badge>
      </div>

      {lastAttempt && (
        <div className="card-soft mb-8 border-l-4 border-l-link">
          <p className="text-sm text-body">
            Your last score:{" "}
            <span className="font-medium text-ink">
              {Math.round(Number(lastAttempt.score))}%
            </span>
          </p>
          <div className="flex gap-3 mt-3">
            <Link
              href={`/tests/${testId}/result/${lastAttempt.id}`}
              className="text-link text-sm font-medium"
            >
              Review answers
            </Link>
          </div>
        </div>
      )}

      {profile ? (
        <form action={startTestAction.bind(null, testId)}>
          <button type="submit" className="btn-primary">
            Start Test
          </button>
        </form>
      ) : (
        <LinkButton href={`/auth/login?redirect=/tests/${testId}`}>
          Log in to Start Test
        </LinkButton>
      )}

      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-normal text-ink">Leaderboard</h2>
          <Link href={`/leaderboard/${testId}`} className="text-link text-sm">
            View full leaderboard →
          </Link>
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-sm text-muted">No attempts yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, 3).map((attempt, i) => (
              <div
                key={attempt.id}
                className="flex items-center gap-4 card-soft py-3"
              >
                <span className="text-lg font-medium text-muted w-8">
                  #{i + 1}
                </span>
                <Avatar
                  name={attempt.user?.name ?? attempt.user?.email}
                  size="sm"
                />
                <span className="flex-1 text-sm text-ink">
                  {attempt.user?.name ?? "Student"}
                </span>
                <span className="font-medium text-ink">
                  {Math.round(Number(attempt.score))}%
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
    </TestShell>
  );
}
