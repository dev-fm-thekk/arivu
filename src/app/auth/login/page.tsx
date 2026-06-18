import { Suspense } from "react";
import LoginPage from "./login-content";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <LoginPage />
    </Suspense>
  );
}
