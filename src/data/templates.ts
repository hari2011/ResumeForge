export interface ResumeTemplate {
  id: string;
  name: string;
  category: "modern" | "classic" | "creative" | "minimal" | "executive" | "academic" | "technical" | "ats";
  layout: "single" | "sidebar" | "compact" | "timeline" | "header-centered";
  colors: { primary: string; accent: string; background: string };
  description: string;
}

type Layout = ResumeTemplate["layout"];

interface TemplatePalette {
  id: string;
  name: string;
  category: ResumeTemplate["category"];
  primary: string;
  accent: string;
  background: string;
  description: string;
}

/**
 * 5 genuinely distinct layout engines (see resume-document.tsx):
 *  - single: bold colored header band, single column (Modern banner)
 *  - sidebar: colored header band + two-column body with a tinted skills/education sidebar
 *  - compact: dense, monochrome, ATS-maximal single column — no color blocks (Jake's Resume / Harvard ATS style)
 *  - timeline: plain header, experience rendered as a vertical accent timeline
 *  - header-centered: traditional centered header with double rule (academic / executive convention)
 *
 * Each of the 8 categories is assigned the 2 layouts that best match how real resume builders present
 * that category, so templates within a category still look meaningfully different from one another —
 * not just recolored copies of the same layout.
 */
const CATEGORY_LAYOUTS: Record<ResumeTemplate["category"], [Layout, Layout]> = {
  modern: ["single", "timeline"],
  classic: ["single", "compact"],
  minimal: ["compact", "single"],
  creative: ["sidebar", "timeline"],
  executive: ["header-centered", "single"],
  academic: ["header-centered", "compact"],
  technical: ["sidebar", "compact"],
  ats: ["compact", "header-centered"],
};

const LAYOUT_LABEL: Record<Layout, string> = {
  single: "",
  sidebar: "Two-Column",
  compact: "Compact",
  timeline: "Timeline",
  "header-centered": "Centered",
};

const LAYOUT_DESCRIPTION: Record<Layout, string> = {
  single: "Bold single-column layout with a colored header band.",
  sidebar: "Two-column layout with a dedicated skills & education sidebar.",
  compact: "Dense, monochrome, ATS-maximal single column with no color blocks.",
  timeline: "Plain header with experience displayed as a vertical accent timeline.",
  "header-centered": "Traditional centered header with a double rule — academic and executive convention.",
};

/**
 * 21 curated color/style palettes across 8 categories. Each palette is rendered in the two layout
 * engines assigned to its category (see CATEGORY_LAYOUTS above), producing 42 genuinely distinct,
 * ATS-safe templates.
 */
