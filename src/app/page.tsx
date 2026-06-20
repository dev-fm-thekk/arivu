"use client";

import Link from "next/link";
import { Navbar } from "@/src/components/layouts/Navbar";
import { Footer } from "@/src/components/layouts/Footer";
import { useAuth } from "@/src/hooks/useAuth";

export default function LandingPage() {
  const { user } = useAuth();

  const handleScrollDown = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-canvas border-b border-hairline py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-tight text-ink mb-6">
              Practice aptitude with <br className="hidden md:inline" />
              confidence, completely free.
            </h1>
            <p className="text-base md:text-lg text-body mb-8 max-w-xl">
              An open-source mock test platform designed for students. Create custom tests from our curated question bank, practice in a timed environment, and review instant analytics.
            </p>
            <div className="flex flex-row gap-4 w-full sm:w-auto">
              <Link 
                href={user ? "/dashboard" : "/signup"} 
                className="btn-primary w-full sm:w-auto text-center"
              >
                {user ? "Go to Dashboard" : "Get Started"}
              </Link>
              <button 
                onClick={handleScrollDown}
                className="btn-secondary w-full sm:w-auto text-center"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Visual Column (Interactive Test UI Mockup) */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className="w-full max-w-md bg-canvas border border-hairline rounded-lg shadow-xl overflow-hidden p-6 select-none bg-surface-soft">
              {/* Mock App Header */}
              <div className="flex justify-between items-center pb-4 border-b border-hairline">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">Aptitude Test</span>
                <span className="text-sm font-semibold text-info flex items-center gap-1.5 bg-info/10 px-2.5 py-1 rounded-md">
                  <span className="h-2 w-2 rounded-full bg-info animate-ping" />
                  14:38
                </span>
              </div>
              
              {/* Mock Question */}
              <div className="py-6">
                <div className="text-xs text-muted mb-2 font-medium">Question 4 of 20</div>
                <div className="text-sm font-medium text-ink mb-4 leading-relaxed">
                  If the price of an item is increased by 20% and then decreased by 20%, what is the net change in price?
                </div>
                
                {/* Options */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3 border border-hairline bg-canvas p-3 rounded-md">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-hairline text-[10px] font-bold text-muted bg-surface-soft">A</div>
                    <span className="text-xs text-body">4% increase</span>
                  </div>
                  <div className="flex items-center gap-3 border-2 border-primary-ink bg-canvas p-3 rounded-md shadow-xs">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-ink text-[10px] font-bold text-white">B</div>
                    <span className="text-xs text-ink font-medium">4% decrease</span>
                  </div>
                  <div className="flex items-center gap-3 border border-hairline bg-canvas p-3 rounded-md">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-hairline text-[10px] font-bold text-muted bg-surface-soft">C</div>
                    <span className="text-xs text-body">No change</span>
                  </div>
                  <div className="flex items-center gap-3 border border-hairline bg-canvas p-3 rounded-md">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-hairline text-[10px] font-bold text-muted bg-surface-soft">D</div>
                    <span className="text-xs text-body">2% decrease</span>
                  </div>
                </div>
              </div>

              {/* Bottom control */}
              <div className="flex justify-between items-center pt-4 border-t border-hairline">
                <span className="text-xs text-muted font-medium hover:underline cursor-pointer">Clear Response</span>
                <div className="flex gap-2">
                  <button className="btn-secondary !py-2 !px-3 text-xs rounded-lg disabled:opacity-50" disabled>Prev</button>
                  <button className="btn-primary !py-2 !px-4 text-xs rounded-lg">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-surface-soft py-24 border-b border-hairline scroll-mt-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12 text-center">
          <span className="text-xs font-semibold text-muted uppercase tracking-widest">Everything You Need</span>
          <h2 className="text-3xl font-normal tracking-tight text-ink mt-3 mb-16">
            Designed for high performance preparation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="card p-8 bg-canvas border border-hairline rounded-md text-left flex flex-col justify-between shadow-xs">
              <div>
                <div className="h-10 w-10 flex items-center justify-center rounded bg-signature-coral/10 text-signature-coral text-lg mb-6">📚</div>
                <h3 className="text-lg font-medium text-ink mb-3">Rich Question Bank</h3>
                <p className="text-sm text-body leading-relaxed">
                  Practice questions across different categories and subcategories curated specifically for aptitude tests.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 bg-canvas border border-hairline rounded-md text-left flex flex-col justify-between shadow-xs">
              <div>
                <div className="h-10 w-10 flex items-center justify-center rounded bg-signature-forest/10 text-signature-forest text-lg mb-6">⚙️</div>
                <h3 className="text-lg font-medium text-ink mb-3">Custom Tests</h3>
                <p className="text-sm text-body leading-relaxed">
                  Tailor your tests by choosing the duration, sections, categories, scoring criteria, and question count.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 bg-canvas border border-hairline rounded-md text-left flex flex-col justify-between shadow-xs">
              <div>
                <div className="h-10 w-10 flex items-center justify-center rounded bg-info/10 text-info text-lg mb-6">📊</div>
                <h3 className="text-lg font-medium text-ink mb-3">Instant Analytics</h3>
                <p className="text-sm text-body leading-relaxed">
                  Get details on accuracy, score calculations, skipped questions, and explanations immediately on submit.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card p-8 bg-canvas border border-hairline rounded-md text-left flex flex-col justify-between shadow-xs">
              <div>
                <div className="h-10 w-10 flex items-center justify-center rounded bg-signature-mustard/10 text-signature-mustard text-lg mb-6">🔓</div>
                <h3 className="text-lg font-medium text-ink mb-3">Completely Free</h3>
                <p className="text-sm text-body leading-relaxed">
                  An open-source product built for learners. No paywalls, no advertising, no credit card required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-canvas py-24 border-b border-hairline">
        <div className="mx-auto max-w-7xl px-6 md:px-12 text-center">
          <span className="text-xs font-semibold text-muted uppercase tracking-widest">Three Simple Steps</span>
          <h2 className="text-3xl font-normal tracking-tight text-ink mt-3 mb-16">
            How to get started with arivu
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-ink text-white font-semibold mb-6">1</div>
              <h3 className="text-lg font-medium text-ink mb-2">Create Account</h3>
              <p className="text-sm text-body max-w-xs leading-relaxed">
                Sign up via email or Google OAuth in just a few seconds to initialize your profile.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-ink text-white font-semibold mb-6">2</div>
              <h3 className="text-lg font-medium text-ink mb-2">Generate Custom Test</h3>
              <p className="text-sm text-body max-w-xs leading-relaxed">
                Configure question filters, section headers, duration limits, and scoring marks to generate your test.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-ink text-white font-semibold mb-6">3</div>
              <h3 className="text-lg font-medium text-ink mb-2">Attempt and Review</h3>
              <p className="text-sm text-body max-w-xs leading-relaxed">
                Take the test in our focused test environment, auto-submit when the timer ends, and check your report.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
