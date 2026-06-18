import Link from "next/link";
import { createClient } from "@/src/utils/supabase/server";
import { PublicNavbar } from "@/src/components/layout/navbar";

export default async function LandingPage() {
  const supabase = await createClient();
  
  // Fetch some stats
  const { count: questionCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  const { count: testCount } = await supabase.from('tests').select('*', { count: 'exact', head: true });
  const { count: userCount } = await supabase.from('user').select('*', { count: 'exact', head: true });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="bg-canvas pt-24 pb-24 px-6 md:px-12 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal max-w-4xl leading-tight tracking-tight">
          Crowdsourced MCQ aptitude platform for college students.
        </h1>
        <p className="mt-8 text-lg md:text-xl text-body max-w-2xl leading-relaxed">
          Contribute questions, create tests, and practice for free. Built by students, for students.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link href="/auth/register" className="btn-primary">
            Get started for free
          </Link>
          <Link href="/tests" className="btn-secondary">
            Browse tests
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-surface-soft py-16 px-6 md:px-12 border-y border-hairline">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <p className="text-4xl font-medium text-ink">{questionCount || 0}</p>
            <p className="text-sm uppercase tracking-widest text-muted mt-2">Questions</p>
          </div>
          <div>
            <p className="text-4xl font-medium text-ink">{testCount || 0}</p>
            <p className="text-sm uppercase tracking-widest text-muted mt-2">Tests</p>
          </div>
          <div>
            <p className="text-4xl font-medium text-ink">{userCount || 0}</p>
            <p className="text-sm uppercase tracking-widest text-muted mt-2">Students</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-soft p-8 rounded-lg border border-hairline">
            <div className="w-12 h-12 bg-signature-peach rounded-md mb-6 flex items-center justify-center">
              <span className="text-2xl">✍️</span>
            </div>
            <h3 className="text-xl font-medium mb-4">Contribute</h3>
            <p className="text-body leading-relaxed">
              Help your peers by submitting MCQ questions with detailed explanations.
            </p>
          </div>
          <div className="bg-surface-soft p-8 rounded-lg border border-hairline">
            <div className="w-12 h-12 bg-signature-mint rounded-md mb-6 flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
            <h3 className="text-xl font-medium mb-4">Practice</h3>
            <p className="text-body leading-relaxed">
              Take mock tests under a time limit and get instant feedback on your performance.
            </p>
          </div>
          <div className="bg-surface-soft p-8 rounded-lg border border-hairline">
            <div className="w-12 h-12 bg-signature-yellow rounded-md mb-6 flex items-center justify-center">
              <span className="text-2xl">🆓</span>
            </div>
            <h3 className="text-xl font-medium mb-4">Always Free</h3>
            <p className="text-body leading-relaxed">
              No subscriptions, no hidden costs. Access high-quality aptitude materials for free.
            </p>
          </div>
        </div>
      </section>

      {/* Signature Coral Card CTA */}
      <section className="px-6 md:px-12 pb-24">
        <div className="bg-signature-coral text-white p-12 md:p-16 rounded-lg max-w-7xl mx-auto flex flex-col items-start">
          <h2 className="text-3xl md:text-4xl font-normal text-white leading-tight max-w-2xl mb-8">
            Ready to ace your next placement test?
          </h2>
          <Link href="/auth/register" className="btn-secondary bg-white text-ink border-none hover:bg-signature-cream">
            Join the community
          </Link>
        </div>
      </section>
    </div>
  );
}
