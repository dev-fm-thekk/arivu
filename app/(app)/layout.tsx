import { AppNavbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getCurrentUserProfile } from "@/services/auth/server-actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUserProfile();
  const isAdmin = profile?.role === "admin";

  return (
    <div className="flex flex-col min-h-screen">
      <AppNavbar isAdmin={isAdmin} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
