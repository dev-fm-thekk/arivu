"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/src/components/layouts/Navbar";
import { Footer } from "@/src/components/layouts/Footer";
import { useAuth } from "@/src/hooks/useAuth";
import { createClient } from "@/src/utils/supabase/client";
import { getUserAttempts } from "@/src/services/db";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { SkeletonList } from "@/src/components/ui/SkeletonLoader";
import { useToast } from "@/src/providers/ToastProvider";

export default function AllTestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<any[]>([]);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, started, submitted, expired
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, highest, lowest

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    async function loadAttempts() {
      try {
        setLoading(true);
        const userAttempts = await getUserAttempts(supabase, user!.id);
        setAttempts(userAttempts || []);
      } catch (err: any) {
        toast("Failed to load test attempts", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAttempts();
  }, [user]);

  if (authLoading || (!user && loading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <svg className="animate-spin h-8 w-8 text-primary-ink" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!user) return null;

  // Filter & Sort attempts
  let filteredAttempts = attempts.filter((attempt) => {
    const test = attempt.test;
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || attempt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  filteredAttempts.sort((a, b) => {
    const testA = a.test;
    const testB = b.test;
    
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    
    // For sorting by score, we only compare submitted scores
    const scorePercentA = a.status === "submitted" ? (Number(a.score) / (Number(testA.total_score) || 1)) * 100 : -1;
    const scorePercentB = b.status === "submitted" ? (Number(b.score) / (Number(testB.total_score) || 1)) * 100 : -1;
    
    if (sortBy === "highest") {
      return scorePercentB - scorePercentA;
    }
    if (sortBy === "lowest") {
      return scorePercentA - scorePercentB;
    }
    return 0;
  });

  // Pagination calculation
  const totalItems = filteredAttempts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedAttempts = filteredAttempts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-canvas py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-normal text-ink tracking-tight">Your Test Attempts</h1>
              <p className="text-sm text-body mt-1">Review past scores, analytics, and answers.</p>
            </div>
            
            <Link href="/create-test" className="btn-primary text-center">
              New Test
            </Link>
          </div>

          {/* Controls bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 bg-surface-soft p-4 border border-hairline rounded-md">
            {/* Search */}
            <div className="md:col-span-6 relative">
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search attempts by title..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
            </div>

            {/* Filter Status */}
            <div className="md:col-span-3">
              <select
                className="input-field bg-canvas pr-8 appearance-none"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="started">Started</option>
                <option value="submitted">Submitted</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Sort */}
            <div className="md:col-span-3">
              <select
                className="input-field bg-canvas pr-8 appearance-none"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Score</option>
                <option value="lowest">Lowest Score</option>
              </select>
            </div>
          </div>

          {/* Results list */}
          {loading ? (
            <SkeletonList count={3} />
          ) : totalItems === 0 ? (
            <EmptyState
              title={attempts.length === 0 ? "No attempts found" : "No results match filters"}
              description={
                attempts.length === 0
                  ? "You haven't attempted any tests yet. Click New Test above to start!"
                  : "Try adjusting your search query or status filter."
              }
              actionLabel={attempts.length === 0 ? "Create Custom Test" : undefined}
              actionHref={attempts.length === 0 ? "/create-test" : undefined}
              icon={<span className="text-4xl">🔍</span>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedAttempts.map((attempt) => {
                const test = attempt.test;
                const dateObj = new Date(attempt.created_at);
                const formattedDate = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                // Score calculations
                const totalScore = Number(test.total_score) || 100;
                const rawScore = Number(attempt.score) || 0;
                const scorePercentage = Math.round((rawScore / totalScore) * 100);
                
                // Color badge based on score performance
                // green ≥ 70%, yellow 40–69%, red < 40%
                let scoreBadgeColor = "bg-error/10 text-error border-error/25";
                if (scorePercentage >= 70) {
                  scoreBadgeColor = "bg-success/10 text-success border-success-border/25";
                } else if (scorePercentage >= 40) {
                  scoreBadgeColor = "bg-signature-mustard/15 text-signature-mustard border-signature-mustard/25";
                }

                return (
                  <div key={attempt.test_id} className="card p-6 bg-canvas border border-hairline rounded-md flex flex-col justify-between shadow-xs hover:border-border-strong transition-colors">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                          attempt.status === "submitted"
                            ? "bg-success/10 text-success"
                            : attempt.status === "expired"
                            ? "bg-muted/10 text-muted"
                            : "bg-info/10 text-info"
                        }`}>
                          {attempt.status}
                        </span>
                        <span className="text-xs text-muted font-medium">
                          {formattedDate} • {formattedTime}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-ink mb-4 line-clamp-2 min-h-[56px] leading-tight">
                        {test.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-hairline mb-6">
                        <div>
                          <div className="text-[10px] text-muted font-semibold uppercase tracking-wider">Questions</div>
                          <div className="text-sm font-semibold text-ink mt-0.5">{test.total_questions} questions</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted font-semibold uppercase tracking-wider">Duration</div>
                          <div className="text-sm font-semibold text-ink mt-0.5">{test.duration} minutes</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        {attempt.status === "submitted" ? (
                          <div className={`inline-flex flex-col px-3 py-1.5 rounded border ${scoreBadgeColor}`}>
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Score</span>
                            <span className="text-sm font-bold leading-tight">
                              {rawScore} / {totalScore} ({scorePercentage}%)
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col px-3 py-1.5 rounded border border-hairline bg-surface-soft text-muted">
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Score</span>
                            <span className="text-sm font-bold leading-tight">—</span>
                          </div>
                        )}
                      </div>

                      {attempt.status === "started" ? (
                        <Link 
                          href={`/test/${attempt.test_id}/session`}
                          className="btn-primary btn-sm !py-2.5 !px-4 text-xs font-semibold rounded-lg"
                        >
                          Resume
                        </Link>
                      ) : (
                        <Link 
                          href={`/tests/${attempt.test_id}`}
                          className="btn-secondary btn-sm !py-2.5 !px-4 text-xs font-semibold rounded-lg"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="btn-secondary !px-3 !py-1.5 text-xs rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-muted font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn-secondary !px-3 !py-1.5 text-xs rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
