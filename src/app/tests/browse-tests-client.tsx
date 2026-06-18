"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/src/components/layout/footer";
import { LinkButton } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Test } from "@/src/utils/type";

export default function BrowseTestsClient({ tests }: { tests: Test[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/tests?${params.toString()}`);
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Browse Tests"
        description="Discover mock tests created by your peers."
        action={
          <LinkButton href="/tests/create" size="sm">
            Create Test
          </LinkButton>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="search"
          placeholder="Search by title…"
          defaultValue={search}
          onChange={(e) => updateParams("q", e.target.value)}
          className="input-field flex-1"
        />
        <select
          value={sort}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Attempted</option>
        </select>
      </div>

      {tests.length === 0 ? (
        <EmptyState
          title="No tests found"
          description="Try adjusting your search or create the first test."
          actionLabel="Create a test"
          actionHref="/tests/create"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div key={test.id} className="card-soft flex flex-col">
              <h3 className="text-lg font-medium text-ink mb-3 line-clamp-2">
                {test.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="category">{test.total_attempts} attempts</Badge>
                <Badge>{test.time_limit} min</Badge>
              </div>
              <Link
                href={`/tests/${test.id}`}
                className="btn-primary btn-sm mt-auto text-center"
              >
                View Test
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
