import { notFound, redirect } from "next/navigation";
import { fetchTestById } from "@/services/platform/actions";
import AttemptTestClient from "./attempt-client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
};

export default async function AttemptPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { attemptId: attemptIdStr } = await searchParams;
  const testId = Number(id);
  const attemptId = Number(attemptIdStr);

  if (Number.isNaN(testId) || Number.isNaN(attemptId)) {
    redirect(`/tests/${id}`);
  }

  const { test, questions } = await fetchTestById(testId);
  if (!test || !questions?.length) notFound();

  return (
    <AttemptTestClient
      testTitle={test.title}
      timeLimitMinutes={test.time_limit}
      testId={testId}
      attemptId={attemptId}
      questions={questions as unknown as Parameters<typeof AttemptTestClient>[0]["questions"]}
    />
  );
}
