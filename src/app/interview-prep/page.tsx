"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getInterviewTips } from "@/data/interview-questions";

export default function InterviewPrepPage() {
  const [selectedRole, setSelectedRole] = useState("product-manager");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const tips = getInterviewTips(selectedRole);

  return (
    <AppShell
      title="Interview Prep"
      subtitle="Practice answering common questions with role-specific guidance."
    >
      <section className="grid gap-4 md:grid-cols-4">
        {["product-manager", "software-engineer", "data-analyst", "marketing-manager"].map(
          (role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`rounded-lg px-4 py-2 font-medium transition ${
                selectedRole === role
                  ? "button-primary"
                  : "button-secondary"
              }`}
            >
              {role
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </button>
          )
        )}
      </section>

      <section className="mt-6 space-y-3">
        {tips.map((question, index) => (
          <article key={index} className="card">
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="flex w-full items-start gap-3 p-5"
            >
              <span className="mt-1 flex-shrink-0 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold text-white">
                {question.category}
              </span>
              <div className="flex-1 text-left">
                <p className="font-semibold text-[var(--foreground)]">{question.question}</p>
              </div>
              <span className="text-lg text-[var(--ink-soft)]">
                {expandedIndex === index ? "−" : "+"}
              </span>
            </button>

            {expandedIndex === index ? (
              <div className="border-t border-[var(--stroke)] p-5">
                <p className="text-sm font-medium text-[var(--accent-alt)]">Role-Specific Tips</p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  {question.tipsByRole[selectedRole] || question.tipsByRole["product-manager"]}
                </p>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </AppShell>
  );
}
