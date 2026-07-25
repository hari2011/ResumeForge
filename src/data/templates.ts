export interface ResumeTemplate {
  id: string;
  name: string;
  category: "modern" | "classic" | "creative" | "minimal" | "executive" | "academic" | "technical" | "ats";
  layout: "single" | "sidebar" | "compact" | "timeline" | "header-centered" | "banner-sidebar" | "label-rows";
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
 * 7 genuinely distinct layout engines (see resume-document.tsx):
 *  - single: bold colored header band, single column (Modern banner)
 *  - sidebar: colored header band + two-column body with a tinted skills/education sidebar
 *  - compact: dense, monochrome, ATS-maximal single column — no color blocks (Jake's Resume / Harvard ATS style)
 *  - timeline: plain header, experience rendered as a vertical accent timeline
 *  - header-centered: traditional centered header with double rule (academic / executive convention)
 *  - banner-sidebar: sidebar column + a colored rounded "hero card" header confined to the main column
 *    (inspired by Reactive Resume's Pikachu template) — bolder and more graphic than the plain `sidebar` layout
 *  - label-rows: centered minimal header, sections rendered as label+content rows with a category label
 *    to the left of each section instead of a full-width heading (inspired by Reactive Resume's Bronzor
 *    template) — an editorial, magazine-style structure well suited to executive resumes
 *
 * Each of the 8 categories is assigned the 2 layouts that best match how real resume builders present
 * that category, so templates within a category still look meaningfully different from one another —
 * not just recolored copies of the same layout.
 */
const CATEGORY_LAYOUTS: Record<ResumeTemplate["category"], [Layout, Layout]> = {
  modern: ["single", "timeline"],
  classic: ["single", "compact"],
  minimal: ["compact", "single"],
  creative: ["banner-sidebar", "timeline"],
  executive: ["label-rows", "single"],
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
  "banner-sidebar": "Hero Sidebar",
  "label-rows": "Editorial",
};

const LAYOUT_DESCRIPTION: Record<Layout, string> = {
  single: "Bold single-column layout with a colored header band.",
  sidebar: "Two-column layout with a dedicated skills & education sidebar.",
  compact: "Dense, monochrome, ATS-maximal single column with no color blocks.",
  timeline: "Plain header with experience displayed as a vertical accent timeline.",
  "header-centered": "Traditional centered header with a double rule — academic and executive convention.",
  "banner-sidebar": "Two-column layout with a colored hero card header and a dedicated sidebar.",
  "label-rows": "Centered minimal header with editorial label-and-content section rows.",
};

/**
 * 21 curated color/style palettes across 8 categories. Each palette is rendered in the two layout
 * engines assigned to its category (see CATEGORY_LAYOUTS above), producing 42 genuinely distinct,
 * ATS-safe templates.
 */
const TEMPLATE_PALETTES: TemplatePalette[] = [
  { id: "modern-clean", name: "Modern Clean", category: "modern", primary: "#1b1f23", accent: "#f26722", background: "#ffffff", description: "Contemporary design with warm accents and clear hierarchy." },
  { id: "classic-pro", name: "Classic Professional", category: "classic", primary: "#0f3460", accent: "#16a085", background: "#ffffff", description: "Timeless layout optimized for traditional industries." },
  { id: "minimal-tech", name: "Minimal Tech", category: "minimal", primary: "#1a1a1a", accent: "#00a8cc", background: "#ffffff", description: "Sleek, minimal design perfect for tech and startup roles." },
  { id: "creative-bold", name: "Creative Bold", category: "creative", primary: "#6c2e72", accent: "#ff006e", background: "#ffffff", description: "Eye-catching layout for creative professionals." },
  { id: "executive-luxury", name: "Executive Luxury", category: "executive", primary: "#2c3e50", accent: "#a9762f", background: "#ffffff", description: "Premium design for senior leadership and C-suite roles." },
  { id: "startup-vibrant", name: "Startup Vibrant", category: "modern", primary: "#1e3a5f", accent: "#0d9488", background: "#ffffff", description: "Dynamic, growth-oriented design for startup candidates." },
  { id: "harvard-classic", name: "Harvard Classic", category: "academic", primary: "#7a0019", accent: "#b08d57", background: "#ffffff", description: "Ivy League–style layout, education-first, trusted by top universities." },
  { id: "ivy-league", name: "Ivy League Navy", category: "academic", primary: "#00356b", accent: "#a9770e", background: "#ffffff", description: "Refined navy and gold layout for academic and research roles." },
  { id: "slate-technical", name: "Slate Technical", category: "technical", primary: "#263238", accent: "#00bcd4", background: "#ffffff", description: "Dense, spec-sheet style layout for engineers and developers." },
  { id: "terminal-green", name: "Terminal Green", category: "technical", primary: "#0d1117", accent: "#39d353", background: "#ffffff", description: "Developer-inspired dark-header design with a monospace feel." },
  { id: "ats-simple", name: "ATS Simple", category: "ats", primary: "#111827", accent: "#374151", background: "#ffffff", description: "Pure grayscale, zero graphics — maximum applicant tracking system compatibility." },
  { id: "ats-compact", name: "ATS Compact", category: "ats", primary: "#1f2937", accent: "#4b5563", background: "#ffffff", description: "High keyword density, compact spacing, built to parse cleanly." },
  { id: "sapphire-corporate", name: "Sapphire Corporate", category: "classic", primary: "#1e3a8a", accent: "#3b82f6", background: "#ffffff", description: "Confident blue palette for finance, banking, and consulting." },
  { id: "emerald-finance", name: "Emerald Finance", category: "classic", primary: "#064e3b", accent: "#10b981", background: "#ffffff", description: "Trustworthy green tones suited to finance and operations roles." },
  { id: "crimson-sales", name: "Crimson Sales", category: "creative", primary: "#7f1d1d", accent: "#ef4444", background: "#ffffff", description: "High-energy red palette for sales and business development." },
  { id: "sunset-marketing", name: "Sunset Marketing", category: "creative", primary: "#9a3412", accent: "#fb923c", background: "#ffffff", description: "Warm, expressive tones for marketing and brand roles." },
  { id: "lavender-design", name: "Lavender Design", category: "creative", primary: "#4c1d95", accent: "#a78bfa", background: "#ffffff", description: "Soft purple palette for designers and UX professionals." },
  { id: "rose-gold-creative", name: "Rose Gold Creative", category: "creative", primary: "#831843", accent: "#ec4899", background: "#ffffff", description: "Elegant rose tones for portfolio-driven creative careers." },
  { id: "ocean-breeze", name: "Ocean Breeze", category: "modern", primary: "#0c4a6e", accent: "#0ea5e9", background: "#ffffff", description: "Fresh, coastal-inspired palette for modern generalist roles." },
  { id: "graphite-minimal", name: "Graphite Minimal", category: "minimal", primary: "#18181b", accent: "#71717a", background: "#ffffff", description: "Understated grayscale minimalism with maximum readability." },
  { id: "golden-executive", name: "Golden Executive", category: "executive", primary: "#292524", accent: "#d4a574", background: "#ffffff", description: "Sophisticated warm neutrals for VP and C-suite applications." },
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
})
  // Surface the two Reactive-Resume-inspired layouts (banner-sidebar / label-rows) at the top of
  // every listing (the /templates gallery and the builder's "All" template picker) since they're
  // the newest, most visually distinctive additions. Array.sort is stable in modern JS engines, so
  // this only promotes the two layouts — it doesn't otherwise reorder anything within each group.
  .sort((a, b) => {
    const REACTIVE_RESUME_LAYOUTS = new Set<Layout>(["banner-sidebar", "label-rows"]);
    const rank = (t: ResumeTemplate) => (REACTIVE_RESUME_LAYOUTS.has(t.layout) ? 0 : 1);
    return rank(a) - rank(b);
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



