"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/src/components/layouts/Navbar";
import { Footer } from "@/src/components/layouts/Footer";
import { useAuth } from "@/src/hooks/useAuth";
import { createClient } from "@/src/utils/supabase/client";
import { getAttemptDetails } from "@/src/services/db";
import { useToast } from "@/src/providers/ToastProvider";

export default function QuestionsReviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { attemptId } = useParams();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);
  
  // Filtering state
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "skipped">("all");
  // Accordion state to toggle explanation visibility
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !attemptId) return;

    async function loadAttempt() {
      try {
        setLoading(true);
        const data = await getAttemptDetails(supabase, user!.id, attemptId as string);
        if (!data) {
          toast("Attempt not found", "error");
          router.push("/dashboard");
          return;
        }
        
        if (data.status === "started") {
          router.push(`/test/${attemptId}/session`);
          return;
        }

        setAttempt(data);
      } catch (err: any) {
        toast("Failed to load questions review", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAttempt();
  }, [user, attemptId]);

  const toggleExplanation = (questionId: string) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

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

  // Map option letters to index
  const optionLetters = ["A", "B", "C", "D"];

  // Perform client-side filtering of questions
  const filteredQuestions = questions.filter((q: any) => {
    const userAnswer = answers[q.id];
    
    if (filter === "all") return true;
    if (filter === "skipped") return !userAnswer;
    
    const isCorrect = userAnswer && userAnswer.trim().toUpperCase() === q.answer.trim().toUpperCase();
    if (filter === "correct") return isCorrect;
    if (filter === "incorrect") return userAnswer && !isCorrect;
    
    return true;
  });

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-canvas py-8 md:py-12">
        <div className="mx-auto max-w-3xl px-6">
          
          {/* Top Header */}
          <div className="flex flex-col gap-2 mb-8 pb-6 border-b border-hairline">
            <Link 
              href={`/tests/${attemptId}`} 
              className="text-xs font-semibold text-link hover:underline inline-flex items-center gap-1 mb-2"
            >
              ← Back to Details Report
            </Link>
            <h1 className="text-2xl md:text-3xl font-normal text-ink tracking-tight">Review Questions</h1>
            <p className="text-sm text-body">{test.title}</p>
          </div>

          {/* Live filter controls */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-hairline pb-4">
            {(["all", "correct", "incorrect", "skipped"] as const).map((mode) => {
              // Count for this specific filter
              let count = 0;
              if (mode === "all") count = questions.length;
              else if (mode === "skipped") {
                count = questions.filter((q: any) => !answers[q.id]).length;
              } else if (mode === "correct") {
                count = questions.filter((q: any) => answers[q.id]?.trim().toUpperCase() === q.answer.trim().toUpperCase()).length;
              } else if (mode === "incorrect") {
                count = questions.filter((q: any) => answers[q.id] && answers[q.id]?.trim().toUpperCase() !== q.answer.trim().toUpperCase()).length;
              }

              return (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                    filter === mode
                      ? "bg-primary-ink text-white border-primary-ink"
                      : "bg-surface-soft text-body border-hairline hover:text-ink"
                  }`}
                >
                  {mode} ({count})
                </button>
              );
            })}
          </div>

          {/* Questions list */}
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-hairline rounded-lg bg-surface-soft text-muted text-sm">
              No questions found matching the "{filter}" filter.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredQuestions.map((q: any, idx: number) => {
                const globalIndex = questions.findIndex((origQ: any) => origQ.id === q.id) + 1;
                const userAnswer = answers[q.id];
                const isSkipped = !userAnswer;
                const isCorrect = userAnswer && userAnswer.trim().toUpperCase() === q.answer.trim().toUpperCase();
                
                let statusBadge = "bg-muted/10 text-muted border-muted/20";
                let statusLabel = "Skipped";
                if (isCorrect) {
                  statusBadge = "bg-success/10 text-success border-success-border/20";
                  statusLabel = "Correct";
                } else if (userAnswer) {
                  statusBadge = "bg-error/10 text-error border-error/20";
                  statusLabel = "Incorrect";
                }

                const showExp = !!expandedExplanations[q.id];

                return (
                  <div key={q.id} className="card p-6 bg-canvas border border-hairline rounded-md flex flex-col gap-4">
                    {/* Question Header */}
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-xs font-bold text-muted uppercase tracking-wider">
                        Question {globalIndex}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusBadge}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Question text */}
                    <p className="text-sm font-semibold text-ink leading-relaxed whitespace-pre-line">
                      {q.question}
                    </p>

                    {/* Options list */}
                    <div className="flex flex-col gap-2.5 mt-2">
                      {q.options.map((optText: string, oIdx: number) => {
                        const letter = optionLetters[oIdx];
                        const isThisCorrect = letter === q.answer;
                        const isThisUserSelection = letter === userAnswer;
                        
                        let optionStyle = "border-hairline bg-canvas text-body";
                        let letterBadgeStyle = "bg-surface-soft border-hairline text-muted";

                        if (isThisCorrect) {
                          // Correct option is always green
                          optionStyle = "border-success bg-success/5 text-success font-medium";
                          letterBadgeStyle = "bg-success text-white border-success";
                        } else if (isThisUserSelection) {
                          // If user selected this incorrect option, make it red
                          optionStyle = "border-error bg-error/5 text-error font-medium";
                          letterBadgeStyle = "bg-error text-white border-error";
                        }

                        return (
                          <div 
                            key={oIdx} 
                            className={`flex items-center gap-3 border p-3.5 rounded-md text-xs transition-colors ${optionStyle}`}
                          >
                            <div className={`flex h-5.5 w-5.5 items-center justify-center rounded-full border text-[10px] font-bold ${letterBadgeStyle}`}>
                              {letter}
                            </div>
                            <span className="flex-grow">{optText}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* User Answer / Correct Answer details */}
                    <div className="text-xs text-muted font-medium bg-surface-soft p-3.5 rounded-md mt-2 flex flex-col gap-1 border border-hairline">
                      <div>
                        Correct Answer: <span className="text-success font-bold">{q.answer}</span>
                      </div>
                      <div>
                        Your Answer:{" "}
                        {isSkipped ? (
                          <span className="text-muted italic">Skipped</span>
                        ) : isCorrect ? (
                          <span className="text-success font-bold">
                            {userAnswer} ({statusLabel})
                          </span>
                        ) : (
                          <span className="text-error font-bold">
                            {userAnswer} ({statusLabel})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Explanation Accordion */}
                    {q.explanation && (
                      <div className="border-t border-hairline pt-3 mt-2">
                        <button
                          onClick={() => toggleExplanation(q.id)}
                          className="flex items-center justify-between w-full text-xs font-semibold text-ink uppercase tracking-wider text-left focus:outline-none cursor-pointer"
                        >
                          <span>{showExp ? "Hide Explanation" : "Show Explanation"}</span>
                          <span className="text-muted">{showExp ? "▲" : "▼"}</span>
                        </button>
                        
                        {showExp && (
                          <div className="mt-3 text-xs text-body leading-relaxed bg-signature-cream/40 border border-signature-cream p-4 rounded-md animate-in fade-in slide-in-from-top-1 duration-150">
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
