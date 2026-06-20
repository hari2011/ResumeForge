import mammoth from "mammoth";

function normalizeExtractedText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  // pdf-parse@2.x: getText() returns { text: string, pages: { text: string, num: number }[], total: number }
  // Use require() to bypass Turbopack bundling (serverExternalPackages handles this).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PDFParse } = require("pdf-parse") as {
    PDFParse: new (opts: { data: Buffer }) => {
      load: (b: Buffer) => Promise<void>;
      getText: () => Promise<{ text: string; pages: Array<{ text: string; num: number }> }>;
      destroy: () => void;
    };
  };
  const parser = new PDFParse({ data: buffer });
  try {
    await parser.load(buffer);
    const result = await parser.getText();
    // Prefer the pre-joined full text; fall back to joining per-page text
    const text = result.text || (result.pages ?? []).map((p) => p.text).join("\n");
    return normalizeExtractedText(text);
  } finally {
    parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const parsed = await mammoth.extractRawText({ buffer });
  return normalizeExtractedText(parsed.value);
}

function extractTxtText(buffer: Buffer): string {
  return normalizeExtractedText(buffer.toString("utf-8"));
}

export async function parseResumeFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const mimeType = file.type;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (name.endsWith(".pdf") || mimeType === "application/pdf") {
    return extractPdfText(buffer);
  }

  if (
    name.endsWith(".docx") ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocxText(buffer);
  }

  if (name.endsWith(".txt") || mimeType === "text/plain") {
    return extractTxtText(buffer);
  }

  throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
}