const TEMPLATE_PALETTES: TemplatePalette[] = [
  { id: "modern-clean", name: "Modern Clean", category: "modern", primary: "#1b1f23", accent: "#f26722", background: "#f6f3ea", description: "Contemporary design with warm accents and clear hierarchy." },
  { id: "classic-pro", name: "Classic Professional", category: "classic", primary: "#0f3460", accent: "#16a085", background: "#f5f5f5", description: "Timeless layout optimized for traditional industries." },
  { id: "minimal-tech", name: "Minimal Tech", category: "minimal", primary: "#1a1a1a", accent: "#00a8cc", background: "#ffffff", description: "Sleek, minimal design perfect for tech and startup roles." },
  { id: "creative-bold", name: "Creative Bold", category: "creative", primary: "#6c2e72", accent: "#ff006e", background: "#fffbf0", description: "Eye-catching layout for creative professionals." },
  { id: "executive-luxury", name: "Executive Luxury", category: "executive", primary: "#2c3e50", accent: "#a9762f", background: "#ecf0f1", description: "Premium design for senior leadership and C-suite roles." },
  { id: "startup-vibrant", name: "Startup Vibrant", category: "modern", primary: "#1e3a5f", accent: "#0d9488", background: "#f9fafb", description: "Dynamic, growth-oriented design for startup candidates." },
  { id: "harvard-classic", name: "Harvard Classic", category: "academic", primary: "#7a0019", accent: "#b08d57", background: "#ffffff", description: "Ivy League–style layout, education-first, trusted by top universities." },
  { id: "ivy-league", name: "Ivy League Navy", category: "academic", primary: "#00356b", accent: "#a9770e", background: "#f7f7f5", description: "Refined navy and gold layout for academic and research roles." },
  { id: "slate-technical", name: "Slate Technical", category: "technical", primary: "#263238", accent: "#00bcd4", background: "#eceff1", description: "Dense, spec-sheet style layout for engineers and developers." },
  { id: "terminal-green", name: "Terminal Green", category: "technical", primary: "#0d1117", accent: "#39d353", background: "#ffffff", description: "Developer-inspired dark-header design with a monospace feel." },
  { id: "ats-simple", name: "ATS Simple", category: "ats", primary: "#111827", accent: "#374151", background: "#ffffff", description: "Pure grayscale, zero graphics — maximum applicant tracking system compatibility." },
  { id: "ats-compact", name: "ATS Compact", category: "ats", primary: "#1f2937", accent: "#4b5563", background: "#f9fafb", description: "High keyword density, compact spacing, built to parse cleanly." },
  { id: "sapphire-corporate", name: "Sapphire Corporate", category: "classic", primary: "#1e3a8a", accent: "#3b82f6", background: "#f8fafc", description: "Confident blue palette for finance, banking, and consulting." },
  { id: "emerald-finance", name: "Emerald Finance", category: "classic", primary: "#064e3b", accent: "#10b981", background: "#f0fdf4", description: "Trustworthy green tones suited to finance and operations roles." },
  { id: "crimson-sales", name: "Crimson Sales", category: "creative", primary: "#7f1d1d", accent: "#ef4444", background: "#fff5f5", description: "High-energy red palette for sales and business development." },
  { id: "sunset-marketing", name: "Sunset Marketing", category: "creative", primary: "#9a3412", accent: "#fb923c", background: "#fff7ed", description: "Warm, expressive tones for marketing and brand roles." },
  { id: "lavender-design", name: "Lavender Design", category: "creative", primary: "#4c1d95", accent: "#a78bfa", background: "#faf5ff", description: "Soft purple palette for designers and UX professionals." },
  { id: "rose-gold-creative", name: "Rose Gold Creative", category: "creative", primary: "#831843", accent: "#ec4899", background: "#fdf2f8", description: "Elegant rose tones for portfolio-driven creative careers." },
  { id: "ocean-breeze", name: "Ocean Breeze", category: "modern", primary: "#0c4a6e", accent: "#0ea5e9", background: "#f0f9ff", description: "Fresh, coastal-inspired palette for modern generalist roles." },
  { id: "graphite-minimal", name: "Graphite Minimal", category: "minimal", primary: "#18181b", accent: "#71717a", background: "#fafafa", description: "Understated grayscale minimalism with maximum readability." },
  { id: "golden-executive", name: "Golden Executive", category: "executive", primary: "#292524", accent: "#d4a574", background: "#fafaf9", description: "Sophisticated warm neutrals for VP and C-suite applications." },
];

export const resumeTemplates: ResumeTemplate[] = TEMPLATE_PALETTES.flatMap((p) => {
  const [layoutA, layoutB] = CATEGORY_LAYOUTS[p.category];
  const colors = { primary: p.primary, accent: p.accent, background: p.background };
  return [
    {
      id: `${p.id}-${layoutA}`,
      name: LAYOUT_LABEL[layoutA] ? `${p.name} — ${LAYOUT_LABEL[layoutA]}` : p.name,
      category: p.category,
      layout: layoutA,
      colors,
      description: `${p.description} ${LAYOUT_DESCRIPTION[layoutA]}`,
    },
    {
      id: `${p.id}-${layoutB}`,
      name: `${p.name} — ${LAYOUT_LABEL[layoutB] || "Alt"}`,
      category: p.category,
      layout: layoutB,
      colors,
      description: `${p.description} ${LAYOUT_DESCRIPTION[layoutB]}`,
    },
  ];
});

export const templateCategories: Array<ResumeTemplate["category"] | "all"> = [
  "all",
  "modern",
  "classic",
  "minimal",
  "creative",
  "executive",
  "academic",
  "technical",
  "ats",
];



