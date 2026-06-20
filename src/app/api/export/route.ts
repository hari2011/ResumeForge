import { NextRequest, NextResponse } from "next/server";
import { exportToPdf, exportToDocx, exportToPlainText } from "@/lib/export";

interface ExportPayload {
  format: "pdf" | "docx" | "txt";
  content: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string;
    templateId?: string;
    sections: Array<{ title: string; bullets: string[] }>;
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ExportPayload;
  const payload = body;

  if (!payload.format || !payload.content) {
    return NextResponse.json(
      { error: "format and content are required" },
      { status: 400 }
    );
  }

  try {
    if (payload.format === "pdf") {
      const buffer = exportToPdf(payload.content);
      const uint8Array = new Uint8Array(buffer);
      return new Response(uint8Array, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="resume.pdf"',
        },
      });
    }

    if (payload.format === "docx") {
      const buffer = await exportToDocx(payload.content);
      const uint8Array = new Uint8Array(buffer);
      return new Response(uint8Array, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": 'attachment; filename="resume.docx"',
        },
      });
    }

    if (payload.format === "txt") {
      const text = exportToPlainText(payload.content);
      return new Response(text, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": 'attachment; filename="resume.txt"',
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
