"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/src/components/layout/footer";
import { Badge, difficultyVariant } from "@/src/components/ui/badge";
import { EmptyState } from "@/src/components/ui/empty-state";
import { ConfirmModal } from "@/src/components/ui/modal";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/providers/ToastProvider";
import { deleteQuestion } from "@/src/services/platform/actions";

type QuestionRow = {
  id: number;
  question: string;
  difficulty?: string | null;
  AptitudeCategories?: { name: string | null } | null;
};

export default function MyQuestionsClient({
  questions,
}: {
  questions: QuestionRow[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    const result = await deleteQuestion(deleteId);
    setLoading(false);
    setDeleteId(null);

    if (result.error) {
      toast(result.error, "error");
      return;
    }

    toast("Question deleted", "success");
    router.refresh();
  };

  return (
    <div className="page-container">
      <PageHeader
        title="My Contributed Questions"
        description="Questions you've submitted to the bank."
        action={
          <Link href="/questions/contribute" className="btn-primary btn-sm">
            Contribute New
          </Link>
        }
      />

      {questions.length === 0 ? (
        <EmptyState
          icon="✍️"
          title="No questions yet"
          description="Share your knowledge by contributing your first MCQ."
          actionLabel="Contribute your first question"
          actionHref="/questions/contribute"
        />
      ) : (
        <div className="grid gap-4">
          {questions.map((q) => (
            <div key={q.id} className="card-soft flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-ink line-clamp-2 mb-3">{q.question}</p>
                <div className="flex flex-wrap gap-2">
                  {q.AptitudeCategories?.name && (
                    <Badge variant="category">{q.AptitudeCategories.name}</Badge>
                  )}
                  <Badge variant={difficultyVariant(q.difficulty)}>
                    {q.difficulty ?? "medium"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeleteId(q.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteId !== null}
        title="Delete question?"
        description="This action cannot be undone. The question will be removed from the bank."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={loading}
      />
    </div>
  );
}
