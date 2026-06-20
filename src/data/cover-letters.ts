export interface CoverLetterTemplate {
  id: string;
  name: string;
  tone: "professional" | "friendly" | "executive";
}

export const coverLetterTemplates: CoverLetterTemplate[] = [
  { id: "professional", name: "Professional", tone: "professional" },
  { id: "friendly", name: "Friendly & Approachable", tone: "friendly" },
  { id: "executive", name: "Executive", tone: "executive" },
];

export function generateCoverLetter(
  candidateName: string,
  targetRole: string,
  targetCompany: string,
  yearsOfExperience: number,
  keyAchievements: string,
  tone: "professional" | "friendly" | "executive" = "professional"
): string {
  const openings = {
    professional: `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${targetRole} position at ${targetCompany}.`,
    friendly: `Hi there,\n\nI'm excited to apply for the ${targetRole} role at ${targetCompany}!`,
    executive: `To the ${targetCompany} Leadership Team,\n\nI am pleased to submit my candidacy for the ${targetRole} position.`,
  };

  const bodyPhrase =
    yearsOfExperience < 3
      ? `With a solid foundation in my field, I bring fresh perspectives and a commitment to growth.`
      : yearsOfExperience < 8
        ? `With ${yearsOfExperience} years of progressive experience, I have developed expertise in driving measurable impact.`
        : `Throughout my ${yearsOfExperience}-year career, I have led transformational initiatives and built high-performing teams.`;

  const closing =
    tone === "executive"
      ? `I look forward to discussing how my experience aligns with ${targetCompany}'s vision. Thank you for considering my application.\n\nSincerely,\n${candidateName}`
      : `I'd love to chat about how I can contribute to ${targetCompany}'s mission. Thanks for your consideration!\n\nBest,\n${candidateName}`;

  return [
    openings[tone],
    "",
    bodyPhrase,
    "",
    `Key achievements that demonstrate my capabilities: ${keyAchievements}`,
    "",
    "I am particularly drawn to your company's focus on innovation and commitment to excellence.",
    "",
    closing,
  ].join("\n");
}
