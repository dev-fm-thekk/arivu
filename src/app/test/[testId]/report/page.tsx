"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/src/components/layouts/Navbar";
import { Footer } from "@/src/components/layouts/Footer";
import { useAuth } from "@/src/hooks/useAuth";
import { createClient } from "@/src/utils/supabase/client";
import { getAttemptDetails } from "@/src/services/db";
import { CircularProgressRing } from "@/src/components/ui/CircularProgressRing";
import { useToast } from "@/src/providers/ToastProvider";

export default function TestReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { testId } = useParams();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !testId) return;

    async function loadReport() {
      try {
        setLoading(true);
        const data = await getAttemptDetails(supabase, user!.id, testId as string);
        if (!data) {
          toast("Attempt details not found", "error");
          router.push("/dashboard");
          return;
        }

        if (data.status === "started") {
          // Send back if they tried to bypass active session
          router.push(`/test/${testId}/session`);
          return;
        }

        setAttempt(data);
      } catch (err: any) {
        toast("Failed to load report", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [user, testId]);

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

  // Score stats calculations
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

  const totalScore = Number(test.total_score) || 100;
  const rawScore = Number(attempt.score) || 0;
  const percentage = Math.round((rawScore / totalScore) * 100);

  const correctMark = Number(test.correct_mark);
  const negativeMark = Number(test.negative_mark || 0);

  // Performance feedbacks
  let feedbackMessage = "Keep practicing. Check the explanations.";
  let feedbackTitle = "Keep learning!";
  let feedbackColor = "text-error bg-error/5 border-error/20";
  
  if (percentage >= 80) {
    feedbackTitle = "Outstanding!";
    feedbackMessage = "Great job! Strong performance.";
    feedbackColor = "text-success bg-success/5 border-success-border/20";
  } else if (percentage >= 60) {
    feedbackTitle = "Good effort!";
    feedbackMessage = "Review the incorrect questions to push your score higher.";
    feedbackColor = "text-signature-mustard bg-signature-mustard/10 border-signature-mustard/20";
  }

  // Format date
  const submittedDate = attempt.submitted_at 
    ? new Date(attempt.submitted_at).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    : "Just now";

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-canvas py-8 md:py-12 select-none">
        <div className="mx-auto max-w-2xl px-6 flex flex-col gap-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-normal text-ink tracking-tight mb-2">Test Report</h1>
            <p className="text-sm text-body">{test.title}</p>
            <p className="text-xs text-muted mt-1">Submitted on {submittedDate}</p>
          </div>

          {/* Circular progress card */}
          <div className="card p-8 bg-canvas border border-hairline rounded-md flex flex-col items-center justify-center shadow-sm">
            <CircularProgressRing 
              percentage={percentage} 
              size={200} 
              strokeWidth={14} 
              label={`${rawScore} / ${totalScore}`}
              sublabel="Raw Score"
            />
          </div>

          {/* Performance Message Callout */}
          <div className={`border p-4 rounded-md text-center ${feedbackColor}`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-1">{feedbackTitle}</h3>
            <p className="text-xs font-medium">{feedbackMessage}</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="card py-4 bg-canvas border border-hairline rounded-md">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Correct</span>
              <span className="text-xl font-normal text-success mt-1 block">{correctCount}</span>
            </div>
            
            <div className="card py-4 bg-canvas border border-hairline rounded-md">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Incorrect</span>
              <span className="text-xl font-normal text-error mt-1 block">{incorrectCount}</span>
            </div>

            <div className="card py-4 bg-canvas border border-hairline rounded-md">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Skipped</span>
              <span className="text-xl font-normal text-muted mt-1 block">{skippedCount}</span>
            </div>
          </div>

          {/* Marks Detailed Table */}
          <div className="card p-6 bg-canvas border border-hairline rounded-md">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-4 text-left">Marks Calculation</h3>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-hairline text-xs font-semibold text-muted uppercase bg-surface-soft">
                  <th className="py-2.5 px-3">Answer Status</th>
                  <th className="py-2.5 px-3 text-center">Count</th>
                  <th className="py-2.5 px-3 text-right">Marks Added/Subtracted</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-hairline hover:bg-surface-soft/40">
                  <td className="py-3 px-3 flex items-center gap-2 text-body">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    <span>Correct</span>
                  </td>
                  <td className="py-3 px-3 text-center text-ink">{correctCount}</td>
                  <td className="py-3 px-3 text-right text-success font-semibold">+{correctCount * correctMark}</td>
                </tr>
                <tr className="border-b border-hairline hover:bg-surface-soft/40">
                  <td className="py-3 px-3 flex items-center gap-2 text-body">
                    <span className="h-2 w-2 rounded-full bg-error" />
                    <span>Incorrect</span>
                  </td>
                  <td className="py-3 px-3 text-center text-ink">{incorrectCount}</td>
                  <td className="py-3 px-3 text-right text-error font-semibold">-{incorrectCount * negativeMark}</td>
                </tr>
                <tr className="border-b border-hairline hover:bg-surface-soft/40">
                  <td className="py-3 px-3 flex items-center gap-2 text-body">
                    <span className="h-2 w-2 rounded-full bg-surface-strong" />
                    <span>Skipped</span>
                  </td>
                  <td className="py-3 px-3 text-center text-ink">{skippedCount}</td>
                  <td className="py-3 px-3 text-right text-muted font-medium">0</td>
                </tr>
                <tr className="font-bold bg-surface-soft/40">
                  <td className="py-3.5 px-3 text-ink">Total Score</td>
                  <td className="py-3.5 px-3 text-center text-muted">—</td>
                  <td className="py-3.5 px-3 text-right text-ink font-bold text-base">{rawScore} / {totalScore}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4 border-t border-hairline pt-6">
            <Link 
              href={`/tests/${testId}/questions`} 
              className="btn-primary text-center sm:flex-1"
            >
              View Questions
            </Link>
            <Link 
              href="/dashboard" 
              className="btn-secondary text-center sm:flex-1"
            >
              Go to Dashboard
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
