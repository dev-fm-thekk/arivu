"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, difficultyVariant } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/footer";
import { useToast } from "@/providers/ToastProvider";
import { updateProfile } from "@/services/auth/server-actions";

type ProfileData = {
  profile: {
    id: string;
    name: string | null;
    email: string | null;
    role?: string;
  } | null;
  contributed: number;
  testsTaken: number;
  bestScore: number;
  attempts: Array<{
    id: number;
    score: number;
    submitted_at: string | null;
    test_id: number;
    tests?: { title: string } | null;
  }>;
  questions: Array<{
    id: number;
    question: string;
    difficulty?: string | null;
    AptitudeCategories?: { name: string | null } | null;
  }>;
};

export default function ProfileClient({ data }: { data: ProfileData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(data.profile?.name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.set("name", name);
    const result = await updateProfile(formData);
    setSaving(false);

    if (result.error) {
      toast(result.error, "error");
      return;
    }

    toast("Profile updated", "success");
    router.refresh();
  };

  return (
    <div className="page-container max-w-4xl">
      <PageHeader title="Profile" description="Your account and activity summary." />

      <div className="card-soft mb-8 flex flex-col sm:flex-row items-start gap-6">
        <Avatar name={name || data.profile?.email} size="lg" />
        <div className="flex-1 space-y-4 w-full">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            value={data.profile?.email ?? ""}
            disabled
            hint="Email cannot be changed here"
          />
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="card-soft text-center py-6">
          <p className="text-2xl font-medium text-ink">{data.contributed}</p>
          <p className="text-xs text-muted mt-1">Contributed</p>
        </div>
        <div className="card-soft text-center py-6">
          <p className="text-2xl font-medium text-ink">{data.testsTaken}</p>
          <p className="text-xs text-muted mt-1">Tests Taken</p>
        </div>
        <div className="card-soft text-center py-6">
          <p className="text-2xl font-medium text-ink">{data.bestScore}%</p>
          <p className="text-xs text-muted mt-1">Best Score</p>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-normal text-ink mb-4">Attempt History</h2>
        {data.attempts.length === 0 ? (
          <p className="text-sm text-muted">No test attempts yet.</p>
        ) : (
          <div className="border border-hairline rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-soft border-b border-hairline">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-ink">Test</th>
                  <th className="text-left py-3 px-4 font-medium text-ink">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-ink">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.attempts.map((a) => (
                  <tr key={a.id} className="border-b border-hairline last:border-0">
                    <td className="py-3 px-4 text-body">
                      {a.tests?.title ?? "Test"}
                    </td>
                    <td className="py-3 px-4 font-medium text-ink">
                      {Math.round(Number(a.score))}%
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {a.submitted_at
                        ? new Date(a.submitted_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-normal text-ink mb-4">Contribution History</h2>
        {data.questions.length === 0 ? (
          <p className="text-sm text-muted">No questions contributed yet.</p>
        ) : (
          <div className="space-y-3">
            {data.questions.map((q) => (
              <div key={q.id} className="card-soft py-3">
                <p className="text-sm text-ink line-clamp-2">{q.question}</p>
                <div className="flex gap-2 mt-2">
                  {q.AptitudeCategories?.name && (
                    <Badge variant="category">{q.AptitudeCategories.name}</Badge>
                  )}
                  <Badge variant={difficultyVariant(q.difficulty)}>
                    {q.difficulty ?? "medium"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
