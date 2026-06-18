"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/providers/ToastProvider";
import {
  createCategory,
  deleteCategory,
  editCategory,
} from "@/services/categories/action";
import { promoteUser } from "@/services/auth/server-actions";
import { Category } from "@/utils/type";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role?: string;
};

type QuestionRow = {
  id: number;
  question: string;
  user?: { name: string | null } | null;
};

export default function AdminClient({
  stats,
  categories,
  users,
  recentQuestions,
}: {
  stats: {
    questions: number;
    tests: number;
    users: number;
    attempts: number;
  };
  categories: Category[];
  users: UserRow[];
  recentQuestions: QuestionRow[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [categoryModal, setCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const openCreateCategory = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setCategoryModal(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name ?? "");
    setSlug(cat.slug);
    setCategoryModal(true);
  };

  const saveCategory = async () => {
    setLoading(true);
    const payload = { name, slug: slug || name.toLowerCase().replace(/\s+/g, "-") };

    const result = editingCategory
      ? await editCategory(editingCategory.id, payload)
      : await createCategory(payload);

    setLoading(false);

    if ("err" in result && result.err) {
      toast("Failed to save category", "error");
      return;
    }

    toast("Category saved", "success");
    setCategoryModal(false);
    router.refresh();
  };

  const handleDeleteCategory = async (id: number) => {
    const result = await deleteCategory(id);
    if ("err" in result && result.err) {
      toast("Failed to delete category", "error");
      return;
    }
    toast("Category deleted", "success");
    router.refresh();
  };

  const handlePromote = async (userId: string) => {
    const result = await promoteUser(userId);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast("User promoted to admin", "success");
    router.refresh();
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Admin Dashboard"
        description="Manage categories, users, and monitor platform activity."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Questions", value: stats.questions },
          { label: "Tests", value: stats.tests },
          { label: "Users", value: stats.users },
          { label: "Attempts", value: stats.attempts },
        ].map((s) => (
          <div key={s.label} className="card-soft text-center py-6">
            <p className="text-2xl font-medium text-ink">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-normal text-ink">Categories</h2>
            <Button size="sm" onClick={openCreateCategory}>
              Add Category
            </Button>
          </div>
          <div className="border border-hairline rounded-md divide-y divide-hairline">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{cat.name}</p>
                  <p className="text-xs text-muted">{cat.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditCategory(cat)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteCategory(cat.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="p-4 text-sm text-muted">No categories yet.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-normal text-ink mb-4">Recent Submissions</h2>
          <div className="space-y-3">
            {recentQuestions.map((q) => (
              <div key={q.id} className="card-soft py-3">
                <p className="text-sm text-ink line-clamp-1">{q.question}</p>
                <p className="text-xs text-muted mt-1">
                  by {q.user?.name ?? "Unknown"}
                </p>
              </div>
            ))}
            {recentQuestions.length === 0 && (
              <p className="text-sm text-muted">No recent activity.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-normal text-ink mb-4">Users</h2>
        <div className="border border-hairline rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-soft border-b border-hairline">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-ink">Name</th>
                <th className="text-left py-3 px-4 font-medium text-ink">Email</th>
                <th className="text-left py-3 px-4 font-medium text-ink">Role</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-hairline last:border-0">
                  <td className="py-3 px-4 text-body">{u.name ?? "—"}</td>
                  <td className="py-3 px-4 text-body">{u.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === "admin" ? "admin" : "default"}>
                      {u.role ?? "user"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {u.role !== "admin" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePromote(u.id)}
                      >
                        Promote
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={categoryModal}
        title={editingCategory ? "Edit Category" : "Add Category"}
        onClose={() => setCategoryModal(false)}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Quantitative Aptitude"
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="quantitative-aptitude"
            hint="Leave blank to auto-generate from name"
          />
          <Button onClick={saveCategory} disabled={loading || !name}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
