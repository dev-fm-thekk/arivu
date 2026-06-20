"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/src/components/layouts/Navbar";
import { Footer } from "@/src/components/layouts/Footer";
import { useAuth } from "@/src/hooks/useAuth";
import { getCurrentUserProfile, updateProfile } from "@/src/services/auth/server-actions";
import { useToast } from "@/src/providers/ToastProvider";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      try {
        setLoading(true);
        const data = await getCurrentUserProfile();
        setProfile(data);
        if (data) {
          setName(data.name || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast("Name cannot be empty", "error");
      return;
    }

    setUpdating(true);
    const formData = new FormData();
    formData.append("name", name);

    try {
      const res = await updateProfile(formData);
      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("Profile updated successfully!", "success");
        // Update local state
        setProfile((prev: any) => prev ? { ...prev, name } : null);
      }
    } catch (err: any) {
      toast("Failed to update profile", "error");
    } finally {
      setUpdating(false);
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

  if (!user) return null;

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-canvas py-8 md:py-12">
        <div className="mx-auto max-w-md px-6">
          <div className="mb-8 pb-4 border-b border-hairline">
            <h1 className="text-3xl font-normal text-ink tracking-tight">Your Profile</h1>
            <p className="text-sm text-body mt-1">Manage your user profile details.</p>
          </div>

          <div className="card bg-canvas border border-hairline rounded-md p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b border-hairline pb-4">
              <div className="h-14 w-14 rounded-full bg-primary-ink text-white font-bold text-xl flex items-center justify-center uppercase select-none">
                {user.email?.[0]}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-base font-semibold text-ink truncate">{profile?.name || "Student User"}</h3>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  className="input-field bg-surface-soft opacity-75 cursor-not-allowed"
                  value={user.email || ""}
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Display Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  disabled={updating}
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2 cursor-pointer"
              >
                {updating && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Update Profile
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
