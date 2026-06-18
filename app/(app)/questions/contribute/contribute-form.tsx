"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/footer";
import { useToast } from "@/providers/ToastProvider";
import { submitQuestion } from "@/services/platform/actions";
import { Category } from "@/utils/type";

export default function ContributeQuestionPage({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("correctAnswer", correctAnswer);
    formData.set("tags", tags.join(","));

    const result = await submitQuestion(formData);
    console.log(result);

    setLoading(false);

    if (result.error) {
      toast(result.error, "error");
      return;
    }

    toast("Question submitted successfully!", "success");
    router.push("/questions/my");
  };

  return (
    <div className="page-container max-w-3xl">
      <PageHeader
        title="Contribute a Question"
        description="Submit an MCQ to help your peers prepare for aptitude tests."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Select label="Category" name="categoryId" required defaultValue="">
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>

        <div>
          <label className="text-sm font-medium text-ink block mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="input-field flex-1"
              placeholder="Add a tag and press Enter"
            />
            <Button type="button" variant="secondary" size="sm" onClick={addTag}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-surface-soft rounded-sm text-xs"
              >
                {tag}
                <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <Textarea
          label="Question"
          name="question"
          required
          placeholder="Enter your question here…"
        />

        {(["A", "B", "C", "D"] as const).map((letter) => (
          <Input
            key={letter}
            label={`Option ${letter}`}
            name={`option${letter}`}
            required
            placeholder={`Option ${letter}`}
          />
        ))}

        <div>
          <label className="text-sm font-medium text-ink block mb-2">Correct Answer</label>
          <div className="flex gap-3">
            {(["A", "B", "C", "D"] as const).map((letter) => (
              <label key={letter} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="correctAnswerRadio"
                  checked={correctAnswer === letter}
                  onChange={() => setCorrectAnswer(letter)}
                />
                {letter}
              </label>
            ))}
          </div>
        </div>

        <Textarea
          label="Explanation (optional)"
          name="explanation"
          placeholder="Explain why this is the correct answer…"
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit Question"}
        </Button>
      </form>
    </div>
  );
}
