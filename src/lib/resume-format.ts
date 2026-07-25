export interface SerializablePersonal {
  fullName: string;
  targetRole: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
}

export interface SerializableWorkEntry {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface SerializableEduEntry {
  institution: string;
  degree: string;
  field: string;
  endYear: string;
}

export interface SerializableProjectEntry {
  name: string;
  role: string;
  year: string;
  description: string;
}

/** Flattens the structured resume form into plain text for ATS scoring, AI prompts, and export fallbacks. */
export function serializeResumeForm(
  personal: SerializablePersonal,
  experience: SerializableWorkEntry[],
  education: SerializableEduEntry[],
  skills: string[],
  certifications: string,
  projects: SerializableProjectEntry[] = []
): string {
  const parts: string[] = [];
  if (personal.fullName) parts.push(personal.fullName);
  if (personal.targetRole) parts.push(personal.targetRole);
  const contacts = [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean);
  if (contacts.length) parts.push(contacts.join(" | "));
  if (personal.summary) {
    parts.push("");
    parts.push("PROFESSIONAL SUMMARY");
    parts.push(personal.summary);
  }
  if (experience.some((e) => e.company || e.title)) {
    parts.push("");
    parts.push("EXPERIENCE");
    [...experience]
      .sort((a, b) => (b.current ? 1 : 0) - (a.current ? 1 : 0) || b.startDate.localeCompare(a.startDate))
      .forEach((e) => {
        if (!e.company && !e.title) return;
        parts.push(`${e.title}${e.company ? ` at ${e.company}` : ""}${e.location ? ` (${e.location})` : ""}`);
        if (e.startDate || e.endDate || e.current) parts.push(`${e.startDate || ""} – ${e.current ? "Present" : e.endDate || ""}`);
        if (e.description) parts.push(e.description);
        parts.push("");
      });
  }
  if (projects.some((p) => p.name)) {
    parts.push("PROJECTS");
    projects
      .filter((p) => p.name)
      .forEach((p) => {
        parts.push(`${p.name}${p.role ? ` — ${p.role}` : ""}${p.year ? ` (${p.year})` : ""}`);
        if (p.description) parts.push(p.description);
        parts.push("");
      });
  }
  if (education.some((e) => e.institution)) {
    parts.push("EDUCATION");
    education
      .filter((e) => e.institution || e.degree)
      .forEach((e) => parts.push(`${e.degree}${e.field ? ` in ${e.field}` : ""}${e.institution ? ` – ${e.institution}` : ""}${e.endYear ? ` (${e.endYear})` : ""}`));
  }
  if (skills.length) {
    parts.push("");
    parts.push("SKILLS");
    parts.push(skills.join(", "));
  }
  if (certifications) {
    parts.push("");
    parts.push("CERTIFICATIONS");
    parts.push(certifications);
  }
  return parts.join("\n");
}
