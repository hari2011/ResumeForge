"use client";

import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { resumeTemplates } from "@/data/templates";

export interface DocumentWorkEntry {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}
export interface DocumentEduEntry {
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  gpa?: string;
}
export interface DocumentProjectEntry {
  name: string;
  role: string;
  year: string;
  description: string;
}
export interface DocumentCustomSectionItem {
  heading: string;
  subheading: string;
  date: string;
  description: string;
}
export interface DocumentCustomSection {
  id: string;
  title: string;
  icon?: string;
  visible: boolean;
  items: DocumentCustomSectionItem[];
}
export interface DocumentSection {
  title: string;
  bullets: string[];
}
export interface DocumentLinkEntry {
  label: string;
  url: string;
}

export const DEFAULT_SECTION_ORDER = ["summary", "experience", "projects", "education", "skills", "certifications"];

export interface ResumeDocumentData {
  fullName: string;
  targetRole: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  /** Optional personal site / portfolio URL, shown in the header contact row */
  website?: string;
  /** Optional GitHub profile URL or handle, shown in the header contact row */
  github?: string;
  /** Optional additional technical/coding profiles (LeetCode, HackerRank, Kaggle, Stack Overflow, etc.) */
  links?: DocumentLinkEntry[];
  summary: string;
  experience: DocumentWorkEntry[];
  education: DocumentEduEntry[];
  skills: string[];
  certifications: string;
  templateId: string;
  /** Optional AI-generated sections (overrides raw experience bullets when present) */
  generatedSections?: DocumentSection[];
  /** Optional profile photo (base64 data URL) — only rendered when showPhoto is true */
  photoDataUrl?: string | null;
  showPhoto?: boolean;
  /** Optional projects section — only rendered when non-empty */
  projects?: DocumentProjectEntry[];
  /** Optional user-defined sections (Languages, Publications, Volunteer Work, References, etc.) */
  customSections?: DocumentCustomSection[];
  /** Controls the order sections are rendered in. Defaults to DEFAULT_SECTION_ORDER + any custom sections. */
  sectionOrder?: string[];
  /** A4 (default) or US Letter physical page size */
  pageSize?: "A4" | "Letter";
  /** Optional override of the template's default accent color (live color customization) */
  customAccentColor?: string | null;
  /** Optional per-skill proficiency level (1-5), keyed by skill name */
  skillLevels?: Record<string, number>;
  /** When true, render skills as a proficiency dot-rating list instead of plain pill tags */
  showSkillLevels?: boolean;
}

/** Split free-form achievement text into clean bullet lines. */
export function splitBullets(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•\u2022]\s*/, "").trim())
    .filter(Boolean);
}

interface ParsedCertEntry {
  title: string;
  issuer: string;
  date: string;
}

/** Parses free-form certification lines ("Title — Issuer, 2024") into structured entries so they render
 * as polished title/issuer/date cards (matching Experience & Education) instead of a flat bullet list. */
function parseCertificationEntries(text: string): ParsedCertEntry[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [titlePart, ...rest] = line.split(/\s+[—–-]\s+/);
      let issuer = rest.join(" - ").trim();
      let date = "";
      const dateMatch = issuer.match(/,?\s*((?:19|20)\d{2}(?:\s*[-–]\s*(?:(?:19|20)\d{2}|Present))?)\s*$/i);
      if (dateMatch) {
        date = dateMatch[1];
        issuer = issuer.slice(0, dateMatch.index).replace(/,\s*$/, "").trim();
      }
      return { title: titlePart.trim(), issuer, date };
    });
}

/* ── Small inline contact icons (Feather-style, MIT-licensed path data) ─── */
function IconMail() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></svg>
  );
}
function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
  );
}
function IconPin() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
  );
}
function IconLink() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
  );
}
function IconCode() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
  );
}

interface ContactRowProps {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website?: string;
  github?: string;
  links?: DocumentLinkEntry[];
  className: string;
}

