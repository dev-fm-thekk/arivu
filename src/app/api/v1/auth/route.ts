import { NextRequest, NextResponse } from "next/server";
import {
  signInWithEmail,
  signUpWithEmail,
  signOutAction,
  getCurrentUserProfile,
  updateProfile,
  promoteUser,
} from "@/src/services/auth/server-actions";
import { SignInAction as SignInWithGoogle } from "@/src/services/auth/actions"; // Google OAuth

export async function POST(req: NextRequest) {
  const { action, ...data } = await req.json();

  switch (action) {
    case "signInWithEmail": {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      const result = await signInWithEmail(formData);
      if (result?.error) {
        return NextResponse.json({ error: result.error }, { status: 401 });
      }
      return NextResponse.json({ message: "Signed in successfully" });
    }
    case "signUpWithEmail": {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      const result = await signUpWithEmail(formData);
      if (result?.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ message: "Signed up successfully" });
    }
    case "signOut": {
      await signOutAction();
      return NextResponse.json({ message: "Signed out successfully" });
    }
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  switch (action) {
    case "getCurrentUserProfile": {
      const profile = await getCurrentUserProfile();
      if (!profile) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json(profile);
    }
    case "signInWithGoogle": {
      const result = await SignInWithGoogle();
      if (result?.data?.url) {
        return NextResponse.redirect(result.data.url);
      }
      return NextResponse.json({ error: "Google Sign-in failed" }, { status: 500 });
    }
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const { action, ...data } = await req.json();

  switch (action) {
    case "updateProfile": {
      const formData = new FormData();
      formData.append("name", data.name);
      const result = await updateProfile(formData);
      if (result?.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ message: "Profile updated successfully" });
    }
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
