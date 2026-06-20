"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/src/components/layouts/Navbar";
import { Footer } from "@/src/components/layouts/Footer";
import { useAuth } from "@/src/hooks/useAuth";
import { createClient } from "@/src/utils/supabase/client";
import { getCategories, getSubCategories, createTest, startAttempt } from "@/src/services/db";
import { useToast } from "@/src/providers/ToastProvider";

export default function CreateTestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Data lists
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  // Form states
  const [title, setTitle] = useState("");
  const [sectionInput, setSectionInput] = useState("");
  const [sections, setSections] = useState<string[]>(["General Aptitude"]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [duration, setDuration] = useState<number>(15);
  const [correctMark, setCorrectMark] = useState<number>(1);
  const [negativeMark, setNegativeMark] = useState<number>(0.25);
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    async function loadFormOptions() {
      try {
        setLoading(true);
        const cats = await getCategories(supabase);
        const subCats = await getSubCategories(supabase);
        setCategories(cats || []);
        setSubCategories(subCats || []);

        // Select all subcategories by default
        if (subCats && subCats.length > 0) {
          setSelectedSubcategories(subCats.map(s => s.id));
        }
      } catch (err: any) {
        toast("Failed to load category filters", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadFormOptions();
  }, [user]);

  // Handle section tags
  const handleAddSection = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = sectionInput.trim();
      if (val && !sections.includes(val)) {
        setSections([...sections, val]);
        setSectionInput("");
      }
    }
  };

  const handleRemoveSection = (sectToRemove: string) => {
    setSections(sections.filter((s) => s !== sectToRemove));
  };

  // Checkbox handlers
  const handleToggleSubcategory = (subId: string) => {
    if (selectedSubcategories.includes(subId)) {
      setSelectedSubcategories(selectedSubcategories.filter((id) => id !== subId));
    } else {
      setSelectedSubcategories([...selectedSubcategories, subId]);
    }
  };

  const handleToggleCategory = (catId: string, subIds: string[]) => {
    const allSelected = subIds.every((id) => selectedSubcategories.includes(id));
    if (allSelected) {
      // Remove all of them
      setSelectedSubcategories(selectedSubcategories.filter((id) => !subIds.includes(id)));
    } else {
      // Add missing ones
      const missing = subIds.filter((id) => !selectedSubcategories.includes(id));
      setSelectedSubcategories([...selectedSubcategories, ...missing]);
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = "Test title is required";
    }
    if (sections.length === 0) {
      errors.sections = "At least one section tag is required";
    }
    if (selectedSubcategories.length === 0) {
      errors.subcategories = "At least one subcategory must be selected";
    }
    if (!totalQuestions || totalQuestions < 1) {
      errors.totalQuestions = "Total questions must be at least 1";
    }
    if (!duration || duration < 1) {
      errors.duration = "Duration must be at least 1 minute";
    }
    if (!correctMark || correctMark <= 0) {
      errors.correctMark = "Correct mark must be greater than 0";
    }
    if (negativeMark < 0) {
      errors.negativeMark = "Negative mark cannot be negative";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast("Please fix form errors", "error");
      return;
    }

    setSubmitting(true);
    const totalScore = totalQuestions * correctMark;

    try {
      // 1. Create the Test row
      const test = await createTest(supabase, {
        title,
        sections,
        duration: Number(duration),
        total_questions: Number(totalQuestions),
        correct_mark: Number(correctMark),
        negative_mark: Number(negativeMark),
        total_score: totalScore
      });

      // 2. Initialize the Attempt record
      // We pass selectedSubcategories to pool questions from!
      await startAttempt(supabase, user!.id, test.id, selectedSubcategories);

      toast("Test generated successfully! Starting session...", "success");
      router.push(`/test/${test.id}/session`);
    } catch (err: any) {
      toast(err.message || "Failed to create test", "error");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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

  const calculatedTotalScore = (totalQuestions || 0) * (correctMark || 0);

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-canvas py-8 md:py-12">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-8 pb-4 border-b border-hairline">
            <h1 className="text-3xl font-normal text-ink tracking-tight">Create Custom Test</h1>
            <p className="text-sm text-body mt-1">Configure parameters to generate an instant test attempt.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-xs font-semibold text-ink uppercase tracking-wider">
                Test Title
              </label>
              <input
                id="title"
                type="text"
                className="input-field"
                placeholder="e.g., Quantitative & Logical Ability Practice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
              />
              {validationErrors.title && <span className="text-xs text-error mt-0.5">{validationErrors.title}</span>}
            </div>


            {/* Categories & Subcategories checkbox tree */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                Question Filters (Categories & Subcategories)
              </label>
              
              <div className="border border-hairline rounded-md p-4 bg-surface-soft flex flex-col gap-4 max-h-72 overflow-y-auto">
                {categories.map((cat) => {
                  const catSubs = subCategories.filter((sub) => sub.category_id === cat.id);
                  const subIds = catSubs.map((s) => s.id);
                  const allSelected = subIds.length > 0 && subIds.every((id) => selectedSubcategories.includes(id));
                  const someSelected = subIds.some((id) => selectedSubcategories.includes(id)) && !allSelected;

                  return (
                    <div key={cat.id} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={cat.id}
                          className="h-4 w-4 rounded border-hairline accent-primary-ink"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someSelected;
                          }}
                          onChange={() => handleToggleCategory(cat.id, subIds)}
                          disabled={submitting}
                        />
                        <label htmlFor={cat.id} className="text-sm font-semibold text-ink cursor-pointer select-none">
                          {cat.name}
                        </label>
                      </div>
                      
                      {/* Subcategories */}
                      <div className="pl-6 flex flex-col gap-1.5 border-l border-hairline/80">
                        {catSubs.map((sub) => (
                          <div key={sub.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={sub.id}
                              className="h-3.5 w-3.5 rounded border-hairline accent-primary-ink"
                              checked={selectedSubcategories.includes(sub.id)}
                              onChange={() => handleToggleSubcategory(sub.id)}
                              disabled={submitting}
                            />
                            <label htmlFor={sub.id} className="text-xs text-body cursor-pointer select-none">
                              {sub.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {validationErrors.subcategories && <span className="text-xs text-error mt-0.5">{validationErrors.subcategories}</span>}
            </div>

            {/* Total Questions & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="totalQuestions" className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Total Questions
                </label>
                <input
                  id="totalQuestions"
                  type="number"
                  min="1"
                  className="input-field"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(Math.max(1, parseInt(e.target.value) || 0))}
                  disabled={submitting}
                />
                {validationErrors.totalQuestions && <span className="text-xs text-error mt-0.5">{validationErrors.totalQuestions}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="duration" className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Duration (minutes)
                </label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  className="input-field"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                  disabled={submitting}
                />
                {validationErrors.duration && <span className="text-xs text-error mt-0.5">{validationErrors.duration}</span>}
              </div>
            </div>

            {/* Marks & Scoring */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="correctMark" className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Marks per Correct Answer
                </label>
                <input
                  id="correctMark"
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="input-field"
                  value={correctMark}
                  onChange={(e) => setCorrectMark(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  disabled={submitting}
                />
                {validationErrors.correctMark && <span className="text-xs text-error mt-0.5">{validationErrors.correctMark}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="negativeMark" className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Negative Marks per Wrong Answer
                </label>
                <input
                  id="negativeMark"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  value={negativeMark}
                  onChange={(e) => setNegativeMark(Math.max(0, parseFloat(e.target.value) || 0))}
                  disabled={submitting}
                />
                {validationErrors.negativeMark && <span className="text-xs text-error mt-0.5">{validationErrors.negativeMark}</span>}
              </div>
            </div>

            {/* Total score auto-calculated */}
            <div className="card p-4 bg-surface-soft border border-hairline rounded-md mt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-muted uppercase text-xs tracking-wider">Total Score (Auto-calculated)</span>
                <span className="text-lg font-bold text-ink">{calculatedTotalScore} marks</span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-hairline">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center gap-2 cursor-pointer"
                disabled={submitting}
              >
                {submitting && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Create Test
              </button>
            </div>

          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
