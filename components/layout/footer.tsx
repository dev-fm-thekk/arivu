import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-canvas border-t border-hairline py-16 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <span className="text-xl font-medium text-ink">arivu</span>
          <p className="mt-4 text-sm text-muted max-w-xs">
            A peer-to-peer learning platform for aptitude preparation. Built for
            the students of our college.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ink mb-4">
            Platform
          </h4>
          <ul className="space-y-2 text-sm text-body">
            <li>
              <Link href="/tests" className="text-link">
                Browse Tests
              </Link>
            </li>
            <li>
              <Link href="/questions/contribute" className="text-link">
                Contribute
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-link">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ink mb-4">
            Legal
          </h4>
          <ul className="space-y-2 text-sm text-body">
            <li>
              <Link href="#" className="text-link">
                About
              </Link>
            </li>
            <li>
              <Link href="#" className="text-link">
                Contact
              </Link>
            </li>
            <li>
              <Link href="#" className="text-link">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-hairline text-xs text-muted">
        <p>© 2026 arivu. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="section-title">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-body max-w-2xl">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
