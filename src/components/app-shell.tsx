"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const NAV_SECTIONS = [
  {
    label: "Resume Builder",
    items: [
      { label: "New Resume", href: "/new-resume", icon: "✦" },
      { label: "Improve Existing", href: "/improve-resume", icon: "⭐" },
      { label: "Templates", href: "/templates", icon: "▣" },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { label: "Bullet Suggestions", href: "/suggestions", icon: "◈" },
      { label: "Cover Letter", href: "/cover-letter", icon: "✉" },
      { label: "ATS Scoring", href: "/ats-score", icon: "◎" },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Market Trends", href: "/market-trends", icon: "↗" },
      { label: "Interview Prep", href: "/interview-prep", icon: "◆" },
    ],
  },
];

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export function AppShell({ title, subtitle, children, fullWidth }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/" className="block">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white font-bold text-sm">RF</div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">ResumeForge</p>
                <p className="text-[10px] text-[var(--sidebar-muted)] leading-tight">AI Resume Builder</p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="px-5 mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--sidebar-muted)]">
                {section.label}
              </p>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                  >
                    <span className="text-[15px] w-5 text-center leading-none">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/8 p-5">
          <Link href="/dashboard" className={`sidebar-nav-item mb-1 ${pathname === "/dashboard" ? "active" : ""}`}>
            <span className="text-[15px] w-5 text-center">⊞</span>
            <span>Dashboard</span>
          </Link>
          <div className="mt-4 rounded-lg bg-white/6 p-3">
            <p className="text-[11px] font-semibold text-[var(--sidebar-text)]">Local AI Active</p>
            <p className="text-[10px] text-[var(--sidebar-muted)] mt-0.5">Free · Private · No tracking</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-with-sidebar flex-1 atmosphere">
        {/* Top bar */}
        <div className="sticky top-0 z-40 border-b border-[var(--stroke)] bg-white/80 backdrop-blur-md px-8 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[var(--foreground)] leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-[var(--ink-soft)]">{subtitle}</p>}
          </div>
          {/* Mobile nav toggle placeholder */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-xs text-[var(--ink-soft)]">☰</span>
          </div>
        </div>

        {/* Page content */}
        <div className={`${fullWidth ? "" : "mx-auto max-w-6xl"} p-6 md:p-8`}>
          {children}
        </div>
      </div>
    </div>
  );
}
