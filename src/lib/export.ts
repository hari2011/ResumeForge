import { Packer, Document, Paragraph } from "docx";
import jsPDF from "jspdf";
import { resumeTemplates } from "@/data/templates";

function resolveTemplate(templateId?: string) {
  return resumeTemplates.find((template) => template.id === templateId) || resumeTemplates[0];
}

export async function exportToDocx(
  content: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string;
    templateId?: string;
    sections: Array<{ title: string; bullets: string[] }>;
  }
): Promise<Buffer> {
  const template = resolveTemplate(content.templateId);

  // Create a simple text-based DOCX with plain formatting
  let fullText = `${content.name}\n`;
  fullText += `${content.email} | ${content.phone}\n`;
  fullText += `${content.title}\n\n`;
  fullText += `Template: ${template.name}\n\n`;
  fullText += `${content.summary}\n\n`;

  for (const section of content.sections) {
    fullText += `${section.title}\n`;
    for (const bullet of section.bullets) {
      fullText += `  • ${bullet}\n`;
    }
    fullText += "\n";
  }

  const doc = new Document({
    sections: [
      {
        children: [new Paragraph(fullText)],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export function exportToPdf(
  content: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string;
    templateId?: string;
    sections: Array<{ title: string; bullets: string[] }>;
  }
): Buffer {
  const template = resolveTemplate(content.templateId);

  const doc = new jsPDF();
  let yPosition = 20;

  doc.setTextColor(template.colors.accent);
  doc.setFontSize(18);
  doc.text(content.name, 20, yPosition);
  yPosition += 10;

  doc.setTextColor(template.colors.primary);
  doc.setFontSize(11);
  doc.text(`${content.email} | ${content.phone}`, 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("", "italic");
  doc.text(content.title, 20, yPosition);
  yPosition += 8;

  doc.setFont("", "normal");
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(content.summary, 170);
  doc.text(summaryLines, 20, yPosition);
  yPosition += summaryLines.length * 4 + 5;

  for (const section of content.sections) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont("", "bold");
    doc.setTextColor(template.colors.accent);
    doc.setFontSize(11);
    doc.text(section.title, 20, yPosition);
    yPosition += 8;

    doc.setFont("", "normal");
    doc.setTextColor(template.colors.primary);
    doc.setFontSize(10);

    for (const bullet of section.bullets) {
      const bulletLines = doc.splitTextToSize(`• ${bullet}`, 165);
      doc.text(bulletLines, 25, yPosition);
      yPosition += bulletLines.length * 4 + 2;

      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    }

    yPosition += 3;
  }

  return Buffer.from(doc.output("arraybuffer"));
}

export function exportToPlainText(
  content: {
    name: string;
    title: string;
    email: string;
    phone: string;
    summary: string;
    templateId?: string;
    sections: Array<{ title: string; bullets: string[] }>;
  }
): string {
  const template = resolveTemplate(content.templateId);

  const lines = [
    content.name.toUpperCase(),
    "",
    `${content.email} | ${content.phone}`,
    content.title,
    `Template: ${template.name}`,
    "",
    content.summary,
    "",
  ];

  for (const section of content.sections) {
    lines.push(`${section.title.toUpperCase()}`);
    lines.push("");
    for (const bullet of section.bullets) {
      lines.push(`• ${bullet}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
