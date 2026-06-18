import { TestShell } from "@/src/components/layout/test-shell";

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TestShell>{children}</TestShell>;
}
