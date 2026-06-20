"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/src/components/layouts/Navbar";
import { Footer } from "@/src/components/layouts/Footer";
import { useAuth } from "@/src/hooks/useAuth";
import { createClient } from "@/src/utils/supabase/client";
import { getUserAttempts, getCategories, getSubCategories } from "@/src/services/db";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { LineChart, CategoryBreakdown } from "@/src/components/ui/Charts";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { SkeletonGrid, SkeletonCard } from "@/src/components/ui/SkeletonLoader";
import { useToast } from "@/src/providers/ToastProvider";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({}); // maps subcat_id -> cat_name
  
  // Sidebar tab state (just for visual selection, Overview is active)
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        setLoading(true);
        // Load categories and subcategories to build category lookup map
        const cats = await getCategories(supabase);
        const subCats = await getSubCategories(supabase);
        
        const subToCat: Record<string, string> = {};
        subCats.forEach((sub) => {
          const cat = cats.find((c) => c.id === sub.category_id);
          if (cat) {
            subToCat[sub.id] = cat.name;
          }
        });
        setCategoriesMap(subToCat);

        // Load attempts
        const userAttempts = await getUserAttempts(supabase, user!.id);
        setAttempts(userAttempts || []);
      } catch (err: any) {
        toast("Failed to load dashboard data", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
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

  // Process stats
  const totalAttempts = attempts.length;
  const submittedAttempts = attempts.filter((a) => a.status === "submitted");
  const totalQuestionsAnswered = attempts.reduce(
    (sum, a) => sum + Object.keys(a.answers || {}).length,
    0
  );

  // Compute percentages for submitted tests
  let totalPercent = 0;
  let bestPercent = 0;
  let averagePercent = 0;

  const chartData = [...submittedAttempts]
    .reverse() // Chronological order
    .map((attempt, index) => {
      const test = attempt.test;
      const testTotalScore = Number(test.total_score) || 100;
      const score = Number(attempt.score) || 0;
      const percent = Math.max(0, Math.round((score / testTotalScore) * 100));
      
      totalPercent += percent;
      if (percent > bestPercent) {
        bestPercent = percent;
      }

      // Format date label
      const date = attempt.submitted_at 
        ? new Date(attempt.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : `Test ${index + 1}`;

      return {
        label: date,
        value: percent,
      };
    });

  if (submittedAttempts.length > 0) {
    averagePercent = Math.round(totalPercent / submittedAttempts.length);
  }

  // Calculate Trend (difference between last attempt and average)
  const lastAttemptPercent = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const trendVal = Math.abs(lastAttemptPercent - averagePercent);
  const trend = submittedAttempts.length > 1 ? {
    value: `${trendVal}%`,
    isUp: lastAttemptPercent >= averagePercent,
  } : undefined;

  // Process category accuracy
  const categoryStats: Record<string, { correct: number; total: number }> = {};
  
  submittedAttempts.forEach((attempt) => {
    const questions = attempt.questions || [];
    const answers = attempt.answers || {};

    questions.forEach((q: any) => {
      const catName = categoriesMap[q.sub_category_id] || "General Aptitude";
      if (!categoryStats[catName]) {
        categoryStats[catName] = { correct: 0, total: 0 };
      }
      
      categoryStats[catName].total++;
      
      const userAnswer = answers[q.id];
      if (userAnswer && userAnswer.trim().toUpperCase() === q.answer.trim().toUpperCase()) {
        categoryStats[catName].correct++;
      }
    });
  });

  const categoriesList = Object.entries(categoryStats).map(([name, stats]) => ({
    name,
    correct: stats.correct,
    total: stats.total,
  }));

  // Sort categories by volume/importance
  categoriesList.sort((a, b) => b.total - a.total);

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-canvas">
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar Nav */}
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex items-center gap-4 p-4 border border-hairline rounded-lg bg-surface-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-ink text-white font-semibold text-lg uppercase">
                {user.email?.[0]}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-sm font-medium text-ink truncate">{user.user_metadata?.name || "Student User"}</h2>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
            </div>
            
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "overview"
                    ? "bg-primary-ink text-white"
                    : "text-body hover:bg-surface-soft hover:text-ink"
                }`}
              >
                Overview
              </button>
              <Link
                href="/tests"
                className="w-full text-left px-4 py-2.5 rounded-md text-sm font-medium text-body hover:bg-surface-soft hover:text-ink transition-colors"
              >
                All Attempts
              </Link>
              <Link
                href="/create-test"
                className="w-full text-left px-4 py-2.5 rounded-md text-sm font-medium text-body hover:bg-surface-soft hover:text-ink transition-colors"
              >
                Create Test
              </Link>
            </nav>
          </aside>

          {/* Right Content Area */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            {loading ? (
              <div className="flex flex-col gap-8">
                <SkeletonGrid count={4} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            ) : totalAttempts === 0 ? (
              <EmptyState
                title="No tests attempted yet"
                description="Create a custom test to practice aptitude questions and get instant performance insights."
                actionLabel="Create Custom Test"
                actionHref="/create-test"
                icon={<span className="text-4xl">📝</span>}
              />
            ) : (
              <>
                {/* Stats Row */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard 
                    label="Tests Attempted" 
                    value={totalAttempts} 
                  />
                  <MetricCard 
                    label="Average Score" 
                    value={`${averagePercent}%`}
                    trend={trend}
                  />
                  <MetricCard 
                    label="Best Score" 
                    value={`${bestPercent}%`} 
                  />
                  <MetricCard 
                    label="Questions Answered" 
                    value={totalQuestionsAnswered} 
                  />
                </section>

                {/* Charts Grid */}
                {submittedAttempts.length > 0 && (
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <LineChart 
                      data={chartData} 
                      averageValue={averagePercent}
                    />
                    {categoriesList.length > 0 && (
                      <CategoryBreakdown 
                        categories={categoriesList}
                      />
                    )}
                  </section>
                )}

                {/* Recent Attempts Table */}
                <section className="card p-6 bg-canvas border border-hairline rounded-md shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Recent Attempts</h3>
                    <Link href="/tests" className="text-xs text-link font-semibold hover:underline">
                      View all attempts
                    </Link>
                  </div>
                  
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-hairline text-xs font-semibold text-muted uppercase tracking-wider bg-surface-soft">
                          <th className="py-3 px-4">Test Title</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4 text-center">Score</th>
                          <th className="py-3 px-4 text-center">Accuracy</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.slice(0, 5).map((attempt) => {
                          const test = attempt.test;
                          const formattedDate = new Date(attempt.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          });
                          
                          const correctMark = Number(test.correct_mark);
                          const totalQ = test.total_questions;
                          const answers = attempt.answers || {};
                          const totalAnswered = Object.keys(answers).length;
                          
                          // Accuracy
                          let accuracy = 0;
                          if (attempt.status === "submitted" && attempt.questions) {
                            let correct = 0;
                            attempt.questions.forEach((q: any) => {
                              if (answers[q.id]?.trim().toUpperCase() === q.answer.trim().toUpperCase()) {
                                correct++;
                              }
                            });
                            accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;
                          }

                          return (
                            <tr key={attempt.test_id} className="border-b border-hairline hover:bg-surface-soft/50 transition-colors">
                              <td className="py-3.5 px-4 font-medium text-ink max-w-[200px] truncate">
                                {test.title}
                              </td>
                              <td className="py-3.5 px-4 text-body text-xs">
                                {formattedDate}
                              </td>
                              <td className="py-3.5 px-4 text-center text-ink font-medium">
                                {attempt.status === "submitted" ? (
                                  <span>
                                    {attempt.score} <span className="text-xs text-muted">/ {test.total_score}</span>
                                  </span>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {attempt.status === "submitted" ? (
                                  <span className="text-xs text-body font-semibold">{accuracy}%</span>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  attempt.status === "submitted"
                                    ? "bg-success/10 text-success"
                                    : attempt.status === "expired"
                                    ? "bg-muted/10 text-muted"
                                    : "bg-info/10 text-info"
                                }`}>
                                  {attempt.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {attempt.status === "started" ? (
                                  <Link 
                                    href={`/test/${attempt.test_id}/session`}
                                    className="text-xs text-info font-semibold hover:underline"
                                  >
                                    Resume
                                  </Link>
                                ) : (
                                  <Link 
                                    href={`/tests/${attempt.test_id}`}
                                    className="text-xs text-link font-semibold hover:underline"
                                  >
                                    View Detail
                                  </Link>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
