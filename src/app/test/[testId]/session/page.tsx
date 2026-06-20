"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/src/utils/supabase/client";
import { getAttemptDetails, updateAttemptAnswers, submitAttempt } from "@/src/services/db";
import { ConfirmationDialog } from "@/src/components/ui/ConfirmationDialog";
import { useToast } from "@/src/providers/ToastProvider";

export default function TestSessionPage() {
  const { testId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);
  
  // Navigation & Answers states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({ "0": true });

  // Timer states
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Modal dialog states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);

  // Load attempt and initialize answers
  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/signin");
          return;
        }

        const data = await getAttemptDetails(supabase, user.id, testId as string);
        if (!data) {
          toast("No active test attempt found", "error");
          router.push("/dashboard");
          return;
        }

        if (data.status !== "in_progress") {
          toast("This test has already been completed", "info");
          router.push(`/test/${testId}/report`);
          return;
        }

        setAttempt(data);
        
        // Load answers (restore from local storage first, then db)
        const localSavedStr = localStorage.getItem(`test_answers_${testId}`);
        const localSaved = localSavedStr ? JSON.parse(localSavedStr) : null;
        
        const initialAnswers = {
          ...(data.answers || {}),
          ...(localSaved || {})
        };
        setAnswers(initialAnswers);
        
        // Restore review markers
        const localReviewStr = localStorage.getItem(`test_reviews_${testId}`);
        if (localReviewStr) {
          setMarkedForReview(JSON.parse(localReviewStr));
        }

        // Restore visited state
        const localVisitedStr = localStorage.getItem(`test_visited_${testId}`);
        if (localVisitedStr) {
          setVisited(JSON.parse(localVisitedStr));
        } else {
          setVisited({ [data.questions?.[0]?.id || ""]: true });
        }

        // Initialize Timer based on start time
        const durationMin = Number(data.test?.duration) || 15;
        const rawCreatedAt = data.created_at || "";
        const normalizedCreatedAt = rawCreatedAt && !rawCreatedAt.includes("Z") && !rawCreatedAt.includes("+") && !rawCreatedAt.includes("-")
          ? rawCreatedAt.trim().replace(" ", "T") + "Z"
          : rawCreatedAt;
        const startMs = new Date(normalizedCreatedAt).getTime();
        const endMs = startMs + durationMin * 60 * 1000;
        const remainingSec = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
        
        setTimeLeft(remainingSec);
        
        if (remainingSec <= 0) {
          // Time is already up!
          toast("Time has expired. Submitting your test...", "info");
          handleAutoSubmit(initialAnswers, user.id);
        }

      } catch (err: any) {
        toast("Failed to load test session", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [testId]);

  // Start timer interval
  useEffect(() => {
    if (loading || timeLeft <= 0 || !attempt) return;

    timerRef.current = setInterval(async () => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto submit
          toast("Time is up! Submitting answers...", "info");
          const { data: { user } } = supabase.auth.getUser() as any;
          if (user) {
            handleAutoSubmit(answers, user.id);
          } else {
            // fallback if user state isn't fetched
            handleAutoSubmit(answers, attempt.user_id);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, timeLeft, attempt, answers]);

  // Keep track of visited questions
  const selectQuestion = (idx: number) => {
    if (!attempt?.questions) return;
    const qId = attempt.questions[idx]?.id;
    if (qId) {
      const newVisited = { ...visited, [qId]: true };
      setVisited(newVisited);
      localStorage.setItem(`test_visited_${testId}`, JSON.stringify(newVisited));
    }
    setCurrentIdx(idx);
  };

  const handleSelectOption = async (optionLetter: string) => {
    if (!attempt?.questions) return;
    const q = attempt.questions[currentIdx];
    const newAnswers = { ...answers, [q.id]: optionLetter };
    setAnswers(newAnswers);
    
    // Save to local storage
    localStorage.setItem(`test_answers_${testId}`, JSON.stringify(newAnswers));
    
    // Sync with database asynchronously
    try {
      await updateAttemptAnswers(supabase, attempt.user_id, testId as string, newAnswers);
    } catch (err) {
      console.error("Failed to sync answers to server:", err);
    }
  };

  const handleClearResponse = async () => {
    if (!attempt?.questions) return;
    const q = attempt.questions[currentIdx];
    const newAnswers = { ...answers };
    delete newAnswers[q.id];
    setAnswers(newAnswers);
    
    // Save to local storage
    localStorage.setItem(`test_answers_${testId}`, JSON.stringify(newAnswers));

    try {
      await updateAttemptAnswers(supabase, attempt.user_id, testId as string, newAnswers);
    } catch (err) {
      console.error("Failed to clear response on server:", err);
    }
  };

  const handleToggleReview = () => {
    if (!attempt?.questions) return;
    const q = attempt.questions[currentIdx];
    const newReviews = { ...markedForReview, [q.id]: !markedForReview[q.id] };
    setMarkedForReview(newReviews);
    localStorage.setItem(`test_reviews_${testId}`, JSON.stringify(newReviews));
  };

  // Auto-submit triggers direct redirect to submitting loader
  const handleAutoSubmit = async (finalAnswers: Record<string, string>, userId: string) => {
    setSubmittingTest(true);
    try {
      // Clean local storage
      localStorage.removeItem(`test_answers_${testId}`);
      localStorage.removeItem(`test_reviews_${testId}`);
      localStorage.removeItem(`test_visited_${testId}`);
      
      // Submit in DB
      await submitAttempt(supabase, userId, testId as string, finalAnswers);
      
      // Redirect to submission loader screen
      router.push(`/test/${testId}/submitting`);
    } catch (err: any) {
      toast("Error submitting test: " + err.message, "error");
      console.error(err);
      setSubmittingTest(false);
    }
  };

  const handleManualSubmit = async () => {
    setShowSubmitModal(false);
    setSubmittingTest(true);
    try {
      localStorage.removeItem(`test_answers_${testId}`);
      localStorage.removeItem(`test_reviews_${testId}`);
      localStorage.removeItem(`test_visited_${testId}`);

      await submitAttempt(supabase, attempt.user_id, testId as string, answers);
      router.push(`/test/${testId}/submitting`);
    } catch (err: any) {
      toast("Failed to submit test", "error");
      console.error(err);
      setSubmittingTest(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (loading || !attempt?.questions) return;
      
      // Select option with keys 1, 2, 3, 4 (A, B, C, D)
      if (["1", "2", "3", "4"].includes(e.key)) {
        const optionLetters = ["A", "B", "C", "D"];
        const oIdx = parseInt(e.key) - 1;
        handleSelectOption(optionLetters[oIdx]);
      }
      
      // N for next, P for previous
      if (e.key.toLowerCase() === "n" && currentIdx < attempt.questions.length - 1) {
        selectQuestion(currentIdx + 1);
      }
      if (e.key.toLowerCase() === "p" && currentIdx > 0) {
        selectQuestion(currentIdx - 1);
      }
    }
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, attempt, currentIdx, answers]);

  if (loading || !attempt) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <svg className="animate-spin h-8 w-8 text-primary-ink" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const test = attempt.test;
  const questions = attempt.questions || [];
  const activeQuestion = questions[currentIdx];

  // Helper formatting for remaining time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer colors & animations
  let timerColorClass = "text-info bg-info/10";
  let isTimerCritical = false;
  
  if (timeLeft <= 60) {
    timerColorClass = "text-error bg-error/10 border-error animate-pulse";
    isTimerCritical = true;
  } else if (timeLeft <= 300) {
    timerColorClass = "text-signature-mustard bg-signature-mustard/10 border-signature-mustard";
  }

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas py-4 shadow-sm select-none">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ink leading-tight truncate max-w-[150px] sm:max-w-xs">{test.title}</span>
            <span className="text-[10px] text-muted font-bold tracking-wider uppercase mt-0.5">Live Practice</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-sm font-bold tracking-tabular leading-none transition-all ${timerColorClass}`}>
            {isTimerCritical && <span className="h-1.5 w-1.5 rounded-full bg-error" />}
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn-primary btn-sm rounded-lg"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-grow flex flex-col lg:flex-row bg-surface-soft">
        
        {/* Left Sidebar: Question Palette */}
        <aside className="w-full lg:w-80 lg:border-r border-b lg:border-b-0 border-hairline bg-canvas p-6 flex flex-col gap-6 select-none order-2 lg:order-1">
          <div>
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Question Palette</h3>
            <p className="text-[10px] text-muted font-medium">Click a number to jump to that question.</p>
          </div>

          {/* Grid Palette */}
          <div className="grid grid-cols-5 gap-2.5 max-h-72 lg:max-h-none overflow-y-auto pr-1">
            {questions.map((q: any, idx: number) => {
              const isSelected = idx === currentIdx;
              const hasAnswer = !!answers[q.id];
              const isMarked = !!markedForReview[q.id];
              const hasVisited = !!visited[q.id];

              let btnStyle = "bg-canvas text-body border-hairline hover:border-border-strong";
              
              if (isSelected) {
                btnStyle = "border-primary-ink ring-2 ring-primary-ink font-bold text-ink";
              }
              
              // Custom statuses prioritize visual coding
              if (isMarked) {
                // Amber marked for review
                btnStyle = "bg-signature-mustard text-ink border-signature-mustard font-semibold";
              } else if (hasAnswer) {
                // Filled primary for answered
                btnStyle = "bg-primary-ink text-white border-primary-ink font-semibold";
              } else if (hasVisited) {
                // Visited but not answered (outlined)
                btnStyle = "border-primary-ink/50 text-ink bg-primary-ink/5 font-semibold";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => selectQuestion(idx)}
                  className={`flex h-10 w-10 items-center justify-center rounded-md border text-xs transition-all cursor-pointer ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Status Legends */}
          <div className="border-t border-hairline pt-4 flex flex-col gap-2 mt-auto text-xs text-muted font-medium">
            <div className="flex items-center gap-2">
              <span className="h-4.5 w-4.5 rounded border border-hairline bg-canvas inline-block" />
              <span>Not Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4.5 w-4.5 rounded border border-primary-ink/50 bg-primary-ink/5 inline-block" />
              <span>Visited (No Answer)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4.5 w-4.5 rounded bg-primary-ink inline-block" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4.5 w-4.5 rounded bg-signature-mustard inline-block" />
              <span>Marked for Review</span>
            </div>
          </div>
        </aside>

        {/* Right Area: Active Question Panel */}
        <section className="flex-grow p-6 sm:p-8 flex flex-col justify-between order-1 lg:order-2">
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
            
            {/* Question Label & Tag */}
            <div className="flex justify-between items-center pb-4 border-b border-hairline">
              <span className="text-sm font-semibold text-muted uppercase tracking-wider">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-xs text-muted font-medium bg-canvas border border-hairline px-2.5 py-0.5 rounded-md">
                +{test.correct_mark} correct / -{test.negative_mark} incorrect
              </span>
            </div>

            {/* Question Card */}
            <div className="bg-canvas border border-hairline rounded-md p-6 shadow-sm min-h-[350px] flex flex-col justify-between">
              
              {/* Question Text */}
              <p className="text-sm md:text-base font-semibold text-ink leading-relaxed whitespace-pre-line mb-6">
                {activeQuestion?.question}
              </p>

              {/* Options list */}
              <div className="flex flex-col gap-3">
                {activeQuestion?.options.map((optText: string, oIdx: number) => {
                  const letter = optionLetters[oIdx];
                  const isSelected = answers[activeQuestion.id] === letter;
                  
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(letter)}
                      className={`w-full flex items-center gap-4 text-left border rounded-md p-4 transition-all cursor-pointer ${
                        isSelected 
                          ? "border-primary-ink bg-primary-ink/[0.02] ring-1 ring-primary-ink font-semibold" 
                          : "border-hairline bg-canvas hover:border-border-strong text-body"
                      }`}
                    >
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                        isSelected 
                          ? "bg-primary-ink text-white border-primary-ink" 
                          : "bg-surface-soft border-hairline text-muted"
                      }`}>
                        {letter}
                      </div>
                      <span className="text-xs sm:text-sm text-ink">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Review & Clear Response */}
              <div className="flex items-center justify-between border-t border-hairline pt-4 mt-6">
                <button
                  onClick={handleToggleReview}
                  className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 focus:outline-none cursor-pointer ${
                    markedForReview[activeQuestion?.id]
                      ? "text-signature-mustard"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <span className="text-sm">★</span>
                  <span>
                    {markedForReview[activeQuestion?.id] ? "Marked" : "Mark for Review"}
                  </span>
                </button>
                
                {answers[activeQuestion?.id] && (
                  <button
                    onClick={handleClearResponse}
                    className="text-xs font-bold uppercase tracking-wider text-error hover:underline focus:outline-none cursor-pointer"
                  >
                    Clear Response
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Navigation Control Footer */}
          <div className="w-full max-w-3xl mx-auto flex justify-between items-center mt-6 pt-4 border-t border-hairline/50">
            <button
              onClick={() => selectQuestion(currentIdx - 1)}
              disabled={currentIdx === 0}
              className="btn-secondary !px-5 !py-2.5 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            
            <span className="text-xs text-muted font-medium">
              Shortcuts: Use keys 1-4 for options • N/P for Next/Prev
            </span>

            {currentIdx === questions.length - 1 ? (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="btn-primary !px-6 !py-2.5 rounded-lg"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={() => selectQuestion(currentIdx + 1)}
                className="btn-primary !px-6 !py-2.5 rounded-lg"
              >
                Next
              </button>
            )}
          </div>
        </section>

      </main>

      {/* Confirmation Submit Modal */}
      <ConfirmationDialog
        isOpen={showSubmitModal}
        title="Submit Test Attempt?"
        message={`Are you sure you want to submit? You have answered ${
          Object.keys(answers).length
        } out of ${questions.length} questions. You will not be able to change your responses after submitting.`}
        confirmLabel={submittingTest ? "Submitting..." : "Submit Test"}
        cancelLabel="Continue Practicing"
        onConfirm={handleManualSubmit}
        onCancel={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
