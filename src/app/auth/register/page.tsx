"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { createClient } from "@/src/utils/supabase/client";

function passwordStrength(password: string): { label: string; width: string; color: string } {
  if (password.length === 0) return { label: "", width: "0%", color: "bg-hairline" };
  if (password.length < 6) return { label: "Weak", width: "33%", color: "bg-signature-peach" };
  if (password.length < 10) return { label: "Medium", width: "66%", color: "bg-signature-yellow" };
  return { label: "Strong", width: "100%", color: "bg-signature-mint" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    if (data.user) {
      await supabase.from("user").upsert({
        id: data.user.id,
        name,
        email,
        role: "user",
      });
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-canvas">
      <div className="w-full max-w-md">
        <Link href="/" className="text-xl font-medium text-ink block mb-8">
          arivu
        </Link>
        <h1 className="text-3xl font-normal text-ink mb-2">Create your account</h1>
        <p className="text-sm text-body mb-8">
          Join your peers in building a free aptitude question bank.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-ink">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {password && (
              <div className="mt-1">
                <div className="h-1 bg-hairline rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all`} style={{ width: strength.width }} />
                </div>
                <p className="text-xs text-muted mt-1">{strength.label}</p>
              </div>
            )}
          </div>

          <Input
            label="Confirm password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!passwordsMatch ? "Passwords do not match" : undefined}
          />

          {error && (
            <p className="text-sm text-error bg-surface-soft border border-hairline rounded-sm px-4 py-3">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading || !passwordsMatch}>
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="mt-8 text-sm text-body text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-link font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
