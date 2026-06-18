import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/services/auth/server-actions";
import { fetchQuestions } from "@/services/platform/actions";
import MyQuestionsClient from "./my-questions-client";

export default async function MyQuestionsPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/auth/login");

  const { data: questions } = await fetchQuestions({
    contributorId: profile.id,
  });

  return <MyQuestionsClient questions={questions} />;
}
