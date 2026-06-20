"use client";

import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { user, signInWithGoogle, signOut, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">
        {/* Left: Brand/Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-medium tracking-tight text-ink">
            arivu
          </Link>
          
          {/* Navigation Links for Logged-in Users */}
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-body hover:text-ink transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/tests" 
                className="text-sm font-medium text-body hover:text-ink transition-colors"
              >
                Tests
              </Link>
              <Link 
                href="/create-test" 
                className="text-sm font-medium text-body hover:text-ink transition-colors"
              >
                Create Test
              </Link>
            </nav>
          )}
        </div>

        {/* Right: Auth buttons / Dropdown */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-surface-strong" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-ink text-white font-semibold text-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-info-border"
              >
                {user.email?.[0].toUpperCase() || "U"}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-hairline bg-canvas py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in-5 slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-hairline">
                    <p className="text-xs text-muted truncate">Logged in as</p>
                    <p className="text-sm font-medium text-ink truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-body hover:bg-surface-soft hover:text-ink"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      if (confirm("Are you sure you want to sign out?")) {
                        signOut();
                      }
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-surface-soft"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/signin" className="text-sm font-medium text-ink hover:underline">
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center md:hidden text-ink p-1 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          )}

          {!user && !loading && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center md:hidden text-ink p-1 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-hairline bg-canvas px-6 py-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-base font-medium text-body hover:text-ink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/tests"
                  className="text-base font-medium text-body hover:text-ink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tests
                </Link>
                <Link
                  href="/create-test"
                  className="text-base font-medium text-body hover:text-ink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Test
                </Link>
                <Link
                  href="/profile"
                  className="text-base font-medium text-body hover:text-ink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (confirm("Are you sure you want to sign out?")) {
                      signOut();
                    }
                  }}
                  className="w-full text-left text-base font-medium text-error py-1"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-base font-medium text-ink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-center w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
