import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-hairline bg-canvas py-12 text-sm text-muted">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-base font-semibold text-ink">arivu</span>
            <p className="text-xs text-muted text-center md:text-left">
              Crowdsourced MCQ Aptitude Platform for students.
            </p>
          </div>
          
          <div className="flex gap-6">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-ink transition-colors"
            >
              GitHub
            </a>
            <Link href="/about" className="hover:text-ink transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-ink transition-colors">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="mt-8 border-t border-hairline pt-6 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} arivu. Open-source, free under MIT license.
        </div>
      </div>
    </footer>
  );
}
