"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ExportButton } from "@/components/export-button";
import { LiveResumeScore } from "@/components/live-resume-score";
import { ProofreadPanel } from "@/components/proofread-panel";
import { ResumeDocumentData, ScaledResumeDocument, DEFAULT_SECTION_ORDER } from "@/components/resume-document";
import { TemplateThumbnail } from "@/components/template-thumbnail";
import { ToggleSwitch } from "@/components/toggle-switch";
import { serializeResumeForm } from "@/lib/resume-format";
import { industries, industrySkills, marketCoreSkills, getEducationRecommendation } from "@/data/career-options";
import { marketTrends } from "@/data/market-trends";
import { resumeTemplates, templateCategories } from "@/data/templates";
import { AtsScoreResult, GeneratedResume, ParsedResumeStructure, ResumeAnalysis } from "@/types/resume";

/* ── Types ──────────────────────────────────────────────────────── */
type Mode = "scratch" | "upload" | null;
type RightPanel = "upload-zone" | "parsing" | "preview" | "results";
type ResultTab = "insights" | "enhanced";
interface WorkEntry { id: string; company: string; title: string; location: string; startDate: string; endDate: string; current: boolean; description: string; }
interface EduEntry { id: string; institution: string; degree: string; field: string; startYear: string; endYear: string; gpa: string; notes: string; }
interface ProjectEntry { id: string; name: string; role: string; year: string; description: string; }
interface CustomSectionItem { id: string; heading: string; subheading: string; date: string; description: string; }
interface CustomSection { id: string; title: string; icon: string; visible: boolean; items: CustomSectionItem[]; }
interface PersonalInfo { fullName: string; email: string; phone: string; location: string; linkedin: string; website: string; targetRole: string; summary: string; }
interface ImproveResponse { rewrittenResume: string; score: AtsScoreResult; upgrades: string[]; aiAnalysis?: ResumeAnalysis; }
interface DraftPayload {
  mode: Mode;
  personal: PersonalInfo;
  experience: WorkEntry[];
  education: EduEntry[];
  selectedSkills: string[];
  industry: string;
  projects: ProjectEntry[];
  includeProjects: boolean;
  certifications: string;
  jobDescription: string;
  selectedTemplate: string;
  showPhoto: boolean;
  photoDataUrl: string | null;
  customSections: CustomSection[];
  sectionOrder: string[];
  pageSize: "A4" | "Letter";
  customAccentColor: string | null;
  showSkillLevels: boolean;
  skillLevels: Record<string, number>;
  savedAt: number;
}

const DRAFT_KEY = "rf_resume_draft_v1";

/* ── Constants ──────────────────────────────────────────────────── */
const STRENGTH_LABELS = ["", "Very Weak", "Weak", "Below Average", "Average", "Fair", "Good", "Strong", "Very Strong", "Excellent", "Outstanding"];
const TONE_BADGE: Record<string, { label: string; color: string }> = {
  active: { label: "Active Voice ✓", color: "#0f766e" },
  passive: { label: "Passive Voice ⚠", color: "#d97706" },
  mixed: { label: "Mixed Voice", color: "#6366f1" },
};

/* ── Helpers ────────────────────────────────────────────────────── */
function uid() { return Math.random().toString(36).slice(2, 9); }

const SECTION_META: Record<string, { label: string; icon: string }> = {
  summary: { label: "Professional Summary", icon: "📝" },
  experience: { label: "Experience", icon: "💼" },
  projects: { label: "Projects", icon: "🔧" },
  education: { label: "Education", icon: "🎓" },
  skills: { label: "Skills", icon: "⚡" },
  certifications: { label: "Certifications", icon: "🏆" },
};


/* ── Section accordion ──────────────────────────────────────────── */
function SectionShell({ id, label, icon, open, onToggle, children, badge, count }: { id: string; label: string; icon: string; open: boolean; onToggle: (s: string) => void; children: React.ReactNode; badge?: string; count?: number; }) {
  return (
    <div className="section-card" id={`section-${id}`}>
      <div className="section-header" onClick={() => onToggle(id)}>
        <div className="section-title">
          <span>{icon}</span>{label}
          {badge && <span className="badge badge-orange ml-2">{badge}</span>}
          {count !== undefined && <span className="badge ml-2">{count}</span>}
        </div>
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0)", display: "inline-block", transition: "transform 0.2s", fontSize: "11px", color: "var(--ink-soft)" }}>▼</span>
      </div>
      {open && <div className="border-t border-[var(--stroke)] p-5">{children}</div>}
    </div>
  );
}