function ContactRow({ email, phone, location, linkedin, website, github, links, className }: ContactRowProps) {
  const items: Array<{ icon: () => ReactNode; text: string }> = [];
  if (email) items.push({ icon: IconMail, text: email });
  if (phone) items.push({ icon: IconPhone, text: phone });
  if (location) items.push({ icon: IconPin, text: location });
  if (linkedin) items.push({ icon: IconLink, text: linkedin });
  if (website) items.push({ icon: IconLink, text: website });
  if (github) items.push({ icon: IconCode, text: github });
  (links ?? []).forEach((link) => {
    if (!link.url && !link.label) return;
    items.push({ icon: IconCode, text: link.label ? `${link.label}: ${link.url}` : link.url });
  });
  if (items.length === 0) return null;
  return (
    <div className={className}>
      {items.map((item, i) => (
        <span className="rd-contact-item" key={i}>
          <item.icon />
          {item.text}
        </span>
      ))}
    </div>
  );
}

/** Full-fidelity, print-ready resume renderer used for both the on-screen "final look" preview and PDF export via print.
 * Supports 7 genuinely distinct layout engines (not just color swaps):
 *  - single: bold colored header band, single column body (Modern)
 *  - sidebar: colored header band + two-column body with a tinted skills/education sidebar
 *  - compact: dense, monochrome, ATS-maximal single column with no color blocks (Jake's Resume / Harvard ATS style)
 *  - timeline: plain header, experience rendered as a vertical accent timeline
 *  - header-centered: traditional centered header with double rule, academic/executive convention
 *  - banner-sidebar: sidebar + a colored rounded hero card header confined to the main column
 *  - label-rows: centered minimal header with editorial label+content section rows
 *
 * Optional profile photo, a Projects section, and unlimited user-defined Custom Sections are all opt-in
 * and freely re-orderable via `sectionOrder` — matching (and extending) Reactive Resume's drag-and-drop
 * custom section model.
 */
