import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/scan', label: 'Scan' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/faq', label: 'FAQ' },
  { href: '/history', label: 'History' },
];

export default function PageShell({
  children,
  title,
  subtitle,
  hideNavbar,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideNavbar?: boolean;
}) {
  return (
    <main className="min-h-screen bg-bg-primary text-white">
      {/* Sticky header removed — floating Navbar is used instead */}

      {(title || subtitle) && (
        <section className="max-w-6xl mx-auto px-6 md:px-10 pt-10">
          {title ? <h1 className="text-4xl md:text-5xl font-normal tracking-tight">{title}</h1> : null}
          {subtitle ? <p className="mt-4 text-sm tracking-[0.14em] text-white/70 max-w-3xl">{subtitle}</p> : null}
        </section>
      )}

      {children}

      <footer className="mt-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 flex flex-wrap items-center gap-3 justify-between text-[11px] tracking-[0.18em] text-white/60">
          <span>© {new Date().getFullYear()} NUTRISCAN</span>
          <div className="flex gap-3">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/profile">Profile</Link>
            <Link href="/settings">Settings</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}