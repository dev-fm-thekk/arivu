import { Suspense } from "react";
import { fetchTests } from "@/services/platform/actions";
import { TestShell } from "@/components/layout/test-shell";
import BrowseTestsClient from "./browse-tests-client";

type Props = {
  searchParams: Promise<{ q?: string; sort?: string }>;
};

export default async function TestsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { data: tests } = await fetchTests({
    search: params.q,
    sort: params.sort === "popular" ? "popular" : "newest",
  });

  return (
    <TestShell>
      <Suspense fallback={<div className="page-container">Loading…</div>}>
        <BrowseTestsClient tests={tests} />
      </Suspense>
    </TestShell>
  );
}
