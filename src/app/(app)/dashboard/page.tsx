import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/src/components/ui/avatar";
import { LinkButton } from "@/src/components/ui/button";
import { PageHeader } from "@/src/components/layout/footer";
import { getCurrentUserProfile } from "@/src/services/auth/server-actions";
import { fetchDashboardStats } from "@/src/services/platform/actions";
import { Badge } from "@/src/components/ui/badge";

export default async function DashboardPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/auth/login");

  const stats = await fetchDashboardStats(profile.id);

  return (
    <div className="page-container">
      <div className="card-soft mb-8 flex items-center gap-4">
        <Avatar name={profile.name} size="lg" />
        <div>
          <h1 className="text-2xl font-normal text-ink">
            Welcome back, {profile.name ?? "Student"}
          </h1>
          <p className="text-sm text-body mt-1">
            Ready to practice or contribute today?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Questions Contributed", value: stats.contributed },
          { label: "Tests Taken", value: stats.testsTaken },
          { label: "Average Score", value: `${stats.avgScore}%` },
        ].map((stat) => (
          <div key={stat.label} className="card-soft text-center py-8">
            <p className="text-3xl font-medium text-ink">{stat.value}</p>
            <p className="text-xs uppercase tracking-widest text-muted mt-2">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        <LinkButton href="/questions/contribute">Contribute Question</LinkButton>
        <LinkButton href="/tests" variant="secondary">
          Browse Tests
        </LinkButton>
        <LinkButton href="/tests/create" variant="secondary">
          Create Test
        </LinkButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <PageHeader title="Recent Attempts" />
          {stats.recentAttempts.length === 0 ? (
            <p className="text-sm text-muted">No attempts yet. Take your first test!</p>
          ) : (
            <div className="border border-hairline rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-soft border-b border-hairline">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-ink">Test</th>
                    <th className="text-left py-3 px-4 font-medium text-ink">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-ink">Date</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAttempts.map((attempt) => (
                    <tr key={attempt.id} className="border-b border-hairline last:border-0">
                      <td className="py-3 px-4 text-body">
                        {attempt.tests?.title ?? "Test"}
                      </td>
                      <td className="py-3 px-4 font-medium text-ink">
                        {Math.round(Number(attempt.score))}%
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {attempt.submitted_at
                          ? new Date(attempt.submitted_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/tests/${attempt.test_id}/result/${attempt.id}`}
                          className="text-link text-xs font-medium"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <PageHeader title="Trending Tests" />
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stats.trendingTests.map((test) => (
              <Link
                key={test.id}
                href={`/tests/${test.id}`}
                className="card-soft min-w-[220px] shrink-0"
              >
                <h3 className="font-medium text-ink mb-2 line-clamp-2">{test.title}</h3>
                <Badge variant="category">{test.total_attempts} attempts</Badge>
              </Link>
            ))}
            {stats.trendingTests.length === 0 && (
              <p className="text-sm text-muted">No tests available yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
