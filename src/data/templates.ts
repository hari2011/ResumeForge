export interface ResumeTemplate {
  id: string;
  name: string;
  category: "modern" | "classic" | "creative" | "minimal";
  colors: { primary: string; accent: string; background: string };
  description: string;
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: "modern-clean",
    name: "Modern Clean",
    category: "modern",
    colors: {
      primary: "#1b1f23",
      accent: "#f26722",
      background: "#f6f3ea",
    },
    description: "Contemporary design with warm accents and clear hierarchy.",
  },
  {
    id: "classic-pro",
    name: "Classic Professional",
    category: "classic",
    colors: {
      primary: "#0f3460",
      accent: "#16a085",
      background: "#f5f5f5",
    },
    description: "Timeless layout optimized for traditional industries.",
  },
  {
    id: "minimal-tech",
    name: "Minimal Tech",
    category: "minimal",
    colors: {
      primary: "#1a1a1a",
      accent: "#00d4ff",
      background: "#ffffff",
    },
    description: "Sleek, minimal design perfect for tech and startup roles.",
  },
  {
    id: "creative-bold",
    name: "Creative Bold",
    category: "creative",
    colors: {
      primary: "#6c2e72",
      accent: "#ff006e",
      background: "#fffbf0",
    },
    description: "Eye-catching layout for creative professionals.",
  },
  {
    id: "executive-luxury",
    name: "Executive Luxury",
    category: "classic",
    colors: {
      primary: "#2c3e50",
      accent: "#d4a574",
      background: "#ecf0f1",
    },
    description: "Premium design for senior leadership and C-suite roles.",
  },
  {
    id: "startup-vibrant",
    name: "Startup Vibrant",
    category: "modern",
    colors: {
      primary: "#1e3a5f",
      accent: "#4ecca3",
      background: "#f9fafb",
    },
    description: "Dynamic, growth-oriented design for startup candidates.",
  },
];
