import { redirect } from "next/navigation";
import { fetchCategory } from "@/services/categories/action";
import { fetchQuestions } from "@/services/platform/actions";
import { TestShell } from "@/components/layout/test-shell";
import CreateTestClient from "./create-test-client";

export default async function CreateTestPage() {
  const [{ data: questions }, { data: categories }] = await Promise.all([
    fetchQuestions(),
    fetchCategory(),
  ]);

  return (
    <TestShell>
      <CreateTestClient
        questions={questions}
        categories={categories ?? []}
      />
    </TestShell>
  );
}
