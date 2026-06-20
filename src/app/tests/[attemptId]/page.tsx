"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/src/components/layouts/Navbar";
import { Footer } from "@/src/components/layouts/Footer";
import { useAuth } from "@/src/hooks/useAuth";
import { createClient } from "@/src/utils/supabase/client";
import { getAttemptDetails, getCategories, getSubCategories } from "@/src/services/db";
import { useToast } from "@/src/providers/ToastProvider";

export default function AttemptDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { attemptId } = useParams(); // This is the testId representing the attempt key
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({}); // subcat_id -> cat_name

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !attemptId) return;

    async function loadAttemptDetails() {
      try {
        setLoading(true);
        const data = await getAttemptDetails(supabase, user!.id, attemptId as string);
        if (!data) {
          toast("Attempt not found", "error");
          router.push("/dashboard");
          return;
        }

        // If attempt is active/started, redirect to active session instead
        if (data.status === "started") {
          toast("Redirecting to active test session...", "info");
          router.push(`/test/${attemptId}/session`);
          return;
        }

        setAttempt(data);

        // Fetch category maps
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
      } catch (err: any) {
        toast("Failed to load attempt details", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAttemptDetails();
  }, [user, attemptId]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <svg className="animate-spin h-8 w-8 text-primary-ink" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!user || !attempt) return null;

  const test = attempt.test;
  const questions = attempt.questions || [];
  const answers = attempt.answers || {};

  // Compute metrics
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  questions.forEach((q: any) => {
    const userAnswer = answers[q.id];
    if (!userAnswer) {
      skippedCount++;
    } else if (userAnswer.trim().toUpperCase() === q.answer.trim().toUpperCase()) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  const totalAnswered = correctCount + incorrectCount;
  const accuracyPercentage = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const totalQuestions = questions.length;
  
  // Format dates
  const submittedDate = attempt.submitted_at 
    ? new Date(attempt.submitted_at).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    : "Not submitted";

  // Segment proportions for visuals
  const correctRatio = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const incorrectRatio = totalQuestions > 0 ? (incorrectCount / totalQuestions) * 100 : 0;
  const skippedRatio = totalQuestions > 0 ? (skippedCount / totalQuestions) * 100 : 0;

  // Section-wise breakdown calculation
  const sections = test.sections || [];
  const sectionBreakdown: { name: string; questions: any[]; correct: number; total: number }[] = [];

  if (sections.length > 0 && totalQuestions > 0) {
    const questionsPerSection = Math.ceil(totalQuestions / sections.length);
    sections.forEach((sectName: string, index: number) => {
      const startIdx = index * questionsPerSection;
      const endIdx = Math.min(startIdx + questionsPerSection, totalQuestions);
      const sectionQuestions = questions.slice(startIdx, endIdx);
      
      let secCorrect = 0;
      sectionQuestions.forEach((q: any) => {
        if (answers[q.id]?.trim().toUpperCase() === q.answer.trim().toUpperCase()) {
          secCorrect++;
        }
      });

      sectionBreakdown.push({
        name: sectName,
        questions: sectionQuestions,
        correct: secCorrect,
        total: sectionQuestions.length,
      });
    });
  }

  // Get primary category/subcategory subtitle
  let categorySubtitle = "Aptitude Practice";
  if (questions.length > 0) {
    const firstSubCatId = questions[0].sub_category_id;
    const catName = categoriesMap[firstSubCatId];
    if (catName) {
      categorySubtitle = catName;
    }
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-canvas py-8 md:py-12">
        <div className="mx-auto max-w-4xl px-6">
          
          {/* Header */}
          <div className="flex flex-col gap-2 mb-8 pb-6 border-b border-hairline">
            <Link 
              href="/tests" 
              className="text-xs font-semibold text-link hover:underline inline-flex items-center gap-1 mb-2"
            >
              ← Back to All Attempts
            </Link>
            <h1 className="text-3xl font-normal text-ink tracking-tight">{test.title}</h1>
            <div className="flex items-center gap-3 text-xs text-muted font-medium mt-1">
              <span>{categorySubtitle}</span>
              <span>•</span>
              <span>Submitted on {submittedDate}</span>
              <span>•</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                attempt.status === "submitted" ? "bg-success/10 text-success" : "bg-muted/10 text-muted"
              }`}>
                {attempt.status}
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-5 bg-canvas border border-hairline rounded-md text-center">
              <span className="text-[10px] font-semibold text-muted tracking-wider uppercase block">Score</span>
              <span className="text-2xl font-normal text-ink mt-2 block">
                {attempt.score} <span className="text-xs text-muted font-medium">/ {test.total_score}</span>
              </span>
            </div>
            
            <div className="card p-5 bg-canvas border border-hairline rounded-md text-center">
              <span className="text-[10px] font-semibold text-muted tracking-wider uppercase block">Accuracy</span>
              <span className="text-2xl font-normal text-ink mt-2 block">
                {accuracyPercentage}%
              </span>
            </div>

            <div className="card p-5 bg-canvas border border-hairline rounded-md text-center">
              <span className="text-[10px] font-semibold text-muted tracking-wider uppercase block">Correct / Wrong</span>
              <span className="text-2xl font-normal text-ink mt-2 block">
                <span className="text-success">{correctCount}</span>
                <span className="text-muted text-lg mx-1">/</span>
                <span className="text-error">{incorrectCount}</span>
              </span>
            </div>

            <div className="card p-5 bg-canvas border border-hairline rounded-md text-center">
              <span className="text-[10px] font-semibold text-muted tracking-wider uppercase block">Skipped</span>
              <span className="text-2xl font-normal text-ink mt-2 block">
                {skippedCount}
              </span>
            </div>
          </section>

          {/* Score Proportion Bar Chart */}
          <section className="card p-6 bg-canvas border border-hairline rounded-md mb-8">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-4">Proportion Breakdown</h3>
            <div className="h-6 w-full rounded-md overflow-hidden flex border border-hairline bg-surface-soft mb-4">
              {correctRatio > 0 && (
                <div 
                  className="h-full bg-success text-[10px] font-bold text-white flex items-center justify-center transition-all"
                  style={{ width: `${correctRatio}%` }}
                  title={`Correct: ${correctCount} (${Math.round(correctRatio)}%)`}
                >
                  {correctRatio >= 10 && `${Math.round(correctRatio)}%`}
                </div>
              )}
              {incorrectRatio > 0 && (
                <div 
                  className="h-full bg-error text-[10px] font-bold text-white flex items-center justify-center transition-all"
                  style={{ width: `${incorrectRatio}%` }}
                  title={`Incorrect: ${incorrectCount} (${Math.round(incorrectRatio)}%)`}
                >
                  {incorrectRatio >= 10 && `${Math.round(incorrectRatio)}%`}
                </div>
              )}
              {skippedRatio > 0 && (
                <div 
                  className="h-full bg-surface-strong text-[10px] font-bold text-muted flex items-center justify-center transition-all"
                  style={{ width: `${skippedRatio}%` }}
                  title={`Skipped: ${skippedCount} (${Math.round(skippedRatio)}%)`}
                >
                  {skippedRatio >= 10 && `${Math.round(skippedRatio)}%`}
                </div>
              )}
            </div>
            <div className="flex gap-6 justify-center text-xs">
              <div className="flex items-center gap-1.5 font-medium text-body">
                <span className="h-3.5 w-3.5 rounded bg-success inline-block" />
                <span>Correct ({correctCount})</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-body">
                <span className="h-3.5 w-3.5 rounded bg-error inline-block" />
                <span>Incorrect ({incorrectCount})</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-body">
                <span className="h-3.5 w-3.5 rounded bg-surface-strong inline-block" />
                <span>Skipped ({skippedCount})</span>
              </div>
            </div>
          </section>

          {/* Section-wise Breakdown Table */}
          {sectionBreakdown.length > 0 && (
            <section className="card p-6 bg-canvas border border-hairline rounded-md mb-8">
              <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-4">Section-wise Breakdown</h3>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-hairline text-xs font-semibold text-muted uppercase tracking-wider bg-surface-soft">
                      <th className="py-2.5 px-3">Section Name</th>
                      <th className="py-2.5 px-3 text-center">Questions</th>
                      <th className="py-2.5 px-3 text-center">Correct</th>
                      <th className="py-2.5 px-3 text-center">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionBreakdown.map((sec) => {
                      const secAccuracy = sec.total > 0 ? Math.round((sec.correct / sec.total) * 100) : 0;
                      return (
                        <tr key={sec.name} className="border-b border-hairline hover:bg-surface-soft/50">
                          <td className="py-3 px-3 font-medium text-ink">{sec.name}</td>
                          <td className="py-3 px-3 text-center text-body">{sec.total}</td>
                          <td className="py-3 px-3 text-center text-success font-semibold">{sec.correct}</td>
                          <td className="py-3 px-3 text-center font-bold text-ink">{secAccuracy}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Action Footer */}
          <div className="flex flex-col items-center pt-4">
            <Link 
              href={`/tests/${attemptId}/questions`}
              className="btn-primary w-full sm:w-auto text-center !px-8"
            >
              View All Questions
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
