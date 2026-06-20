"use client";

import { useState } from "react";

interface ExportButtonProps {
  resumeContent: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string;
    templateId?: string;
    sections: Array<{ title: string; bullets: string[] }>;
  };
}

export function ExportButton({ resumeContent }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport(format: "pdf" | "docx" | "txt") {
    setLoading(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          content: resumeContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume.${format === "docx" ? "docx" : format === "pdf" ? "pdf" : "txt"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Could not export resume. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleExport("pdf")}
        className="button-primary rounded-lg px-4 py-2 text-sm font-semibold"
        disabled={loading}
      >
        {loading ? "Exporting..." : "Export PDF"}
      </button>
      <button
        onClick={() => handleExport("docx")}
        className="button-secondary rounded-lg px-4 py-2 text-sm font-semibold"
        disabled={loading}
      >
        Export DOCX
      </button>
      <button
        onClick={() => handleExport("txt")}
        className="button-secondary rounded-lg px-4 py-2 text-sm font-semibold"
        disabled={loading}
      >
        Export TXT
      </button>
    </div>
  );
}
