import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserProfile } from "@/services/auth/server-actions";
import { fetchLeaderboard } from "@/services/platform/actions";

type Props = {
  params: Promise<{ testId: string }>;
};

export default async function LeaderboardPage({ params }: Props) {
  const { testId } = await params;
  const id = Number(testId);
  if (Number.isNaN(id)) notFound();

  const [profile, { test, attempts }] = await Promise.all([
    getCurrentUserProfile(),
    fetchLeaderboard(id),
  ]);

  if (!test) notFound();

  const podium = attempts.slice(0, 3);
  const rest = attempts.slice(3);

  return (
    <div className="page-container">
      <Link href={`/tests/${id}`} className="text-link text-sm mb-4 inline-block">
        ← Back to test
      </Link>
      <h1 className="text-3xl font-normal text-ink mb-2">{test.title}</h1>
      <Badge variant="category" className="mb-12">
        {test.total_attempts} total attempts
      </Badge>

      {podium.length > 0 && (
        <div className="flex items-end justify-center gap-4 mb-16 max-w-lg mx-auto">
          {[
            { rank: 2, idx: 1, height: "h-24" },
            { rank: 1, idx: 0, height: "h-32" },
            { rank: 3, idx: 2, height: "h-20" },
          ].map(({ rank, idx, height }) => {
            const entry = podium[idx];
            if (!entry) return <div key={rank} className="w-28" />;
            return (
              <div key={rank} className="flex flex-col items-center w-28">
                <Avatar
                  name={entry.user?.name ?? entry.user?.email}
                  size="md"
                />
                <p className="text-sm font-medium text-ink mt-2 text-center line-clamp-1">
                  {entry.user?.name ?? "Student"}
                </p>
                <p className="text-xs text-muted mb-2">
                  {Math.round(Number(entry.score))}%
                </p>
                <div
                  className={`w-full ${height} rounded-t-md flex items-center justify-center text-white font-medium ${
                    rank === 1
                      ? "bg-signature-mustard"
                      : rank === 2
                        ? "bg-surface-strong text-ink"
                        : "bg-signature-peach"
                  }`}
                >
                  #{rank}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {attempts.length === 0 ? (
        <p className="text-center text-muted py-12">No attempts yet.</p>
      ) : (
        <div className="border border-hairline rounded-md overflow-hidden max-w-3xl mx-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-soft border-b border-hairline">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-ink">Rank</th>
                <th className="text-left py-3 px-4 font-medium text-ink">Name</th>
                <th className="text-left py-3 px-4 font-medium text-ink">Score</th>
                <th className="text-left py-3 px-4 font-medium text-ink">Date</th>
              </tr>
            </thead>
            <tbody>
              {[...podium, ...rest].map((attempt, i) => {
                const isCurrentUser = profile && attempt.userId === profile.id;
                return (
                  <tr
                    key={attempt.id}
                    className={`border-b border-hairline last:border-0 ${
                      isCurrentUser ? "bg-signature-cream/50" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-ink">#{i + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={attempt.user?.name ?? attempt.user?.email}
                          size="sm"
                        />
                        <span className="text-body">
                          {attempt.user?.name ?? "Student"}
                          {isCurrentUser && (
                            <span className="text-xs text-muted ml-1">(you)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-ink">
                      {Math.round(Number(attempt.score))}%
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {attempt.submitted_at
                        ? new Date(attempt.submitted_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
