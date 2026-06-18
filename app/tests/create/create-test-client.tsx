"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/providers/ToastProvider";
import { createTestFromSelection } from "@/services/platform/actions";
import { Category, Question } from "@/utils/type";

type QuestionWithCat = Question & {
  AptitudeCategories?: { name: string | null } | null;
};

export default function CreateTestClient({
  questions,
  categories,
}: {
  questions: QuestionWithCat[];
  categories: Category[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [selected, setSelected] = useState<number[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (categoryFilter && q.category_id !== Number(categoryFilter)) return false;
      if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [questions, categoryFilter, search]);

  const toggleQuestion = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const removeSelected = (id: number) => {
    setSelected((prev) => prev.filter((x) => x !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await createTestFromSelection(title, timeLimit, selected);
    setLoading(false);

    if (result.error) {
      toast(result.error, "error");
      return;
    }

    toast("Test created!", "success");
    router.push(`/tests/${result.testId}`);
  };

  const selectedQuestions = selected
    .map((id) => questions.find((q) => q.id === id))
    .filter(Boolean) as QuestionWithCat[];

  return (
    <div className="page-container">
      <PageHeader
        title="Create a Test"
        description="Pick questions from the bank to build your mock test."
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Test title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quantitative Aptitude Mock #1"
            />
            <Input
              label="Time limit (minutes)"
              type="number"
              required
              min={1}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              label="Category filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Input
              label="Search questions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Keyword or tag…"
            />
          </div>

          <div className="border border-hairline rounded-md divide-y divide-hairline max-h-[480px] overflow-y-auto">
            {filtered.map((q) => (
              <label
                key={q.id}
                className="flex items-start gap-3 p-4 cursor-pointer active:bg-surface-soft"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(q.id)}
                  onChange={() => toggleQuestion(q.id)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm text-ink line-clamp-2">{q.question}</p>
                  {q.AptitudeCategories?.name && (
                    <Badge variant="category" className="mt-2">
                      {q.AptitudeCategories.name}
                    </Badge>
                  )}
                </div>
              </label>
            ))}
            {filtered.length === 0 && (
              <p className="p-6 text-sm text-muted text-center">No questions match your filters.</p>
            )}
          </div>
        </div>

        <aside className="card-soft h-fit sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-ink">Selected</h2>
            <Badge>{selected.length} questions</Badge>
          </div>
          <ul className="space-y-2 mb-6 max-h-64 overflow-y-auto">
            {selectedQuestions.map((q, i) => (
              <li
                key={q.id}
                className="flex items-start justify-between gap-2 text-sm border-b border-hairline pb-2"
              >
                <span className="line-clamp-2 flex-1">
                  {i + 1}. {q.question}
                </span>
                <button
                  type="button"
                  onClick={() => removeSelected(q.id)}
                  className="text-muted shrink-0"
                >
                  ×
                </button>
              </li>
            ))}
            {selected.length === 0 && (
              <p className="text-sm text-muted">Select questions from the bank.</p>
            )}
          </ul>
          <Button type="submit" className="w-full" disabled={loading || selected.length === 0}>
            {loading ? "Creating…" : "Create Test"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