export function ResumeDocument({ data, onSectionClick }: { data: ResumeDocumentData; onSectionClick?: (key: string) => void }) {
  const baseTpl = resumeTemplates.find((t) => t.id === data.templateId) || resumeTemplates[0];
  const tpl = data.customAccentColor
    ? { ...baseTpl, colors: { ...baseTpl.colors, accent: data.customAccentColor } }
    : baseTpl;
  const layout = tpl.layout;
  const monochrome = layout === "compact" || layout === "header-centered";
  const experienceEntries = data.experience.filter((e) => e.company || e.title);
  const educationEntries = data.education.filter((e) => e.institution || e.degree);
  const projectEntries = (data.projects ?? []).filter((p) => p.name);
  const showPhoto = Boolean(data.showPhoto && data.photoDataUrl);
  const pageSizeClass = data.pageSize === "Letter" ? "rd-page-letter" : "rd-page-a4";

  const headingColor = monochrome ? tpl.colors.primary : tpl.colors.accent;
  const bulletMarker = monochrome ? "–" : "▸";

  const heading = (label: string) => (
    <h2 className="rd-heading" style={{ color: headingColor, borderColor: tpl.colors.accent }}>{label}</h2>
  );

  const photoImg = showPhoto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={data.photoDataUrl!} alt="" className="rd-photo" />
  ) : null;

  const summaryBlock = (
    <section className="rd-section">
      {heading("Professional Summary")}
      <p className="rd-body" style={{ color: tpl.colors.primary }}>{data.summary || "Add a professional summary to introduce your experience and goals."}</p>
    </section>
  );

  const experienceBlock = (
    <section className="rd-section">
      {heading("Experience")}
      {data.generatedSections?.find((s) => s.title === "Experience") ? (
        <ul className="rd-bullets">
          {data.generatedSections.find((s) => s.title === "Experience")!.bullets.map((b, i) => (
            <li key={i} style={{ color: tpl.colors.primary }}><span style={{ color: tpl.colors.accent }}>{bulletMarker}</span>{b}</li>
          ))}
        </ul>
      ) : experienceEntries.length > 0 ? (
        <div className={layout === "timeline" ? "rd-timeline" : undefined}>
          {experienceEntries.map((exp, i) => (
            <div key={i} className={layout === "timeline" ? "rd-timeline-item" : "rd-entry"}>
              {layout === "timeline" && <span className="rd-timeline-dot" style={{ backgroundColor: tpl.colors.accent }} />}
              <div className="rd-entry-head">
                <span className="rd-entry-title" style={{ color: tpl.colors.primary }}>{exp.title || "Job Title"}{exp.company ? ` — ${exp.company}` : ""}</span>
                <span className="rd-entry-date" style={{ color: monochrome ? tpl.colors.primary : tpl.colors.accent, opacity: monochrome ? 0.7 : 1 }}>{exp.startDate}{exp.current ? " – Present" : exp.endDate ? ` – ${exp.endDate}` : ""}</span>
              </div>
              {exp.location && <p className="rd-entry-sub" style={{ color: monochrome ? tpl.colors.primary : tpl.colors.accent, opacity: monochrome ? 0.7 : 1 }}>{exp.location}</p>}
              {exp.description && (
                <ul className="rd-bullets">
                  {splitBullets(exp.description).map((b, bi) => (
                    <li key={bi} style={{ color: tpl.colors.primary }}><span style={{ color: tpl.colors.accent }}>{bulletMarker}</span>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="rd-body" style={{ color: tpl.colors.primary, opacity: 0.6 }}>Add your work experience to showcase your achievements.</p>
      )}
    </section>
  );

  const projectsBlock: ReactNode | false = projectEntries.length > 0 && (
    <section className="rd-section">
      {heading("Projects")}
      {projectEntries.map((proj, i) => (
        <div key={i} className="rd-entry">
          <div className="rd-entry-head">
            <span className="rd-entry-title" style={{ color: tpl.colors.primary }}>{proj.name}{proj.role ? ` — ${proj.role}` : ""}</span>
            {proj.year && <span className="rd-entry-date" style={{ color: monochrome ? tpl.colors.primary : tpl.colors.accent, opacity: monochrome ? 0.7 : 1 }}>{proj.year}</span>}
          </div>
          {proj.description && (
            <ul className="rd-bullets">
              {splitBullets(proj.description).map((b, bi) => (
                <li key={bi} style={{ color: tpl.colors.primary }}><span style={{ color: tpl.colors.accent }}>{bulletMarker}</span>{b}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );

  const educationBlock: ReactNode | false = educationEntries.length > 0 && (
    <section className="rd-section">
      {heading("Education")}
      {educationEntries.map((edu, i) => (
        <div key={i} className="rd-entry">
          <div className="rd-entry-head">
            <span className="rd-entry-title" style={{ color: tpl.colors.primary }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</span>
            <span className="rd-entry-date" style={{ color: monochrome ? tpl.colors.primary : tpl.colors.accent, opacity: monochrome ? 0.7 : 1 }}>{edu.endYear}</span>
          </div>
          <p className="rd-entry-sub" style={{ color: monochrome ? tpl.colors.primary : tpl.colors.accent, opacity: monochrome ? 0.7 : 1 }}>{edu.institution}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</p>
        </div>
      ))}
    </section>
  );

  const skillsBlock: ReactNode | false = data.skills.length > 0 && (
    <section className="rd-section">
      {heading("Skills")}
      {data.showSkillLevels ? (
        <div className="rd-skill-rated-wrap">
          {data.skills.map((sk) => {
            const level = data.skillLevels?.[sk] ?? 3;
            return (
              <div key={sk} className="rd-skill-rated-row">
                <span className="rd-skill-rated-name" style={{ color: tpl.colors.primary }}>{sk}</span>
                <span className="rd-skill-dots">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="rd-skill-dot" style={{ backgroundColor: n <= level ? tpl.colors.accent : `${tpl.colors.primary}22` }} />
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rd-skill-wrap">
          {data.skills.map((sk) => (
            monochrome ? (
              <span key={sk} className="rd-skill-plain" style={{ color: tpl.colors.primary, borderColor: tpl.colors.primary }}>{sk}</span>
            ) : (
              <span key={sk} className="rd-skill" style={{ backgroundColor: `${tpl.colors.accent}1a`, color: tpl.colors.accent }}>{sk}</span>
            )
          ))}
        </div>
      )}
    </section>
  );

  const certsBlock: ReactNode | false = Boolean(data.certifications.trim()) && (
    <section className="rd-section">
      {heading("Certifications & Awards")}
      {parseCertificationEntries(data.certifications).map((c, i) => (
        <div key={i} className="rd-entry">
          <div className="rd-entry-head">
            <span className="rd-entry-title" style={{ color: tpl.colors.primary }}>{c.title}</span>
            {c.date && <span className="rd-entry-date" style={{ color: monochrome ? tpl.colors.primary : tpl.colors.accent, opacity: monochrome ? 0.7 : 1 }}>{c.date}</span>}
          </div>
          {c.issuer && <p className="rd-entry-sub" style={{ color: monochrome ? tpl.colors.primary : tpl.colors.accent, opacity: monochrome ? 0.7 : 1 }}>{c.issuer}</p>}
        </div>
      ))}
    </section>
  );

  /* ── Custom (user-defined) sections ──────────────────────────── */
  const blockMap: Record<string, ReactNode | false> = {
    summary: summaryBlock,
    experience: experienceBlock,
    projects: projectsBlock,
    education: educationBlock,
    skills: skillsBlock,
    certifications: certsBlock,
  };

  const customKeys: string[] = [];
  (data.customSections ?? []).forEach((cs) => {
    if (!cs.visible) return;
    const items = cs.items.filter((it) => it.heading.trim() || it.description.trim());
    if (items.length === 0) return;
    const key = `custom:${cs.id}`;
    customKeys.push(key);
    blockMap[key] = (
      <section className="rd-section">
        {heading(cs.title || "Additional Section")}
        {items.map((it, i) => (
          <div key={i} className="rd-entry">
            <div className="rd-entry-head">
              <span className="rd-entry-title" style={{ color: tpl.colors.primary }}>{it.heading}</span>
              {it.date && <span className="rd-entry-date" style={{ color: monochrome ? tpl.colors.primary : tpl.colors.accent, opacity: monochrome ? 0.7 : 1 }}>{it.date}</span>}
            </div>
            {it.subheading && <p className="rd-entry-sub" style={{ color: monochrome ? tpl.colors.primary : tpl.colors.accent, opacity: monochrome ? 0.7 : 1 }}>{it.subheading}</p>}
            {it.description && (
              <ul className="rd-bullets">
                {splitBullets(it.description).map((b, bi) => (
                  <li key={bi} style={{ color: tpl.colors.primary }}><span style={{ color: tpl.colors.accent }}>{bulletMarker}</span>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    );
  });

  const providedOrder = data.sectionOrder && data.sectionOrder.length > 0 ? data.sectionOrder : DEFAULT_SECTION_ORDER;
  const order = [...providedOrder, ...customKeys.filter((k) => !providedOrder.includes(k))];

  const renderKeys = (keys: string[]) => keys.map((k) => {
    const block = blockMap[k];
    if (!block) return null;
    if (!onSectionClick) return <Fragment key={k}>{block}</Fragment>;
    return (
      <div
        key={k}
        className="rd-interactive-section"
        onClick={() => onSectionClick(k)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSectionClick(k); } }}
        role="button"
        tabIndex={0}
      >
        {block}
      </div>
    );
  });

  /* ── Header variants (each supports an optional photo) ──────────── */
  const bandHeader = (
    <header className="rd-header rd-header-row" style={{ backgroundColor: tpl.colors.primary }}>
      <div className="rd-header-text">
        <h1 className="rd-name">{data.fullName || "Your Name"}</h1>
        <p className="rd-role" style={{ color: tpl.colors.accent }}>{data.targetRole || "Target Role"}</p>
        <ContactRow email={data.email} phone={data.phone} location={data.location} linkedin={data.linkedin} className="rd-contact" />
      </div>
      {photoImg}
    </header>
  );

  const compactHeader = (
    <header className="rd-header-plain rd-header-row" style={{ borderColor: tpl.colors.accent }}>
      <div className="rd-header-text">
        <h1 className="rd-name-plain" style={{ color: tpl.colors.primary }}>{data.fullName || "Your Name"}</h1>
        <p className="rd-role-plain" style={{ color: tpl.colors.accent }}>{data.targetRole || "Target Role"}</p>
        <ContactRow email={data.email} phone={data.phone} location={data.location} linkedin={data.linkedin} className="rd-contact-plain" />
      </div>
      {photoImg}
    </header>
  );

  const timelineHeader = (
    <header className="rd-header-timeline rd-header-row" style={{ borderColor: tpl.colors.accent }}>
      <div className="rd-header-text">
        <h1 className="rd-name-timeline" style={{ color: tpl.colors.accent }}>{data.fullName || "Your Name"}</h1>
        <p className="rd-role-plain" style={{ color: tpl.colors.primary, opacity: 0.75 }}>{data.targetRole || "Target Role"}</p>
        <ContactRow email={data.email} phone={data.phone} location={data.location} linkedin={data.linkedin} className="rd-contact-plain" />
      </div>
      {photoImg}
    </header>
  );

  const centeredHeader = (
    <header className="rd-header-centered" style={{ borderColor: tpl.colors.primary }}>
      {photoImg && <div className="rd-photo-centered-wrap">{photoImg}</div>}
      <h1 className="rd-name-centered" style={{ color: tpl.colors.primary }}>{data.fullName || "Your Name"}</h1>
      <p className="rd-role-centered" style={{ color: tpl.colors.accent }}>{data.targetRole || "Target Role"}</p>
      <ContactRow email={data.email} phone={data.phone} location={data.location} linkedin={data.linkedin} className="rd-contact-centered" />
      <div className="rd-double-rule" style={{ borderColor: tpl.colors.primary }} />
    </header>
  );

  const labelRowsHeader = (
    <header className="rd-header-label" style={{ borderColor: tpl.colors.primary }}>
      {photoImg && <div className="rd-photo-centered-wrap">{photoImg}</div>}
      <h1 className="rd-name-label" style={{ color: tpl.colors.primary }}>{data.fullName || "Your Name"}</h1>
      <p className="rd-role-label" style={{ color: tpl.colors.accent }}>{data.targetRole || "Target Role"}</p>
      <ContactRow email={data.email} phone={data.phone} location={data.location} linkedin={data.linkedin} className="rd-contact-label" />
    </header>
  );

  const panelHeader = (
    <header className="rd-header-panel" style={{ backgroundColor: tpl.colors.primary }}>
      <h1 className="rd-name-panel">{data.fullName || "Your Name"}</h1>
      <p className="rd-role-panel" style={{ color: tpl.colors.accent }}>{data.targetRole || "Target Role"}</p>
      <ContactRow email={data.email} phone={data.phone} location={data.location} linkedin={data.linkedin} className="rd-contact-panel" />
    </header>
  );

  /* ── Layout: sidebar (skills/education/certifications + custom stay in the aside column) ──── */
  if (layout === "sidebar") {
    const asideKeys = order.filter((k) => k === "skills" || k === "education" || k === "certifications" || k.startsWith("custom:"));
    const mainKeys = order.filter((k) => !asideKeys.includes(k));
    return (
      <div className={`rd-page ${pageSizeClass} rd-page-sans rd-sidebar-layout`} style={{ backgroundColor: tpl.colors.background }}>
        {bandHeader}
        <div className="rd-sidebar-body">
          <aside className="rd-sidebar-col" style={{ backgroundColor: `${tpl.colors.primary}14`, borderLeft: `1mm solid ${tpl.colors.accent}` }}>
            {renderKeys(asideKeys)}
          </aside>
          <main className="rd-main-col">
            {renderKeys(mainKeys)}
          </main>
        </div>
      </div>
    );
  }

  /* ── Layout: compact (ATS-maximal, monochrome, dense) ──────────── */
  if (layout === "compact") {
    return (
      <div className={`rd-page ${pageSizeClass} rd-compact-layout`} style={{ backgroundColor: tpl.colors.background }}>
        {compactHeader}
        <div className="rd-compact-body">
          {renderKeys(order)}
        </div>
      </div>
    );
  }

  /* ── Layout: timeline (plain header, vertical accent timeline) ─── */
  if (layout === "timeline") {
    return (
      <div className={`rd-page ${pageSizeClass} rd-page-sans rd-timeline-layout`} style={{ backgroundColor: tpl.colors.background, borderLeft: `1.5mm solid ${tpl.colors.accent}` }}>
        {timelineHeader}
        <div className="rd-single-body">
          {renderKeys(order)}
        </div>
      </div>
    );
  }

  /* ── Layout: header-centered (academic / executive convention) ─── */
  if (layout === "header-centered") {
    return (
      <div className={`rd-page ${pageSizeClass} rd-centered-layout`} style={{ backgroundColor: tpl.colors.background }}>
        {centeredHeader}
        <div className="rd-compact-body">
          {renderKeys(order)}
        </div>
      </div>
    );
  }

  /* ── Layout: banner-sidebar (sidebar + colored hero card confined to main column) ─ */
  if (layout === "banner-sidebar") {
    const asideKeys = order.filter((k) => k === "skills" || k === "education" || k === "certifications" || k.startsWith("custom:"));
    const mainKeys = order.filter((k) => !asideKeys.includes(k));
    return (
      <div className={`rd-page ${pageSizeClass} rd-page-sans rd-banner-sidebar-layout`} style={{ backgroundColor: tpl.colors.background }}>
        <div className="rd-sidebar-body">
          <aside className="rd-sidebar-col" style={{ backgroundColor: `${tpl.colors.primary}14`, borderLeft: `1mm solid ${tpl.colors.accent}` }}>
            {photoImg && <div className="rd-sidebar-photo-wrap">{photoImg}</div>}
            {renderKeys(asideKeys)}
          </aside>
          <main className="rd-main-col">
            {panelHeader}
            {renderKeys(mainKeys)}
          </main>
        </div>
      </div>
    );
  }

  /* ── Layout: label-rows (editorial label+content section rows) ─── */
  if (layout === "label-rows") {
    return (
      <div className={`rd-page ${pageSizeClass} rd-page-sans rd-label-rows-layout`} style={{ backgroundColor: tpl.colors.background }}>
        {labelRowsHeader}
        <div className="rd-single-body">
          {renderKeys(order)}
        </div>
      </div>
    );
  }

  /* ── Layout: single (default — bold colored banner) ─────────────── */
  return (
    <div className={`rd-page ${pageSizeClass} rd-page-sans rd-single-layout`} style={{ backgroundColor: tpl.colors.background, borderLeft: `1.5mm solid ${tpl.colors.accent}` }}>
      {bandHeader}
      <div className="rd-single-body">
        {renderKeys(order)}
      </div>
    </div>
  );
}

/**
 * Renders the real ResumeDocument at a reduced visual scale so the in-app "Live Preview" and
 * "Results" panels show the EXACT same 5-layout output as the pixel-perfect PDF export — no
 * separate simplified mock. Uses a ResizeObserver to keep the outer wrapper's box height in sync
 * with the scaled content (since CSS transform doesn't affect layout flow).
 */
export function ScaledResumeDocument({ data, scale, onSectionClick }: { data: ResumeDocumentData; scale: number; onSectionClick?: (key: string) => void }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [naturalHeight, setNaturalHeight] = useState(0);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setNaturalHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ width: `${210 * scale}mm`, height: naturalHeight ? `${naturalHeight * scale}px` : undefined, overflow: "hidden" }}>
      <div ref={innerRef} style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <ResumeDocument data={data} onSectionClick={onSectionClick} />
      </div>
    </div>
  );
}

