import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/src/services/auth/server-actions";
import { fetchAdminStats } from "@/src/services/platform/actions";
import { fetchCategory } from "@/src/services/categories/action";
import { Category } from "@/src/utils/type";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const [stats, { data: categories }] = await Promise.all([
    fetchAdminStats(),
    fetchCategory(),
  ]);

  return (
    <AdminClient
      stats={{
        questions: stats.questions,
        tests: stats.tests,
        users: stats.users,
        attempts: stats.attempts,
      }}
      categories={(categories ?? []) as unknown as Category[]}
      users={stats.allUsers}
      recentQuestions={stats.recentQuestions}
    />
  );
}
