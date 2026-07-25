import { ResumeTemplate } from "@/data/templates";

/**
 * Small structural preview of a template's actual layout engine (not just its colors) —
 * used in the builder's template picker and the /templates gallery so each of the 7 layout
 * engines (single, sidebar, compact, timeline, header-centered, banner-sidebar, label-rows)
 * is visually recognizable at a glance.
 */
export function TemplateThumbnail({ template }: { template: ResumeTemplate }) {
  const { colors, layout } = template;

  if (layout === "banner-sidebar") {
    return (
      <div className="h-20 flex" style={{ backgroundColor: colors.background }}>
        <div className="w-2/5 p-1.5 flex flex-col gap-1" style={{ backgroundColor: `${colors.primary}12` }}>
          <div className="h-3 w-3 rounded-full mb-0.5" style={{ backgroundColor: colors.accent, opacity: 0.5 }} />
          <div className="h-0.5 rounded-sm w-4/5" style={{ backgroundColor: colors.accent, opacity: 0.5 }} />
          <div className="h-0.5 rounded-sm w-full" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
          <div className="h-0.5 rounded-sm w-3/4" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
        </div>
        <div className="flex-1 p-1.5 flex flex-col gap-1">
          <div className="rounded-sm px-1 py-1 flex flex-col gap-0.5" style={{ backgroundColor: colors.primary }}>
            <div className="h-1.5 rounded-sm w-3/4" style={{ backgroundColor: "rgba(255,255,255,0.9)" }} />
            <div className="h-0.5 rounded-sm w-1/2" style={{ backgroundColor: colors.accent }} />
          </div>
          <div className="h-1 rounded-sm w-full opacity-30 mt-1" style={{ backgroundColor: colors.primary }} />
          <div className="h-1 rounded-sm w-5/6 opacity-20" style={{ backgroundColor: colors.primary }} />
        </div>
      </div>
    );
  }

  if (layout === "label-rows") {
    return (
      <div className="h-20 p-2 flex flex-col gap-1" style={{ backgroundColor: colors.background, borderBottom: `1.5px solid ${colors.primary}` }}>
        <div className="h-1.5 rounded-sm w-1/2 mx-auto" style={{ backgroundColor: colors.primary }} />
        <div className="h-0.5 rounded-sm w-1/3 mx-auto" style={{ backgroundColor: colors.accent }} />
        <div className="mt-1 flex-1 flex flex-col gap-1">
          <div className="flex gap-1 border-t pt-1" style={{ borderColor: `${colors.primary}33` }}>
            <div className="h-1 rounded-sm w-1/4" style={{ backgroundColor: colors.accent }} />
            <div className="h-1 rounded-sm flex-1 opacity-25" style={{ backgroundColor: colors.primary }} />
          </div>
          <div className="flex gap-1 border-t pt-1" style={{ borderColor: `${colors.primary}33` }}>
            <div className="h-1 rounded-sm w-1/4" style={{ backgroundColor: colors.accent, opacity: 0.6 }} />
            <div className="h-1 rounded-sm flex-1 opacity-15" style={{ backgroundColor: colors.primary }} />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "sidebar") {
    return (
      <div className="h-20 flex" style={{ backgroundColor: colors.background }}>
        <div className="w-2/5 p-1.5 flex flex-col gap-1" style={{ backgroundColor: `${colors.primary}12` }}>
          <div className="h-1 rounded-sm w-full" style={{ backgroundColor: colors.accent }} />
          <div className="h-0.5 rounded-sm w-4/5 mt-0.5" style={{ backgroundColor: colors.accent, opacity: 0.5 }} />
          <div className="h-0.5 rounded-sm w-full" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
          <div className="h-0.5 rounded-sm w-3/4" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
        </div>
        <div className="flex-1 p-1.5 flex flex-col gap-1">
          <div className="h-1.5 rounded-sm w-3/4" style={{ backgroundColor: colors.primary }} />
          <div className="h-1 rounded-sm w-full opacity-30 mt-0.5" style={{ backgroundColor: colors.primary }} />
          <div className="h-1 rounded-sm w-5/6 opacity-20" style={{ backgroundColor: colors.primary }} />
        </div>
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className="h-20 p-2.5 flex flex-col gap-1" style={{ backgroundColor: colors.background, borderBottom: `2px solid ${colors.accent}` }}>
        <div className="h-2 rounded-sm w-2/3" style={{ backgroundColor: colors.primary }} />
        <div className="h-1 rounded-sm w-1/3" style={{ backgroundColor: colors.primary, opacity: 0.5 }} />
        <div className="mt-1.5 h-1 rounded-sm w-full opacity-25" style={{ backgroundColor: colors.primary }} />
        <div className="h-1 rounded-sm w-5/6 opacity-20" style={{ backgroundColor: colors.primary }} />
        <div className="h-1 rounded-sm w-2/3 opacity-15" style={{ backgroundColor: colors.primary }} />
      </div>
    );
  }

  if (layout === "timeline") {
    return (
      <div className="h-20 p-2.5 flex flex-col gap-1" style={{ backgroundColor: colors.background }}>
        <div className="h-2 rounded-sm w-2/3" style={{ backgroundColor: colors.accent }} />
        <div className="h-1 rounded-sm w-1/3" style={{ backgroundColor: colors.primary, opacity: 0.5 }} />
        <div className="mt-1.5 flex gap-1.5 flex-1">
          <div className="w-[2px] rounded-full" style={{ backgroundColor: colors.accent }} />
          <div className="flex-1 flex flex-col gap-1 justify-center">
            <div className="h-1 rounded-sm w-full opacity-30" style={{ backgroundColor: colors.primary }} />
            <div className="h-1 rounded-sm w-5/6 opacity-20" style={{ backgroundColor: colors.primary }} />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "header-centered") {
    return (
      <div className="h-20 p-2.5 flex flex-col items-center gap-1" style={{ backgroundColor: colors.background }}>
        <div className="h-2 rounded-sm w-1/2" style={{ backgroundColor: colors.primary }} />
        <div className="h-1 rounded-sm w-1/3" style={{ backgroundColor: colors.accent }} />
        <div className="h-0.5 rounded-sm w-3/4 mt-1" style={{ backgroundColor: colors.primary, opacity: 0.5 }} />
        <div className="mt-1 h-1 rounded-sm w-full opacity-25" style={{ backgroundColor: colors.primary }} />
        <div className="h-1 rounded-sm w-4/5 opacity-15" style={{ backgroundColor: colors.primary }} />
      </div>
    );
  }

  // single (default) — bold colored banner header
  return (
    <div className="h-20 flex flex-col" style={{ backgroundColor: colors.background }}>
      <div className="px-2.5 py-2 flex flex-col gap-1" style={{ backgroundColor: colors.primary }}>
        <div className="h-1.5 rounded-sm w-2/3" style={{ backgroundColor: "rgba(255,255,255,0.9)" }} />
        <div className="h-1 rounded-sm w-1/2" style={{ backgroundColor: colors.accent }} />
      </div>
      <div className="px-2.5 py-1.5 flex flex-col gap-1 flex-1 justify-center">
        <div className="h-1 rounded-sm w-full opacity-30" style={{ backgroundColor: colors.primary }} />
        <div className="h-1 rounded-sm w-5/6 opacity-20" style={{ backgroundColor: colors.primary }} />
      </div>
    </div>
  );
}
