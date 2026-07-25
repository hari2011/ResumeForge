"use client";

import { useEffect, useState } from "react";
import { ResumeDocument, ResumeDocumentData } from "@/components/resume-document";

export default function ResumePrintPage() {
  const [data, setData] = useState<ResumeDocumentData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("rf_print_payload");
      if (!raw) {
        setNotFound(true);
        return;
      }
      setData(JSON.parse(raw) as ResumeDocumentData);
    } catch {
      setNotFound(true);
    }
  }, []);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => window.print(), 400);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 text-center">
        <div>
          <p className="text-lg font-bold text-[var(--foreground)] mb-2">No resume data found</p>
          <p className="text-sm text-[var(--ink-soft)]">Go back to the builder and click &ldquo;Download PDF&rdquo; to open this view.</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#e8e4db] py-8">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] items-center justify-between px-2">
        <button onClick={() => window.close()} className="button-ghost px-3 py-2 text-sm">← Close</button>
        <div className="flex items-center gap-2">
          <p className="text-xs text-[var(--ink-soft)]">Pixel-perfect export — matches your chosen template exactly</p>
          <button onClick={() => window.print()} className="button-primary px-5 py-2.5 text-sm">🖨 Print / Save as PDF</button>
        </div>
      </div>
      <ResumeDocument data={data} />
    </div>
  );
}
