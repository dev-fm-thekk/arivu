"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmail, signUpWithEmail } from "@/src/services/auth/server-actions";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/providers/ToastProvider";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time password strength check for sign up
  const getPasswordStrength = (pass: string) => {
    if (!pass) return "";
    if (pass.length < 6) return "weak";
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
    if (hasLetters && hasNumbers && hasSpecial && pass.length >= 8) return "strong";
    return "medium";
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (mode === "signup" && !name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (mode === "signup") {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (mode === "signup") {
      formData.append("name", name);
    }
    
    try {
      let result;
      if (mode === "signin") {
        result = await signInWithEmail(formData);
      } else {
        result = await signUpWithEmail(formData);
      }
      
      if (result?.error) {
        toast(result.error, "error");
        setErrors({ form: result.error });
      } else {
        toast(mode === "signin" ? "Welcome back!" : "Account created successfully!", "success");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      toast("An unexpected error occurred", "error");
      setErrors({ form: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);
  const strengthColors = {
    weak: "bg-error text-white",
    medium: "bg-signature-mustard text-ink",
    strong: "bg-success text-white",
    "": ""
  };

  return (
    <div className="w-full max-w-md bg-canvas border border-hairline rounded-lg p-8 shadow-md">
      {/* App Logo */}
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="text-3xl font-medium tracking-tight text-ink mb-2">
          arivu
        </Link>
        <h2 className="text-xl font-normal text-body">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
      </div>

      {/* Google Sign In */}
      <button
        onClick={async () => {
          try {
            setLoading(true);
            await signInWithGoogle();
          } catch (err: any) {
            toast("Google authentication failed", "error");
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        className="btn-secondary w-full flex items-center justify-center gap-3 !py-3 font-medium text-ink bg-canvas border border-hairline rounded-md hover:bg-surface-soft active:bg-surface-strong transition-colors cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.5 3.77v3.13h4.05c2.37-2.18 3.74-5.39 3.74-8.75z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.05-3.13c-1.12.75-2.56 1.2-3.88 1.2-2.99 0-5.52-2.02-6.42-4.74H1.43v3.24C3.41 21.6 7.42 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.58 14.42a7.17 7.17 0 0 1 0-4.84V6.34H1.43a11.96 11.96 0 0 0 0 11.32l4.15-3.24z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.42 0 3.41 2.4 1.43 6.34l4.15 3.24c.9-2.72 3.43-4.83 6.42-4.83z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative my-6 flex items-center">
        <div className="flex-grow border-t border-hairline" />
        <span className="mx-4 text-xs font-semibold text-muted uppercase">or</span>
        <div className="flex-grow border-t border-hairline" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.form && (
          <div className="text-xs font-semibold text-error bg-error/10 p-3 rounded-md border border-error/20">
            {errors.form}
          </div>
        )}

        {/* Name input (Sign Up only) */}
        {mode === "signup" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-ink uppercase tracking-wider">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="input-field"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            {errors.name && <span className="text-xs text-error mt-0.5">{errors.name}</span>}
          </div>
        )}

        {/* Email input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-ink uppercase tracking-wider">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {errors.email && <span className="text-xs text-error mt-0.5">{errors.email}</span>}
        </div>

        {/* Password input */}
        <div className="flex flex-col gap-1.5 relative">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-xs font-semibold text-ink uppercase tracking-wider">
              Password
            </label>
            {mode === "signin" && (
              <Link href="/forgot" className="text-xs text-link font-medium hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="input-field pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs font-medium cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <span className="text-xs text-error mt-0.5">{errors.password}</span>}

          {/* Password strength indicator */}
          {mode === "signup" && strength && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-semibold text-muted uppercase">Strength:</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${strengthColors[strength]}`}>
                {strength}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password (Sign Up only) */}
        {mode === "signup" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-semibold text-ink uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              className="input-field"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span className="text-xs text-error mt-0.5">{errors.confirmPassword}</span>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </button>
      </form>

      {/* Footer Link */}
      <div className="mt-8 text-center text-xs text-muted">
        {mode === "signin" ? (
          <>
            Don't have an account?{" "}
            <Link href="/signup" className="text-link font-semibold hover:underline">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/signin" className="text-link font-semibold hover:underline">
              Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