/* ── Live resume preview ────────────────────────────────────────── */
/* ── Main page ──────────────────────────────────────────────────── */
export default function ResumeBuilderPage() {
  const [mode, setMode] = useState<Mode>(null);
  const [rightPanel, setRightPanel] = useState<RightPanel>("upload-zone");
  const [openSection, setOpenSection] = useState<string>("personal");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultTab, setResultTab] = useState<ResultTab>("insights");
  const [copied, setCopied] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [importSource, setImportSource] = useState<"file" | "linkedin">("file");

  /* Form state */
  const [personal, setPersonal] = useState<PersonalInfo>({ fullName: "", email: "", phone: "", location: "", linkedin: "", website: "", targetRole: "", summary: "" });
  const [experience, setExperience] = useState<WorkEntry[]>([{ id: "work-0", company: "", title: "", location: "", startDate: "", endDate: "", current: false, description: "" }]);
  const [education, setEducation] = useState<EduEntry[]>([{ id: "edu-0", institution: "", degree: "", field: "", startYear: "", endYear: "", gpa: "", notes: "" }]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [industry, setIndustry] = useState(industries[0]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [includeProjects, setIncludeProjects] = useState(true);
  const [certifications, setCertifications] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>(resumeTemplates[0]?.id);
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<typeof templateCategories[number]>("all");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [pageSize, setPageSize] = useState<"A4" | "Letter">("A4");
  const [draggedSectionKey, setDraggedSectionKey] = useState<string | null>(null);
  const [customAccentColor, setCustomAccentColor] = useState<string | null>(null);
  const [showSkillLevels, setShowSkillLevels] = useState(false);
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({});

  /* Results */
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [improveResult, setImproveResult] = useState<ImproveResponse | null>(null);

  /* Local resume library (SQLite-backed, no accounts — see /api/resumes) */
  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);
  const [savingToLibrary, setSavingToLibrary] = useState(false);
  const [librarySavedAt, setLibrarySavedAt] = useState<number | null>(null);

  /* Autosave / restore + per-bullet AI improve */
  const [draftBanner, setDraftBanner] = useState<DraftPayload | null>(null);
  const [improvingBulletId, setImprovingBulletId] = useState<string | null>(null);
  const hydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("rf_last_template");
    if (stored) setSelectedTemplate(stored);
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setDraftBanner(JSON.parse(raw) as DraftPayload);
    } catch { /* ignore corrupt draft */ }
  }, []);

  // Open a resume saved in the local library (SQLite) when navigated to with ?resumeId=<id>,
  // e.g. from the Dashboard's "My Resumes" list.
  useEffect(() => {
    const resumeId = new URLSearchParams(window.location.search).get("resumeId");
    if (!resumeId) return;
    (async () => {
      try {
        const res = await fetch(`/api/resumes/${resumeId}`);
        if (!res.ok) return;
        const json = await res.json() as { id: string; templateId: string; data: Record<string, unknown> };
        const data = json.data;
        if (data.personal) setPersonal(data.personal as PersonalInfo);
        if (data.experience) setExperience(data.experience as WorkEntry[]);
        if (data.education) setEducation(data.education as EduEntry[]);
        if (data.selectedSkills) setSelectedSkills(data.selectedSkills as string[]);
        if (data.industry) setIndustry(data.industry as string);
        if (data.projects) setProjects(data.projects as ProjectEntry[]);
        if (typeof data.includeProjects === "boolean") setIncludeProjects(data.includeProjects);
        if (typeof data.certifications === "string") setCertifications(data.certifications);
        if (typeof data.jobDescription === "string") setJobDescription(data.jobDescription);
        if (json.templateId) setSelectedTemplate(json.templateId);
        if (typeof data.showPhoto === "boolean") setShowPhoto(data.showPhoto);
        if (data.photoDataUrl !== undefined) setPhotoDataUrl(data.photoDataUrl as string | null);
        if (data.customSections) setCustomSections(data.customSections as CustomSection[]);
        if (data.sectionOrder) setSectionOrder(data.sectionOrder as string[]);
        if (data.pageSize) setPageSize(data.pageSize as "A4" | "Letter");
        if (data.customAccentColor !== undefined) setCustomAccentColor(data.customAccentColor as string | null);
        if (typeof data.showSkillLevels === "boolean") setShowSkillLevels(data.showSkillLevels);
        if (data.skillLevels) setSkillLevels(data.skillLevels as Record<string, number>);
        setSavedResumeId(json.id);
        setMode((data.mode as Mode) ?? "scratch");
        setRightPanel("preview");
        setDraftBanner(null);
        hydrated.current = true;
      } catch { /* ignore load failure — user stays on the mode-select screen */ }
    })();
  }, []);

  // Autosave the in-progress draft (debounced) whenever the form changes, once a mode is active.
  useEffect(() => {
    if (mode === null) return;
    if (!hydrated.current) { hydrated.current = true; return; }
    setLibrarySavedAt(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const payload: DraftPayload = { mode, personal, experience, education, selectedSkills, industry, projects, includeProjects, certifications, jobDescription, selectedTemplate, showPhoto, photoDataUrl, customSections, sectionOrder, pageSize, customAccentColor, showSkillLevels, skillLevels, savedAt: Date.now() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [mode, personal, experience, education, selectedSkills, industry, projects, includeProjects, certifications, jobDescription, selectedTemplate, showPhoto, photoDataUrl, customSections, sectionOrder, pageSize, customAccentColor, showSkillLevels, skillLevels]);

  function restoreDraft() {
    if (!draftBanner) return;
    setMode(draftBanner.mode);
    setPersonal(draftBanner.personal);
    setExperience(draftBanner.experience);
    setEducation(draftBanner.education);
    setSelectedSkills(draftBanner.selectedSkills);
    setIndustry(draftBanner.industry);
    setProjects(draftBanner.projects);
    setIncludeProjects(draftBanner.includeProjects ?? true);
    setCertifications(draftBanner.certifications);
    setJobDescription(draftBanner.jobDescription);
    setSelectedTemplate(draftBanner.selectedTemplate);
    setShowPhoto(draftBanner.showPhoto ?? false);
    setPhotoDataUrl(draftBanner.photoDataUrl ?? null);
    setCustomSections(draftBanner.customSections ?? []);
    setSectionOrder(draftBanner.sectionOrder ?? DEFAULT_SECTION_ORDER);
    setPageSize(draftBanner.pageSize ?? "A4");
    setCustomAccentColor(draftBanner.customAccentColor ?? null);
    setShowSkillLevels(draftBanner.showSkillLevels ?? false);
    setSkillLevels(draftBanner.skillLevels ?? {});
    setRightPanel("preview");
    hydrated.current = true;
    setDraftBanner(null);
  }

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setDraftBanner(null);
  }

  async function improveBullet(id: string) {
    const entry = experience.find(e => e.id === id);
    if (!entry || !entry.description.trim()) return;
    setImprovingBulletId(id);
    try {
      const res = await fetch("/api/improve-bullet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: entry.description, targetRole: personal.targetRole || entry.title }) });
      const data = (await res.json()) as { improved?: string };
      if (data.improved) updateWork(id, "description", data.improved);
    } catch { /* silent fail, keep original text */ }
    finally { setImprovingBulletId(null); }
  }

  const roleSuggested = useMemo(() => marketTrends.find(t => personal.targetRole.toLowerCase().includes(t.role.toLowerCase()))?.topSkills ?? [], [personal.targetRole]);
  const skillOptions = useMemo(() => Array.from(new Set([...(industrySkills[industry] ?? []), ...roleSuggested, ...marketCoreSkills])).slice(0, 28), [industry, roleSuggested]);
  const educationHint = useMemo(() => getEducationRecommendation(personal.targetRole), [personal.targetRole]);
  const filteredTemplates = useMemo(() => templateCategoryFilter === "all" ? resumeTemplates : resumeTemplates.filter(t => t.category === templateCategoryFilter), [templateCategoryFilter]);
  const sortedExperience = useMemo(() => [...experience].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    if (!a.startDate && !b.startDate) return 0;
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return b.startDate.localeCompare(a.startDate);
  }), [experience]);

  const completionChecks = [
    { label: "Personal info", done: Boolean(personal.fullName && personal.targetRole && personal.email) },
    { label: "Summary", done: personal.summary.trim().length > 30 },
    { label: "Experience", done: experience.some(e => e.company && e.description.trim().length > 10) },
    { label: "Education", done: education.some(e => e.institution) },
    { label: "Skills", done: selectedSkills.length >= 3 },
  ];
  const completionPct = Math.round((completionChecks.filter(c => c.done).length / completionChecks.length) * 100);

  function chooseMode(m: "scratch" | "upload") {
    setMode(m);
    setRightPanel(m === "upload" ? "upload-zone" : "preview");
    setOpenSection("personal");
  }

  function resetAll() {
    setMode(null);
    setPersonal({ fullName: "", email: "", phone: "", location: "", linkedin: "", website: "", targetRole: "", summary: "" });
    setExperience([{ id: "work-0", company: "", title: "", location: "", startDate: "", endDate: "", current: false, description: "" }]);
    setEducation([{ id: "edu-0", institution: "", degree: "", field: "", startYear: "", endYear: "", gpa: "", notes: "" }]);
    setSelectedSkills([]); setProjects([]); setIncludeProjects(true); setCertifications(""); setJobDescription("");
    setGeneratedResume(null); setImproveResult(null); setError(null); setPasteText(""); setShowPaste(false); setImportSource("file");
    setPhotoDataUrl(null); setShowPhoto(false);
    setCustomSections([]); setSectionOrder(DEFAULT_SECTION_ORDER); setPageSize("A4");
    setCustomAccentColor(null); setShowSkillLevels(false); setSkillLevels({});
    setSavedResumeId(null); setLibrarySavedAt(null);
    localStorage.removeItem(DRAFT_KEY);
    hydrated.current = false;
  }

  /* Custom sections + drag-and-drop reordering */
  function addCustomSection() {
    const id = uid();
    setCustomSections(cur => [...cur, { id, title: "New Section", icon: "📌", visible: true, items: [] }]);
    setSectionOrder(cur => [...cur, `custom:${id}`]);
    setOpenSection(`custom-${id}`);
  }
  function removeCustomSection(id: string) {
    setCustomSections(cur => cur.filter(cs => cs.id !== id));
    setSectionOrder(cur => cur.filter(k => k !== `custom:${id}`));
  }
  function updateCustomSection(id: string, field: "title" | "icon", value: string) {
    setCustomSections(cur => cur.map(cs => cs.id === id ? { ...cs, [field]: value } : cs));
  }
  function toggleCustomSectionVisible(id: string) {
    setCustomSections(cur => cur.map(cs => cs.id === id ? { ...cs, visible: !cs.visible } : cs));
  }
  function addCustomItem(sectionId: string) {
    setCustomSections(cur => cur.map(cs => cs.id === sectionId ? { ...cs, items: [...cs.items, { id: uid(), heading: "", subheading: "", date: "", description: "" }] } : cs));
  }
  function updateCustomItem(sectionId: string, itemId: string, field: keyof CustomSectionItem, value: string) {
    setCustomSections(cur => cur.map(cs => cs.id === sectionId ? { ...cs, items: cs.items.map(it => it.id === itemId ? { ...it, [field]: value } : it) } : cs));
  }
  function removeCustomItem(sectionId: string, itemId: string) {
    setCustomSections(cur => cur.map(cs => cs.id === sectionId ? { ...cs, items: cs.items.filter(it => it.id !== itemId) } : cs));
  }
  function handleSectionDrop(targetKey: string) {
    if (!draggedSectionKey || draggedSectionKey === targetKey) { setDraggedSectionKey(null); return; }
    setSectionOrder(cur => {
      const next = [...cur];
      const from = next.indexOf(draggedSectionKey);
      const to = next.indexOf(targetKey);
      if (from === -1 || to === -1) return cur;
      next.splice(from, 1);
      next.splice(to, 0, draggedSectionKey);
      return next;
    });
    setDraggedSectionKey(null);
  }

  async function onFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setRightPanel("parsing"); setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: fd });
      const data = (await res.json()) as { resumeText?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not parse file.");
      await parseResumeText(data.resumeText || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse file."); setRightPanel("upload-zone");
    } finally { event.target.value = ""; }
  }

  async function parseResumeText(text: string) {
    setRightPanel("parsing");
    try {
      const res = await fetch("/api/parse-structured", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeText: text }) });
      const data = (await res.json()) as ParsedResumeStructure;
      setPersonal(p => ({ ...p, fullName: data.fullName || p.fullName, email: data.email || p.email, phone: data.phone || p.phone, location: data.location || p.location, linkedin: data.linkedin || p.linkedin, targetRole: data.targetRole || p.targetRole, summary: data.summary || p.summary }));
      if (data.experience.length > 0) setExperience(data.experience.map(e => ({ ...e, id: uid(), notes: "" })));
      if (data.education.length > 0) setEducation(data.education.map(e => ({ ...e, id: uid(), notes: "" })));
      if (data.skills.length > 0) setSelectedSkills(data.skills.slice(0, 18));
      if (data.certifications) setCertifications(data.certifications);
    } catch { /* ignore, show form anyway */ }
    setRightPanel("preview");
  }

  async function handleGenerate() {
    if (!personal.fullName || !personal.targetRole) { setError("Fill in Full Name and Target Role first."); setOpenSection("personal"); return; }
    if (selectedSkills.length < 2) { setError("Select at least 2 skills."); setOpenSection("skills"); return; }
    setProcessing(true); setError(null);
    const achievements = experience.map(e => e.description).filter(Boolean).join("\n");
    const educationStr = education.filter(e => e.institution || e.degree).map(e => `${e.degree}${e.field ? ` in ${e.field}` : ""} — ${e.institution}${e.endYear ? `, ${e.endYear}` : ""}`).join("\n");
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: personal.fullName, targetRole: personal.targetRole, yearsOfExperience: experience.filter(e => e.company).length, industries: industry, skills: selectedSkills, achievements: achievements || personal.summary || "Experienced professional.", education: educationStr, certifications, jobDescription, templateId: selectedTemplate }) });
      if (!res.ok) throw new Error("Generation failed");
      const data = (await res.json()) as { resume: GeneratedResume };
      setGeneratedResume(data.resume);
      setPersonal(p => ({ ...p, summary: data.resume.summary }));
      setRightPanel("results");
      localStorage.setItem("rf_last_template", selectedTemplate);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setProcessing(false); }
  }

  async function handleEnhance() {
    if (!personal.targetRole.trim()) { setError("Enter a Target Role first."); setOpenSection("personal"); return; }
    const text = serializeResumeForm(personal, experience, education, selectedSkills, certifications, includeProjects ? projects : []);
    if (!text.trim()) { setError("No resume content to enhance."); return; }
    setProcessing(true); setError(null);
    try {
      const res = await fetch("/api/improve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ existingResume: text, targetRole: personal.targetRole, jobDescription, templateId: selectedTemplate }) });
      if (!res.ok) throw new Error("Enhancement failed.");
      const data = (await res.json()) as ImproveResponse;
      setImproveResult(data);
      setResultTab(data.aiAnalysis ? "insights" : "enhanced");
      setRightPanel("results");
      localStorage.setItem("rf_last_template", selectedTemplate);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setProcessing(false); }
  }

  /* Form helpers */
  function toggleSection(s: string) { setOpenSection(cur => cur === s ? "personal" : s); }
  function toggleSkill(sk: string) { setSelectedSkills(cur => cur.includes(sk) ? cur.filter(x => x !== sk) : [...cur, sk].slice(0, 18)); }
  function addCustomSkill() { const v = customSkill.trim(); if (!v) return; setSelectedSkills(cur => cur.includes(v) ? cur : [...cur, v].slice(0, 18)); setCustomSkill(""); }
  function addWork() { setExperience(cur => [...cur, { id: uid(), company: "", title: "", location: "", startDate: "", endDate: "", current: false, description: "" }]); }
  function updateWork(id: string, field: keyof WorkEntry, value: string | boolean) { setExperience(cur => cur.map(e => e.id === id ? { ...e, [field]: value } : e)); }
  function removeWork(id: string) { setExperience(cur => cur.filter(e => e.id !== id)); }
  function addEdu() { setEducation(cur => [...cur, { id: uid(), institution: "", degree: "", field: "", startYear: "", endYear: "", gpa: "", notes: "" }]); }
  function updateEdu(id: string, field: keyof EduEntry, value: string) { setEducation(cur => cur.map(e => e.id === id ? { ...e, [field]: value } : e)); }
  function removeEdu(id: string) { setEducation(cur => cur.filter(e => e.id !== id)); }
  function addProject() { setProjects(cur => [...cur, { id: uid(), name: "", role: "", year: "", description: "" }]); }
  function updateProject(id: string, field: keyof ProjectEntry, value: string) { setProjects(cur => cur.map(p => p.id === id ? { ...p, [field]: value } : p)); }
  function removeProject(id: string) { setProjects(cur => cur.filter(p => p.id !== id)); }

  function onPhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Photo must be under 2MB."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { setPhotoDataUrl(reader.result as string); setShowPhoto(true); };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function removePhoto() {
    setPhotoDataUrl(null);
    setShowPhoto(false);
  }

  function buildPrintPayload(): ResumeDocumentData {
    return {
      fullName: personal.fullName,
      targetRole: personal.targetRole,
      email: personal.email,
      phone: personal.phone,
      location: personal.location,
      linkedin: personal.linkedin,
      summary: personal.summary,
      experience: sortedExperience.map(({ company, title, location, startDate, endDate, current, description }) => ({ company, title, location, startDate, endDate, current, description })),
      education: education.map(({ institution, degree, field, startYear, endYear, gpa }) => ({ institution, degree, field, startYear, endYear, gpa })),
      skills: selectedSkills,
      certifications,
      templateId: selectedTemplate,
      generatedSections: mode === "scratch" ? generatedResume?.sections : undefined,
      photoDataUrl,
      showPhoto,
      projects: includeProjects ? projects.filter(p => p.name).map(({ name, role, year, description }) => ({ name, role, year, description })) : [],
      customSections: customSections.map(({ id, title, icon, visible, items }) => ({ id, title, icon, visible, items: items.map(({ heading, subheading, date, description }) => ({ heading, subheading, date, description })) })),
      sectionOrder,
      pageSize,
      customAccentColor,
      showSkillLevels,
      skillLevels,
    };
  }

  function openPrintView() {
    sessionStorage.setItem("rf_print_payload", JSON.stringify(buildPrintPayload()));
    window.open("/resume-print", "_blank", "noopener,noreferrer");
  }

  function addKeywordAsSkill(kw: string) {
    setSelectedSkills(cur => cur.includes(kw) ? cur : [...cur, kw].slice(0, 18));
  }

  const PREVIEW_SECTION_MAP: Record<string, string> = { summary: "personal", experience: "experience", projects: "projects", education: "education", skills: "skills", certifications: "certifications" };
  function handlePreviewSectionClick(key: string) {
    const targetId = key.startsWith("custom:") ? `custom-${key.slice(7)}` : (PREVIEW_SECTION_MAP[key] ?? key);
    setOpenSection(targetId);
    setTimeout(() => {
      document.getElementById(`section-${targetId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function exportResumeData() {
    const payload = {
      version: 1,
      mode, personal, experience, education, selectedSkills, industry, projects, includeProjects,
      certifications, jobDescription, selectedTemplate, showPhoto, photoDataUrl, customSections, sectionOrder, pageSize,
      customAccentColor, showSkillLevels, skillLevels,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(personal.fullName || "resume").replace(/\s+/g, "-").toLowerCase()}-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function saveToLibrary() {
    setSavingToLibrary(true);
    try {
      const payload = {
        id: savedResumeId ?? undefined,
        name: personal.fullName ? `${personal.fullName} \u2014 ${personal.targetRole || "Resume"}` : "Untitled Resume",
        templateId: selectedTemplate,
        data: {
          version: 1,
          mode, personal, experience, education, selectedSkills, industry, projects, includeProjects,
          certifications, jobDescription, selectedTemplate, showPhoto, photoDataUrl, customSections, sectionOrder, pageSize,
          customAccentColor, showSkillLevels, skillLevels,
        },
      };
      const res = await fetch("/api/resumes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        const json = (await res.json()) as { id: string; updatedAt: number };
        setSavedResumeId(json.id);
        setLibrarySavedAt(Date.now());
      } else {
        setError("Could not save to your library \u2014 please try again.");
      }
    } catch {
      setError("Could not save to your library \u2014 please try again.");
    } finally {
      setSavingToLibrary(false);
    }
  }

  function importResumeData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.personal) setPersonal(data.personal);
        if (data.experience) setExperience(data.experience);
        if (data.education) setEducation(data.education);
        if (data.selectedSkills) setSelectedSkills(data.selectedSkills);
        if (data.industry) setIndustry(data.industry);
        if (data.projects) setProjects(data.projects);
        if (typeof data.includeProjects === "boolean") setIncludeProjects(data.includeProjects);
        if (typeof data.certifications === "string") setCertifications(data.certifications);
        if (typeof data.jobDescription === "string") setJobDescription(data.jobDescription);
        if (data.selectedTemplate) setSelectedTemplate(data.selectedTemplate);
        if (typeof data.showPhoto === "boolean") setShowPhoto(data.showPhoto);
        if (data.photoDataUrl !== undefined) setPhotoDataUrl(data.photoDataUrl);
        if (data.customSections) setCustomSections(data.customSections);
        if (data.sectionOrder) setSectionOrder(data.sectionOrder);
        if (data.pageSize) setPageSize(data.pageSize);
        if (data.customAccentColor !== undefined) setCustomAccentColor(data.customAccentColor);
        if (typeof data.showSkillLevels === "boolean") setShowSkillLevels(data.showSkillLevels);
        if (data.skillLevels) setSkillLevels(data.skillLevels);
        setMode(data.mode ?? "scratch");
        setRightPanel("preview");
        hydrated.current = true;
      } catch {
        setError("Could not read that file — make sure it's a resume data JSON exported from ResumeForge AI.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  const tpl = resumeTemplates.find(t => t.id === selectedTemplate) || resumeTemplates[0];
  const atsScore = mode === "scratch" ? generatedResume?.score : improveResult?.score.score;
  const atsColor = atsScore ? (atsScore >= 85 ? "#0f766e" : atsScore >= 70 ? "#d97706" : "#dc2626") : "#aaa";
  const exportContent = generatedResume ? { name: personal.fullName, title: personal.targetRole, email: personal.email || "your.email@example.com", phone: personal.phone || "(555) 123-4567", summary: generatedResume.summary, templateId: selectedTemplate, sections: generatedResume.sections } : null;

  /* ═══════════════════════════════════════════════════════════════
     MODE SELECTION SCREEN
  ═══════════════════════════════════════════════════════════════ */
  if (mode === null) {
    return (
      <AppShell title="Resume Builder" fullWidth>
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 py-16" style={{ background: "linear-gradient(135deg, #fef8f3 0%, #f6f3ea 50%, #edf7f6 100%)" }}>
          {draftBanner && (
            <div className="mb-8 flex items-center gap-4 rounded-2xl border-2 border-[var(--accent-alt)] bg-teal-50 px-5 py-3.5 shadow-sm max-w-xl w-full">
              <span className="text-2xl flex-shrink-0">💾</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--foreground)]">Resume in progress found</p>
                <p className="text-xs text-[var(--ink-soft)]">{draftBanner.personal.fullName || "Untitled draft"} — {draftBanner.personal.targetRole || "no role set"}</p>
              </div>
              <button className="button-primary px-4 py-2 text-xs flex-shrink-0" onClick={restoreDraft}>Resume Editing</button>
              <button className="button-ghost px-2 py-2 text-xs flex-shrink-0 text-[var(--ink-soft)]" onClick={discardDraft}>Discard</button>
            </div>
          )}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] bg-opacity-10 border border-orange-200 px-4 py-1.5 text-xs font-bold text-[var(--accent)] uppercase tracking-widest mb-5">
              ✦ ResumeForge AI — Resume Builder
            </div>
            <h1 className="headline text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-3 max-w-xl mx-auto leading-tight">
              How would you like to start?
            </h1>
            <p className="text-[var(--ink-soft)] text-base max-w-lg mx-auto">
              Build a polished, ATS-ready resume from scratch — or upload your existing one for AI to analyse and enhance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 w-full max-w-2xl">
            {/* Build from scratch */}
            <button onClick={() => chooseMode("scratch")} className="group text-left rounded-2xl border-2 border-[var(--stroke)] bg-white p-8 shadow-sm hover:border-[var(--accent)] hover:shadow-xl transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:border-[var(--accent)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100 text-4xl shadow-sm">✦</div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Recommended</span>
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Build from Scratch</h2>
              <p className="text-sm text-[var(--ink-soft)] mb-5 leading-relaxed">Start with a blank structured form. Fill in your details and AI writes polished, achievement-focused bullets and summaries for you.</p>
              <ul className="space-y-2 mb-6">
                {["Guided section-by-section form", "Live resume preview as you type", "AI writes bullets & professional summary", "ATS score with keyword gap analysis"].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-xs text-[var(--ink-soft)]">
                    <span className="h-4 w-4 rounded-full bg-teal-100 text-teal-700 text-[8px] flex items-center justify-center font-bold flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent)] group-hover:gap-3 transition-all">
                Start building <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </div>
            </button>

            {/* Upload existing */}
            <button onClick={() => chooseMode("upload")} className="group text-left rounded-2xl border-2 border-[var(--stroke)] bg-white p-8 shadow-sm hover:border-[var(--accent-alt)] hover:shadow-xl transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:border-[var(--accent-alt)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 text-4xl shadow-sm">📄</div>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-[10px] font-bold text-[var(--accent-alt)] uppercase tracking-widest">AI-Enhanced</span>
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Upload & Improve</h2>
              <p className="text-sm text-[var(--ink-soft)] mb-5 leading-relaxed">Already have a resume? Upload it, or import from LinkedIn. AI reads every section, pre-fills the form for you to review, then rewrites with stronger language and better keywords.</p>
              <ul className="space-y-2 mb-6">
                {["Upload PDF, DOCX, or import from LinkedIn", "AI extracts and pre-fills all sections", "Edit and correct before enhancing", "AI rewrite with ATS keyword boost"].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-xs text-[var(--ink-soft)]">
                    <span className="h-4 w-4 rounded-full bg-orange-100 text-[var(--accent)] text-[8px] flex items-center justify-center font-bold flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent-alt)] group-hover:gap-3 transition-all">
                Upload resume <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </div>
            </button>
          </div>

          <p className="mt-8 text-xs text-[var(--ink-soft)]">Free · Private · No sign-up required · Runs on local AI</p>
          <label className="mt-2 text-xs text-[var(--accent)] hover:underline cursor-pointer">
            📂 Or import previously saved resume data (.json)
            <input type="file" accept="application/json" onChange={importResumeData} className="sr-only" />
          </label>
        </div>
      </AppShell>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     EDITOR LAYOUT (mode selected)
  ═══════════════════════════════════════════════════════════════ */
  return (
    <AppShell title="" fullWidth>
      {/* Sub-header bar */}
      <div className="border-b border-[var(--stroke)] bg-white sticky top-0 z-30 px-5 h-12 flex items-center gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-sm" style={{ background: mode === "scratch" ? "rgba(242,103,34,0.12)" : "rgba(15,118,110,0.1)" }}>
            {mode === "scratch" ? "✦" : "📄"}
          </div>
          <span className="text-sm font-bold text-[var(--foreground)]">{mode === "scratch" ? "Build from Scratch" : "Upload & Improve"}</span>
          {mode === "upload" && rightPanel === "preview" && <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-bold text-teal-700 uppercase tracking-widest">Resume loaded ✓</span>}
          {rightPanel === "results" && <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest">{mode === "scratch" ? "Generated" : "Enhanced"}</span>}
        </div>
        {/* Step indicator */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          {(mode === "upload" ? ["Upload", "Review & Edit", "Enhance"] : ["Fill Details", "Generate"]).map((step, i) => {
            const active = mode === "scratch" ? (rightPanel === "preview" ? i === 0 : i === 1) : (rightPanel === "upload-zone" ? i === 0 : rightPanel === "parsing" ? i === 0 : rightPanel === "preview" ? i === 1 : i === 2);
            return (
              <div key={step} className="flex items-center gap-1">
                {i > 0 && <div className="w-4 h-px bg-[var(--stroke)]" />}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${active ? "bg-[var(--accent)] text-white" : "text-[var(--ink-soft)]"}`}>{step}</span>
              </div>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {(rightPanel === "preview" || rightPanel === "results") && (
            <ProofreadPanel resumeText={serializeResumeForm(personal, sortedExperience, education, selectedSkills, certifications, includeProjects ? projects : [])} />
          )}
          {(rightPanel === "preview" || rightPanel === "results") && (
            <button className="button-ghost px-3 py-1.5 text-xs" onClick={openPrintView}>🖨 Download PDF</button>
          )}
          {(rightPanel === "preview" || rightPanel === "results") && (
            <button className="button-ghost px-3 py-1.5 text-xs" onClick={saveToLibrary} disabled={savingToLibrary} title="Save this resume to your local library so it appears on the Dashboard">
              {savingToLibrary ? "Saving…" : librarySavedAt ? "✓ Saved to Library" : "📚 Save to Library"}
            </button>
          )}
          {(rightPanel === "preview" || rightPanel === "results") && (
            <button className="button-ghost px-3 py-1.5 text-xs" onClick={exportResumeData}>💾 Save Data (JSON)</button>
          )}
          <label className="button-ghost px-3 py-1.5 text-xs cursor-pointer">
            📂 Load Data
            <input type="file" accept="application/json" onChange={importResumeData} className="sr-only" />
          </label>
          {rightPanel === "results" && <button className="button-ghost px-3 py-1.5 text-xs" onClick={() => setRightPanel("preview")}>← Edit</button>}
          <button className="button-ghost px-3 py-1.5 text-xs text-[var(--ink-soft)]" onClick={resetAll}>↺ Start over</button>
        </div>
      </div>
      <div className="h-1 bg-[var(--stroke)] sticky top-12 z-30" title={`${completionPct}% complete`}>
        <div className="h-1 bg-[var(--accent)] transition-all duration-300" style={{ width: `${completionPct}%` }} />
      </div>

      <div className="flex" style={{ height: "calc(100vh - 64px - 48px - 4px)" }}>
        {/* ─────────────────────────────────────────────────────────
            LEFT: Form panel
        ───────────────────────────────────────────────────────── */}
        <div className="w-[400px] flex-shrink-0 overflow-y-auto border-r border-[var(--stroke)] bg-[#fafaf8] space-y-3 px-4 py-4">

          <SectionShell id="personal" label="Personal Info" icon="👤" open={openSection === "personal"} onToggle={toggleSection} badge={mode === "scratch" ? "Required" : undefined}>
            <div className="grid grid-cols-2 gap-3">
              <div className="rf-field col-span-2"><label className="rf-label">Full Name *</label><input className="rf-input" placeholder="e.g. Priya Anand" value={personal.fullName} onChange={e => setPersonal(p => ({ ...p, fullName: e.target.value }))} /></div>
              <div className="rf-field col-span-2"><label className="rf-label">Target Role *</label><input className="rf-input" placeholder="e.g. Product Manager" value={personal.targetRole} onChange={e => setPersonal(p => ({ ...p, targetRole: e.target.value }))} /></div>
              <div className="rf-field"><label className="rf-label">Email</label><input className="rf-input" type="email" placeholder="you@example.com" value={personal.email} onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="rf-field"><label className="rf-label">Phone</label><input className="rf-input" placeholder="+1 (555) 000-0000" value={personal.phone} onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="rf-field"><label className="rf-label">Location</label><input className="rf-input" placeholder="City, Country" value={personal.location} onChange={e => setPersonal(p => ({ ...p, location: e.target.value }))} /></div>
              <div className="rf-field"><label className="rf-label">LinkedIn</label><input className="rf-input" placeholder="linkedin.com/in/you" value={personal.linkedin} onChange={e => setPersonal(p => ({ ...p, linkedin: e.target.value }))} /></div>
              {mode === "scratch" && <>
                <div className="rf-field col-span-2"><label className="rf-label">Website / Portfolio</label><input className="rf-input" placeholder="https://yoursite.com" value={personal.website} onChange={e => setPersonal(p => ({ ...p, website: e.target.value }))} /></div>
                <div className="rf-field col-span-2"><label className="rf-label">Industry</label><select className="rf-select" value={industry} onChange={e => setIndustry(e.target.value)}>{industries.map(ind => <option key={ind}>{ind}</option>)}</select></div>
              </>}
              <div className="rf-field col-span-2"><label className="rf-label">Professional Summary <span className="rf-hint inline">· AI will improve this</span></label><textarea className="rf-textarea" rows={3} placeholder="Brief 2–3 line overview of your professional story…" value={personal.summary} onChange={e => setPersonal(p => ({ ...p, summary: e.target.value }))} /></div>
            </div>

            <div className="mt-4 rounded-xl border border-[var(--stroke)] bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">Profile Photo</p>
                  <p className="rf-hint mt-0.5">Optional — off by default. Photos can reduce ATS compatibility in the US/UK; common in EU/creative resumes.</p>
                </div>
                <ToggleSwitch checked={showPhoto} onChange={setShowPhoto} disabled={!photoDataUrl} className="ml-3" ariaLabel="Show photo on resume" />
              </div>
              <div className="flex items-center gap-3">
                {photoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoDataUrl} alt="" className="h-14 w-14 rounded-full object-cover border border-[var(--stroke)]" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-[#fafaf8] border border-dashed border-[var(--stroke)] flex items-center justify-center text-lg text-[var(--ink-soft)]">👤</div>
                )}
                <label className="button-secondary px-3 py-2 text-xs cursor-pointer">
                  {photoDataUrl ? "Replace Photo" : "Upload Photo"}
                  <input type="file" accept="image/*" onChange={onPhotoUpload} className="sr-only" />
                </label>
                {photoDataUrl && <button type="button" className="button-danger px-3 py-2 text-xs" onClick={removePhoto}>Remove</button>}
              </div>
            </div>
          </SectionShell>

          <SectionShell id="sections" label="Sections & Order" icon="🧩" count={6 + customSections.length} open={openSection === "sections"} onToggle={toggleSection}>
            <div className="space-y-4">
              <p className="text-xs text-[var(--ink-soft)]">Drag rows to reorder how sections appear on your resume. Add custom sections for Languages, Publications, Volunteer Work, Awards, References, and more.</p>
              <div className="space-y-1.5">
                {sectionOrder.map(key => {
                  const isCustom = key.startsWith("custom:");
                  const custom = isCustom ? customSections.find(cs => `custom:${cs.id}` === key) : null;
                  if (isCustom && !custom) return null;
                  const meta = !isCustom ? SECTION_META[key] : null;
                  return (
                    <div
                      key={key}
                      draggable
                      onDragStart={() => setDraggedSectionKey(key)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleSectionDrop(key)}
                      className={`flex items-center gap-2 rounded-lg border border-[var(--stroke)] bg-white px-3 py-2.5 cursor-grab active:cursor-grabbing transition-opacity ${draggedSectionKey === key ? "opacity-40" : ""}`}
                    >
                      <span className="text-[var(--ink-soft)] text-sm select-none">⠿</span>
                      <span className="text-base">{isCustom ? custom!.icon || "📌" : meta?.icon}</span>
                      <span className="flex-1 text-sm font-semibold text-[var(--foreground)] truncate">{isCustom ? (custom!.title || "Custom Section") : meta?.label}</span>
                      {key === "projects" ? (
                        <ToggleSwitch checked={includeProjects} onChange={setIncludeProjects} size="sm" ariaLabel="Include Projects section" />
                      ) : isCustom ? (
                        <>
                          <ToggleSwitch checked={custom!.visible} onChange={() => toggleCustomSectionVisible(custom!.id)} size="sm" ariaLabel={`Show ${custom!.title || "custom section"}`} />
                          <button type="button" className="button-danger px-2 py-1 text-[10px]" onClick={() => removeCustomSection(custom!.id)}>✕</button>
                        </>
                      ) : (
                        <span className="text-[9px] text-[var(--ink-soft)] uppercase tracking-widest">Auto</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <button className="button-secondary w-full py-2.5 text-sm" onClick={addCustomSection}>+ Add Custom Section</button>
            </div>
          </SectionShell>

          <SectionShell id="experience" label="Work Experience" icon="💼" count={experience.filter(e => e.company).length} open={openSection === "experience"} onToggle={toggleSection}>
            <div className="space-y-4">
              {sortedExperience.map((exp, idx) => (
                <div key={exp.id} className="rounded-xl border border-[var(--stroke)] bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Position {idx + 1}</p>
                    {experience.length > 1 && <button className="button-danger px-2 py-1 text-xs" onClick={() => removeWork(exp.id)}>Remove</button>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rf-field col-span-2"><label className="rf-label">Company</label><input className="rf-input" placeholder="Acme Corp" value={exp.company} onChange={e => updateWork(exp.id, "company", e.target.value)} /></div>
                    <div className="rf-field col-span-2"><label className="rf-label">Job Title</label><input className="rf-input" placeholder="Senior Product Manager" value={exp.title} onChange={e => updateWork(exp.id, "title", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Location</label><input className="rf-input" placeholder="City" value={exp.location} onChange={e => updateWork(exp.id, "location", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Start Date</label><input className="rf-input" type="month" value={exp.startDate} onChange={e => updateWork(exp.id, "startDate", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">End Date</label><input className="rf-input" type="month" value={exp.endDate} disabled={exp.current} onChange={e => updateWork(exp.id, "endDate", e.target.value)} /></div>
                    <div className="rf-field flex items-center gap-2 pt-5">
                      <input type="checkbox" id={`cur-${exp.id}`} checked={exp.current} onChange={e => updateWork(exp.id, "current", e.target.checked)} />
                      <label htmlFor={`cur-${exp.id}`} className="text-sm cursor-pointer">Currently here</label>
                    </div>
                    <div className="rf-field col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="rf-label">Achievements & Responsibilities</label>
                        <button
                          type="button"
                          className="text-[11px] font-bold text-[var(--accent)] hover:underline disabled:opacity-40 disabled:no-underline flex-shrink-0 flex items-center gap-1"
                          disabled={!exp.description.trim() || improvingBulletId === exp.id}
                          onClick={() => improveBullet(exp.id)}
                        >
                          {improvingBulletId === exp.id ? (
                            <><span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />Improving…</>
                          ) : "✨ AI Improve"}
                        </button>
                      </div>
                      <p className="rf-hint">Use numbers: "Grew revenue 40%" or "Led team of 8"</p>
                      <textarea className="rf-textarea mt-1" rows={4} placeholder={"• Led cross-functional team of 8…\n• Improved conversion by 23%…\n• Reduced cost by $200K…"} value={exp.description} onChange={e => updateWork(exp.id, "description", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button className="button-secondary w-full py-2.5 text-sm" onClick={addWork}>+ Add Position</button>
            </div>
          </SectionShell>

          <SectionShell id="education" label="Education" icon="🎓" count={education.filter(e => e.institution).length} open={openSection === "education"} onToggle={toggleSection}>
            <div className="space-y-4">
              {mode === "scratch" && personal.targetRole && (
                <div className="rounded-lg bg-teal-50 border border-teal-100 px-3 py-2.5 text-xs text-teal-800">
                  <strong>Suggested for {personal.targetRole}:</strong> {educationHint.recommended} in {educationHint.fields.slice(0, 3).join(", ")}
                </div>
              )}
              {education.map((edu, idx) => (
                <div key={edu.id} className="rounded-xl border border-[var(--stroke)] bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Qualification {idx + 1}</p>
                    {education.length > 1 && <button className="button-danger px-2 py-1 text-xs" onClick={() => removeEdu(edu.id)}>Remove</button>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rf-field col-span-2"><label className="rf-label">Institution</label><input className="rf-input" placeholder="University / College" value={edu.institution} onChange={e => updateEdu(edu.id, "institution", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Degree</label><input className="rf-input" placeholder="B.E., MBA…" value={edu.degree} onChange={e => updateEdu(edu.id, "degree", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Field</label><input className="rf-input" placeholder="Computer Science…" value={edu.field} onChange={e => updateEdu(edu.id, "field", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Start Year</label><input className="rf-input" placeholder="2018" value={edu.startYear} onChange={e => updateEdu(edu.id, "startYear", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">End Year</label><input className="rf-input" placeholder="2022" value={edu.endYear} onChange={e => updateEdu(edu.id, "endYear", e.target.value)} /></div>
                    {mode === "scratch" && <>
                      <div className="rf-field"><label className="rf-label">GPA <span className="rf-hint inline">optional</span></label><input className="rf-input" placeholder="3.8 / 4.0" value={edu.gpa} onChange={e => updateEdu(edu.id, "gpa", e.target.value)} /></div>
                      <div className="rf-field"><label className="rf-label">Notes</label><input className="rf-input" placeholder="Dean's List, Thesis…" value={edu.notes} onChange={e => updateEdu(edu.id, "notes", e.target.value)} /></div>
                    </>}
                  </div>
                </div>
              ))}
              <button className="button-secondary w-full py-2.5 text-sm" onClick={addEdu}>+ Add Qualification</button>
            </div>
          </SectionShell>

          <SectionShell id="skills" label="Skills" icon="⚡" count={selectedSkills.length} open={openSection === "skills"} onToggle={toggleSection}>
            <div className="space-y-4">
              {mode === "scratch" && (
                <>
                  <p className="text-xs text-[var(--ink-soft)]">Suggestions update with Industry & Target Role.</p>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map(sk => { const sel = selectedSkills.includes(sk); return (
                      <button key={sk} type="button" onClick={() => toggleSkill(sk)} className={sel ? "skill-tag" : "skill-tag-neutral"}>{sel && <span className="text-[10px]">✓</span>}{sk}</button>
                    ); })}
                  </div>
                </>
              )}
              {selectedSkills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--ink-soft)] mb-2">Selected ({selectedSkills.length}/18):</p>
                  <div className="flex flex-wrap gap-2">{selectedSkills.map(sk => (
                    <button key={sk} onClick={() => toggleSkill(sk)} className="skill-tag text-xs gap-1">{sk} <span className="opacity-50 text-sm leading-none">×</span></button>
                  ))}</div>
                </div>
              )}
              {selectedSkills.length > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[#fafaf8] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">Show Proficiency Levels</p>
                    <p className="rf-hint mt-0.5">Display a 1–5 dot rating next to each skill on your resume instead of plain tags.</p>
                  </div>
                  <ToggleSwitch checked={showSkillLevels} onChange={setShowSkillLevels} className="ml-3" ariaLabel="Show skill proficiency levels" />
                </div>
              )}
              {showSkillLevels && selectedSkills.length > 0 && (
                <div className="rounded-xl border border-[var(--stroke)] bg-white p-4 space-y-2.5">
                  {selectedSkills.map(sk => {
                    const level = skillLevels[sk] ?? 3;
                    return (
                      <div key={sk} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-[var(--foreground)] truncate">{sk}</span>
                        <div className="flex gap-1 flex-shrink-0">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setSkillLevels(cur => ({ ...cur, [sk]: n }))}
                              className="h-3.5 w-3.5 rounded-full border transition-colors"
                              style={{ backgroundColor: n <= level ? "var(--accent)" : "transparent", borderColor: "var(--accent)" }}
                              aria-label={`Set ${sk} proficiency to ${n} out of 5`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-2">
                <input className="rf-input flex-1" placeholder="Type a skill and press Enter…" value={customSkill} onChange={e => setCustomSkill(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustomSkill()} />
                <button className="button-secondary px-4 py-2 text-sm" onClick={addCustomSkill}>Add</button>
              </div>
            </div>
          </SectionShell>

          <SectionShell id="projects" label="Projects" icon="🔧" count={projects.length} open={openSection === "projects"} onToggle={toggleSection}>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[#fafaf8] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">Include Projects Section</p>
                  <p className="rf-hint mt-0.5">Turn off to hide this section from your resume without losing your entries.</p>
                </div>
                <ToggleSwitch checked={includeProjects} onChange={setIncludeProjects} className="ml-3" ariaLabel="Include Projects section" />
              </div>
              {!includeProjects && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Projects section is hidden from your resume. Your entries below are kept — just re-enable to show them again.</p>}
              {projects.length === 0 && <p className="text-xs text-[var(--ink-soft)]">Add personal, academic, or open-source projects to stand out.</p>}
              <div className={!includeProjects ? "opacity-50 pointer-events-none" : undefined}>
                {projects.map((proj, idx) => (
                  <div key={proj.id} className="rounded-xl border border-[var(--stroke)] bg-white p-4 space-y-3 mb-4">
                    <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Project {idx + 1}</p><button className="button-danger px-2 py-1 text-xs" onClick={() => removeProject(proj.id)}>Remove</button></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rf-field col-span-2"><label className="rf-label">Project Name</label><input className="rf-input" placeholder="Analytics Dashboard" value={proj.name} onChange={e => updateProject(proj.id, "name", e.target.value)} /></div>
                      <div className="rf-field"><label className="rf-label">Your Role</label><input className="rf-input" placeholder="Lead Developer" value={proj.role} onChange={e => updateProject(proj.id, "role", e.target.value)} /></div>
                      <div className="rf-field"><label className="rf-label">Year</label><input className="rf-input" placeholder="2024" value={proj.year} onChange={e => updateProject(proj.id, "year", e.target.value)} /></div>
                      <div className="rf-field col-span-2"><label className="rf-label">Description & Impact</label><textarea className="rf-textarea" rows={3} placeholder="What was built, tech used, outcome…" value={proj.description} onChange={e => updateProject(proj.id, "description", e.target.value)} /></div>
                    </div>
                  </div>
                ))}
                <button className="button-secondary w-full py-2.5 text-sm" onClick={addProject}>+ Add Project</button>
              </div>
            </div>
          </SectionShell>

          <SectionShell id="certifications" label="Certifications & Awards" icon="🏆" open={openSection === "certifications"} onToggle={toggleSection}>
            <div className="rf-field">
              <p className="rf-hint mb-2">One per line — e.g. AWS Solutions Architect — Amazon, 2024</p>
              <textarea className="rf-textarea" rows={4} placeholder={"AWS Solutions Architect — Amazon, 2024\nPMP — PMI, 2023\nDean's Award for Excellence, 2022"} value={certifications} onChange={e => setCertifications(e.target.value)} />
            </div>
          </SectionShell>

          {customSections.map(cs => (
            <SectionShell key={cs.id} id={`custom-${cs.id}`} label={cs.title || "Custom Section"} icon={cs.icon || "📌"} count={cs.items.length} open={openSection === `custom-${cs.id}`} onToggle={toggleSection}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rf-field"><label className="rf-label">Section Title</label><input className="rf-input" placeholder="e.g. Languages" value={cs.title} onChange={e => updateCustomSection(cs.id, "title", e.target.value)} /></div>
                  <div className="rf-field"><label className="rf-label">Icon (emoji)</label><input className="rf-input" placeholder="🌐" value={cs.icon} onChange={e => updateCustomSection(cs.id, "icon", e.target.value)} maxLength={2} /></div>
                </div>
                {cs.items.length === 0 && <p className="text-xs text-[var(--ink-soft)]">e.g. Languages, Volunteer Work, Publications, Awards, References…</p>}
                {cs.items.map((item, idx) => (
                  <div key={item.id} className="rounded-xl border border-[var(--stroke)] bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Item {idx + 1}</p><button className="button-danger px-2 py-1 text-xs" onClick={() => removeCustomItem(cs.id, item.id)}>Remove</button></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rf-field col-span-2"><label className="rf-label">Heading</label><input className="rf-input" placeholder="e.g. Spanish — Fluent" value={item.heading} onChange={e => updateCustomItem(cs.id, item.id, "heading", e.target.value)} /></div>
                      <div className="rf-field"><label className="rf-label">Subheading <span className="rf-hint inline">optional</span></label><input className="rf-input" placeholder="e.g. Organization" value={item.subheading} onChange={e => updateCustomItem(cs.id, item.id, "subheading", e.target.value)} /></div>
                      <div className="rf-field"><label className="rf-label">Date <span className="rf-hint inline">optional</span></label><input className="rf-input" placeholder="2023" value={item.date} onChange={e => updateCustomItem(cs.id, item.id, "date", e.target.value)} /></div>
                      <div className="rf-field col-span-2"><label className="rf-label">Description <span className="rf-hint inline">optional</span></label><textarea className="rf-textarea" rows={2} value={item.description} onChange={e => updateCustomItem(cs.id, item.id, "description", e.target.value)} /></div>
                    </div>
                  </div>
                ))}
                <button className="button-secondary w-full py-2.5 text-sm" onClick={() => addCustomItem(cs.id)}>+ Add Item</button>
              </div>
            </SectionShell>
          ))}

          <SectionShell id="template" label="Template & Settings" icon="🎨" open={openSection === "template"} onToggle={toggleSection}>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="rf-label mb-0">Output Template <span className="rf-hint inline normal-case font-normal">— {resumeTemplates.length} designs</span></p>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {templateCategories.map(cat => (
                    <button key={cat} type="button" onClick={() => setTemplateCategoryFilter(cat)} className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${templateCategoryFilter === cat ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "bg-white border-[var(--stroke)] text-[var(--ink-soft)] hover:border-[var(--accent)]"}`}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {filteredTemplates.map(t => { const sel = t.id === selectedTemplate; return (
                    <label key={t.id} className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${sel ? "border-[var(--accent)] shadow-md" : "border-[var(--stroke)] hover:border-[var(--accent-alt)]"}`}>
                      <input type="radio" name="tpl" value={t.id} checked={sel} onChange={() => setSelectedTemplate(t.id)} className="sr-only" />
                      {sel && <div className="absolute top-2 right-2 z-10 h-5 w-5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">✓</div>}
                      <TemplateThumbnail template={t} />
                      <div className="px-2.5 py-1.5" style={{ backgroundColor: t.colors.primary }}>
                        <p className="text-[9px] font-bold text-white truncate">{t.name}</p>
                        <p className="text-[8px] capitalize" style={{ color: t.colors.accent }}>{t.category} · {t.layout}</p>
                      </div>
                    </label>
                  ); })}
                  {filteredTemplates.length === 0 && <p className="col-span-2 text-xs text-[var(--ink-soft)] text-center py-4">No templates in this category yet.</p>}
                </div>
              </div>
              <div className="rf-field">
                <label className="rf-label">Accent Color <span className="rf-hint inline normal-case font-normal">— override this template's default accent</span></label>
                <div className="flex flex-wrap items-center gap-2">
                  {["#2563eb", "#0f766e", "#dc2626", "#7c3aed", "#d97706", "#db2777", "#0891b2", "#4d7c0f"].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCustomAccentColor(c)}
                      className="h-7 w-7 rounded-full border-2 transition-all"
                      style={{ backgroundColor: c, borderColor: customAccentColor === c ? "var(--foreground)" : "transparent" }}
                      aria-label={`Use accent color ${c}`}
                    />
                  ))}
                  <label className="h-7 w-7 rounded-full border-2 border-[var(--stroke)] overflow-hidden cursor-pointer relative flex items-center justify-center" title="Custom color">
                    <input
                      type="color"
                      value={customAccentColor ?? tpl.colors.accent}
                      onChange={e => setCustomAccentColor(e.target.value)}
                      className="absolute -top-1 -left-1 h-9 w-9 cursor-pointer"
                    />
                  </label>
                  {customAccentColor && (
                    <button type="button" onClick={() => setCustomAccentColor(null)} className="text-xs text-[var(--ink-soft)] underline underline-offset-2 hover:text-[var(--accent)]">Reset to default</button>
                  )}
                </div>
              </div>
              <div className="rf-field">
                <label className="rf-label">Page Size</label>
                <div className="flex rounded-lg border border-[var(--stroke)] overflow-hidden">
                  <button type="button" onClick={() => setPageSize("A4")} className={`flex-1 py-2 text-xs font-semibold transition-all ${pageSize === "A4" ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--ink-soft)] hover:bg-[#fafaf8]"}`}>A4</button>
                  <button type="button" onClick={() => setPageSize("Letter")} className={`flex-1 py-2 text-xs font-semibold border-l border-[var(--stroke)] transition-all ${pageSize === "Letter" ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--ink-soft)] hover:bg-[#fafaf8]"}`}>US Letter</button>
                </div>
                <p className="rf-hint mt-1">A4 is standard outside the US; use US Letter for American employers.</p>
              </div>
              <div className="rf-field">
                <label className="rf-label">Job Description <span className="rf-hint inline normal-case font-normal">— optional, boosts ATS match</span></label>
                <textarea className="rf-textarea" rows={5} placeholder="Paste the job description here. AI extracts keywords and weaves them into your resume to improve ATS pass-through." value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
              </div>
            </div>
          </SectionShell>

          {/* CTA */}
          <div className="pt-2 pb-8">
            {error && <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2"><span className="flex-shrink-0 mt-0.5">⚠</span>{error}</div>}
            <button className="button-primary w-full py-4 text-base font-bold" onClick={mode === "scratch" ? handleGenerate : handleEnhance} disabled={processing || rightPanel === "parsing"}>
              {processing
                ? <span className="flex items-center justify-center gap-2"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{mode === "scratch" ? "Generating with AI…" : "Enhancing with AI…"}</span>
                : mode === "scratch" ? "✦  Generate My Resume" : "✦  Enhance My Resume"
              }
            </button>
            <p className="mt-2 text-center text-xs text-[var(--ink-soft)]">Free · Private · Runs on local AI · No data sent to cloud</p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────
            RIGHT: Dynamic panel
        ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* UPLOAD ZONE */}
          {rightPanel === "upload-zone" && (
            <div className="flex h-full flex-col items-center justify-center px-8 py-12">
              <div className="w-full max-w-md">
                <div className="flex rounded-xl border border-[var(--stroke)] overflow-hidden mb-6">
                  <button type="button" onClick={() => setImportSource("file")} className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${importSource === "file" ? "bg-[var(--accent-alt)] text-white" : "bg-white text-[var(--ink-soft)] hover:bg-[#fafaf8]"}`}>📄 Upload File</button>
                  <button type="button" onClick={() => setImportSource("linkedin")} className={`flex-1 px-4 py-2.5 text-sm font-semibold border-l border-[var(--stroke)] transition-all flex items-center justify-center gap-1.5 ${importSource === "linkedin" ? "bg-[#0a66c2] text-white" : "bg-white text-[var(--ink-soft)] hover:bg-[#fafaf8]"}`}>in Import from LinkedIn</button>
                </div>

                {importSource === "file" ? (
                  <div className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 border-2 border-teal-100 text-4xl shadow-sm">📄</div>
                    <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Upload your existing resume</h2>
                    <p className="text-sm text-[var(--ink-soft)] max-w-sm mx-auto">AI reads every section — name, work history, education, skills — and pre-fills the form on the left for you to review and edit.</p>
                  </div>
                ) : (
                  <div className="mb-8">
                    <div className="text-center mb-4">
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 border-2 border-blue-100 text-3xl shadow-sm font-black text-[#0a66c2]">in</div>
                      <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Import from LinkedIn</h2>
                      <p className="text-sm text-[var(--ink-soft)] max-w-sm mx-auto">We never log in to LinkedIn or scrape your account. Export your own profile, then bring it here.</p>
                    </div>
                    <ol className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-1.5 text-xs text-[var(--foreground)]">
                      <li><strong>1.</strong> Open your LinkedIn profile → click <strong>More</strong> → <strong>Save to PDF</strong>.</li>
                      <li><strong>2.</strong> Upload the downloaded PDF below — or open it and paste the text.</li>
                      <li><strong>3.</strong> AI extracts your experience, education, and skills automatically.</li>
                    </ol>
                  </div>
                )}

                {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
                <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-[var(--stroke)] bg-white px-8 py-10 text-center hover:border-[var(--accent-alt)] hover:bg-teal-50/40 transition-all group mb-4">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📎</div>
                  <p className="font-semibold text-[var(--foreground)] mb-1">{importSource === "linkedin" ? "Drop your LinkedIn PDF export here" : "Drop your file here or click to browse"}</p>
                  <p className="text-xs text-[var(--ink-soft)]">PDF, DOCX, or TXT supported</p>
                  <input type="file" accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onFileUpload} className="sr-only" />
                </label>
                <div className="text-center mb-3">
                  <button className="text-xs text-[var(--ink-soft)] hover:text-[var(--accent)] underline underline-offset-2 transition-colors" onClick={() => setShowPaste(!showPaste)}>
                    {showPaste ? "▲ Hide" : importSource === "linkedin" ? "▼ Or paste your LinkedIn profile text instead" : "▼ Or paste resume text instead"}
                  </button>
                </div>
                {showPaste && (
                  <div className="space-y-2">
                    <textarea className="rf-textarea text-xs" rows={7} placeholder={importSource === "linkedin" ? "Paste your LinkedIn profile text here…\n\nJohn Smith\nSenior Product Manager at Acme Corp\n\nExperience\nAcme Corp — Senior Product Manager…" : "Paste your resume text here…\n\nJohn Smith\njohn@email.com | +1-555-0000\n\nEXPERIENCE\nSoftware Engineer at Acme Corp…"} value={pasteText} onChange={e => setPasteText(e.target.value)} />
                    {pasteText.trim() && (
                      <button className="button-secondary w-full py-2.5 text-sm" onClick={() => parseResumeText(pasteText)}>Load Resume →</button>
                    )}
                  </div>
                )}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {["Extracts all personal info", "Reads each work experience", "Pulls education details", "Identifies skills & certs"].map(f => (
                    <div key={f} className="flex items-center gap-2 rounded-lg border border-[var(--stroke)] bg-white px-3 py-2">
                      <span className="h-3.5 w-3.5 rounded-full bg-teal-100 text-teal-700 text-[8px] flex items-center justify-center font-bold flex-shrink-0">✓</span>
                      <span className="text-[11px] text-[var(--ink-soft)]">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PARSING */}
          {rightPanel === "parsing" && (
            <div className="flex h-full flex-col items-center justify-center gap-6 px-8 py-16">
              <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-[var(--accent-alt)] border-t-transparent" />
              <div className="text-center">
                <p className="font-bold text-[var(--foreground)] text-xl mb-1">Reading your resume…</p>
                <p className="text-sm text-[var(--ink-soft)]">AI is extracting name, contact info, work history, education, and skills</p>
              </div>
              <div className="w-80 space-y-3 animate-pulse">
                {[85, 65, 90, 50, 75, 60, 80, 45].map((w, i) => <div key={i} className="h-3 rounded-full bg-[var(--stroke)]" style={{ width: `${w}%` }} />)}
              </div>
            </div>
          )}

          {/* LIVE PREVIEW */}
          {rightPanel === "preview" && (
            <div className="bg-[#e8e4db] min-h-full px-8 py-6">
              <div className="max-w-2xl mx-auto mb-5">
                <LiveResumeScore
                  personal={personal}
                  experience={sortedExperience}
                  education={education}
                  skills={selectedSkills}
                  certifications={certifications}
                  jobDescription={jobDescription}
                  projects={includeProjects ? projects : []}
                  onAddKeyword={addKeywordAsSkill}
                />
              </div>
              <div className="flex items-center justify-between mb-5 max-w-2xl mx-auto">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Live Preview</p>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">Click any section below to jump straight to editing it · Template: <span className="font-semibold" style={{ color: tpl.colors.accent }}>{tpl.name}</span></p>
                </div>
                {mode === "upload" && <span className="badge badge-green">Pre-filled from your resume</span>}
              </div>
              <div className="shadow-2xl max-w-2xl mx-auto flex justify-center">
                <ScaledResumeDocument data={buildPrintPayload()} scale={0.62} onSectionClick={handlePreviewSectionClick} />
              </div>
            </div>
          )}

          {/* RESULTS */}
          {rightPanel === "results" && (
            <div className="px-6 py-5 space-y-5 max-w-3xl">

              {/* ATS Score header */}
              <div className="rounded-2xl border border-[var(--stroke)] bg-white p-5 flex items-center gap-5 shadow-sm">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-4 text-2xl font-black flex-shrink-0" style={{ borderColor: atsColor, color: atsColor }}>
                  {atsScore ?? "—"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">{mode === "scratch" ? "Generated ATS Score" : "Enhanced ATS Score"}</p>
                    {improveResult?.aiAnalysis && <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest">AI Enhanced</span>}
                  </div>
                  <p className="text-2xl font-black" style={{ color: atsColor }}>
                    {atsScore ? (atsScore >= 85 ? "Excellent" : atsScore >= 70 ? "Good" : atsScore >= 55 ? "Fair" : "Needs Work") : "—"}
                  </p>
                  {improveResult?.aiAnalysis && (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--ink-soft)]">Strength: <strong>{improveResult.aiAnalysis.overallStrength}/10</strong> — {STRENGTH_LABELS[improveResult.aiAnalysis.overallStrength]}</span>
                      {TONE_BADGE[improveResult.aiAnalysis.tone] && <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: TONE_BADGE[improveResult.aiAnalysis.tone].color }}>{TONE_BADGE[improveResult.aiAnalysis.tone].label}</span>}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[var(--ink-soft)]">Template</p>
                  <p className="font-semibold text-sm" style={{ color: tpl.colors.accent }}>{tpl.name}</p>
                  {exportContent && <div className="mt-2"><ExportButton resumeContent={exportContent} /></div>}
                </div>
              </div>

              {/* Missing keywords */}
              {(() => {
                const missing = mode === "scratch" ? (generatedResume?.missingKeywords ?? []) : (improveResult?.score.missingKeywords ?? []);
                return missing.length > 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-2">Missing JD Keywords</p>
                    <div className="flex flex-wrap gap-1.5">{missing.map(kw => <span key={kw} className="badge badge-amber">{kw}</span>)}</div>
                  </div>
                ) : null;
              })()}

              {/* SCRATCH mode: generated resume */}
              {mode === "scratch" && generatedResume && (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-lg flex justify-center bg-[#e8e4db] py-6">
                    <ScaledResumeDocument data={buildPrintPayload()} scale={0.72} onSectionClick={handlePreviewSectionClick} />
                  </div>
                  {generatedResume.sections.map(sec => (
                    <div key={sec.title} className="card p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-alt)] mb-3">{sec.title}</p>
                      <ul className="space-y-1.5">{sec.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm"><span className="text-[var(--accent)] mt-0.5 flex-shrink-0">▸</span>{b}</li>
                      ))}</ul>
                    </div>
                  ))}
                </div>
              )}

              {/* UPLOAD mode: AI insights + enhanced resume */}
              {mode === "upload" && improveResult && (
                <div className="space-y-4">
                  {improveResult.aiAnalysis && (
                    <div className="flex rounded-xl border border-[var(--stroke)] overflow-hidden">
                      <button onClick={() => setResultTab("insights")} className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-all ${resultTab === "insights" ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--ink-soft)] hover:bg-[#fafaf8]"}`}>✦ AI Insights</button>
                      <button onClick={() => setResultTab("enhanced")} className={`flex-1 px-4 py-2.5 text-sm font-semibold border-l border-[var(--stroke)] transition-all ${resultTab === "enhanced" ? "bg-[var(--foreground)] text-white" : "bg-white text-[var(--ink-soft)] hover:bg-[#fafaf8]"}`}>◎ Enhanced Resume</button>
                    </div>
                  )}

                  {resultTab === "insights" && improveResult.aiAnalysis && (
                    <div className="space-y-4">
                      <div className="card p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)] mb-3">What AI Found</p>
                        <div className="flex flex-wrap gap-3">
                          <div className="rounded-lg bg-[#fafaf8] border border-[var(--stroke)] px-4 py-2.5"><p className="text-[10px] text-[var(--ink-soft)] uppercase tracking-widest">Detected Role</p><p className="font-semibold text-sm mt-0.5">{improveResult.aiAnalysis.detectedRole}</p></div>
                          <div className="rounded-lg bg-[#fafaf8] border border-[var(--stroke)] px-4 py-2.5"><p className="text-[10px] text-[var(--ink-soft)] uppercase tracking-widest">Level</p><p className="font-semibold text-sm capitalize mt-0.5">{improveResult.aiAnalysis.experienceLevel}</p></div>
                          <div className="rounded-lg bg-[#fafaf8] border border-[var(--stroke)] px-4 py-2.5"><p className="text-[10px] text-[var(--ink-soft)] uppercase tracking-widest">Strength</p><p className="font-semibold text-sm mt-0.5">{improveResult.aiAnalysis.overallStrength}/10</p></div>
                        </div>
                      </div>
                      {improveResult.aiAnalysis.topImprovements.length > 0 && (
                        <div className="rounded-xl border-2 border-[var(--accent)] bg-orange-50 p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3">✦ Priority Changes</p>
                          <ol className="space-y-2">{improveResult.aiAnalysis.topImprovements.map((imp, i) => <li key={i} className="flex items-start gap-2.5 text-sm"><span className="font-black text-[var(--accent)] flex-shrink-0">{i + 1}.</span>{imp}</li>)}</ol>
                        </div>
                      )}
                      {improveResult.aiAnalysis.sections.length > 0 && (
                        <div className="card p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)] mb-3">Section Feedback</p>
                          <div className="space-y-3">{improveResult.aiAnalysis.sections.map((sec, i) => (
                            <div key={i} className="rounded-xl border border-[var(--stroke)] bg-[#fafaf8] p-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-alt)] mb-1.5">{sec.name}</p>
                              <p className="text-xs text-rose-700 flex items-start gap-1.5 mb-1.5"><span className="flex-shrink-0">⚠</span>{sec.issue}</p>
                              <p className="text-xs text-teal-700 flex items-start gap-1.5"><span className="flex-shrink-0">→</span>{sec.suggestion}</p>
                            </div>
                          ))}</div>
                        </div>
                      )}
                      <div className="card p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-3">Upgrades Applied</p>
                        <ul className="space-y-1.5">{improveResult.upgrades.map(item => <li key={item} className="flex items-start gap-2 text-sm"><span className="text-teal-600 mt-0.5">✓</span>{item}</li>)}</ul>
                      </div>
                      <button className="button-secondary w-full py-2.5 text-sm" onClick={() => setResultTab("enhanced")}>View Enhanced Resume →</button>
                    </div>
                  )}

                  {(resultTab === "enhanced" || !improveResult.aiAnalysis) && (
                    <div className="space-y-4">
                      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: tpl.colors.background }}>
                        <div className="px-8 py-5" style={{ backgroundColor: tpl.colors.primary }}>
                          <p className="text-base font-bold text-white">{personal.fullName || "Enhanced Resume"}</p>
                          <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: tpl.colors.accent }}>{tpl.name} Template</p>
                        </div>
                        <div className="px-8 py-6"><pre className="whitespace-pre-wrap text-[11px] leading-relaxed font-sans" style={{ color: tpl.colors.primary }}>{improveResult.rewrittenResume}</pre></div>
                      </div>
                      <div className="flex gap-3">
                        <button className="button-primary flex-1 py-3 text-sm" onClick={() => { navigator.clipboard.writeText(improveResult.rewrittenResume); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? "✓ Copied!" : "Copy Enhanced Resume"}</button>
                        {improveResult.aiAnalysis && <button className="button-secondary px-4 py-3 text-sm" onClick={() => setResultTab("insights")}>← AI Insights</button>}
                      </div>
                      {improveResult.score.recommendations.length > 0 && (
                        <div className="card p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-alt)] mb-3">Next Steps</p>
                          <ol className="space-y-2">{improveResult.score.recommendations.map((rec, i) => <li key={rec} className="flex items-start gap-2.5 text-sm"><span className="font-bold text-[var(--accent)] flex-shrink-0">{i + 1}.</span>{rec}</li>)}</ol>
                        </div>
                      )}
                      <div className="pb-8" />
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}
