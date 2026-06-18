"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { Button, LinkButton } from "@/components/ui/button";

const appLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tests", label: "Tests" },
  { href: "/questions/contribute", label: "Contribute" },
  { href: "/questions/my", label: "My Questions" },
];

export function PublicNavbar() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading ...</p>;

  let LoginButton = () => {
    return (
      <div className="flex items-center gap-4">
        <Link href="/auth/login" className="text-sm font-medium text-body">
          Log In
        </Link>
        <LinkButton href="/auth/register" size="sm">
          Sign up for free
        </LinkButton>
      </div>
    );
  };

  let DashboardButton = () => {
    return (
      <Link href="/dashboard">
        <Button className="">Dashboard</Button>;
      </Link>
    );
  };

  let RightSection = () => {
    return user !== null ? <DashboardButton /> : <LoginButton />;
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-canvas border-b border-hairline h-16 flex items-center px-6 md:px-12 justify-between">
      <Link href="/" className="text-xl font-medium tracking-tight text-ink">
        arivu
      </Link>
      <RightSection />
    </nav>
  );
}

export function AppNavbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const links = isAdmin
    ? [...appLinks, { href: "/admin", label: "Admin" }]
    : appLinks;

  return (
    <nav className="sticky top-0 z-50 w-full bg-canvas border-b border-hairline h-16 flex items-center px-6 md:px-12 justify-between">
      <div className="flex items-center gap-8">
        <Link
          href="/dashboard"
          className="text-xl font-medium tracking-tight text-ink"
        >
          arivu
        </Link>
        <div className="hidden lg:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${
                pathname.startsWith(link.href)
                  ? "text-ink font-medium"
                  : "text-body"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LinkButton
          href="/tests/create"
          size="sm"
          variant="secondary"
          className="hidden sm:inline-flex"
        >
          Create Test
        </LinkButton>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg"
            aria-expanded={menuOpen}
          >
            <Avatar name={user?.user_metadata?.name ?? user?.email} size="sm" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-canvas border border-hairline rounded-md shadow-lg py-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-body"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    await signOut();
                    window.location.href = "/";
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-body"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center border border-hairline rounded-md"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {mobileNavOpen && (
        <div className="absolute top-16 left-0 right-0 bg-canvas border-b border-hairline lg:hidden z-40 py-4 px-6 flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-body py-2"
              onClick={() => setMobileNavOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export function AttemptNavbar({
  title,
  timer,
}: {
  title: string;
  timer: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-50 w-full bg-canvas border-b border-hairline h-14 flex items-center px-4 md:px-8 justify-between">
      <span className="text-sm font-medium text-ink truncate max-w-[50%]">
        {title}
      </span>
      {timer}
    </header>
  );
}
