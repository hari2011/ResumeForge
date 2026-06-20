"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AtsScoreResult, ParsedResumeStructure, ResumeAnalysis } from "@/types/resume";
import { resumeTemplates } from "@/data/templates";

// Local form types (include client-side id for keyed rendering)
interface WorkEntry { id: string; company: string; title: string; location: string; startDate: string; endDate: string; current: boolean; description: string; }
interface EduEntry { id: string; institution: string; degree: string; field: string; startYear: string; endYear: string; gpa: string; }
interface ParsedForm {
  fullName: string; email: string; phone: string; location: string; linkedin: string;
  targetRole: string; summary: string;
  experience: WorkEntry[];
  education: EduEntry[];
  skills: string[];
  certifications: string;
}
interface ImproveResponse { rewrittenResume: string; score: AtsScoreResult; upgrades: string[]; aiAnalysis?: ResumeAnalysis; }

type RightState = "empty" | "parsing" | "edit" | "results";
type ResultTab = "insights" | "enhanced";

function uid() { return Math.random().toString(36).slice(2, 9); }

const STRENGTH_LABELS = ["", "Very Weak", "Weak", "Below Average", "Average", "Fair", "Good", "Strong", "Very Strong", "Excellent", "Outstanding"];
const TONE_BADGE: Record<string, { label: string; color: string }> = {
  active: { label: "Active Voice ✓", color: "#0f766e" },
  passive: { label: "Passive Voice ⚠", color: "#d97706" },
  mixed: { label: "Mixed Voice", color: "#6366f1" },
};

function SectionHeader({ id, label, icon, count, open, onToggle }: { id: string; label: string; icon: string; count?: number; open: boolean; onToggle: (id: string) => void; }) {
  return (
    <div className="flex items-center justify-between cursor-pointer px-4 py-3 border-b border-[var(--stroke)] hover:bg-[var(--panel)] transition-colors" onClick={() => onToggle(id)}>
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
        {count !== undefined && <span className="badge">{count}</span>}
      </div>
      <span style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", fontSize: "11px", color: "var(--ink-soft)" }}>▼</span>
    </div>
  );
}

function serializeFormToText(form: ParsedForm): string {
  const parts: string[] = [];
  if (form.fullName) parts.push(form.fullName);
  const contacts = [form.email, form.phone, form.location, form.linkedin].filter(Boolean);
  if (contacts.length) parts.push(contacts.join(" | "));
  if (form.summary) { parts.push(""); parts.push("PROFESSIONAL SUMMARY"); parts.push(form.summary); }
  if (form.experience.length > 0) {
    parts.push(""); parts.push("EXPERIENCE");
    [...form.experience]
      .sort((a, b) => (b.current ? 1 : 0) - (a.current ? 1 : 0) || b.startDate.localeCompare(a.startDate))
      .forEach((exp) => {
        parts.push(`${exp.title}${exp.company ? ` at ${exp.company}` : ""}${exp.location ? ` (${exp.location})` : ""}`);
        if (exp.startDate || exp.endDate || exp.current) parts.push(`${exp.startDate || ""} – ${exp.current ? "Present" : exp.endDate || ""}`);
        if (exp.description) parts.push(exp.description);
        parts.push("");
      });
  }
  if (form.education.length > 0) {
    parts.push("EDUCATION");
    form.education.forEach((edu) => {
      parts.push(`${edu.degree}${edu.field ? ` in ${edu.field}` : ""}${edu.institution ? ` – ${edu.institution}` : ""}${edu.endYear ? ` (${edu.endYear})` : ""}`);
    });
  }
  if (form.skills.length > 0) { parts.push(""); parts.push("SKILLS"); parts.push(form.skills.join(", ")); }
  if (form.certifications) { parts.push(""); parts.push("CERTIFICATIONS"); parts.push(form.certifications); }
  return parts.join("\n");
}

export default function ImproveResumePage() {
  const [rightState, setRightState] = useState<RightState>("empty");
  const [pasteText, setPasteText] = useState("");
  const [parsedForm, setParsedForm] = useState<ParsedForm | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(resumeTemplates[0]?.id);
  const [useAi, setUseAi] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [result, setResult] = useState<ImproveResponse | null>(null);
  const [resultTab, setResultTab] = useState<ResultTab>("insights");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["personal", "experience", "education", "skills", "certifications"]));
  const [customSkill, setCustomSkill] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("rf_last_template");
    if (stored) setSelectedTemplate(stored);
  }, []);

  function toggleSection(id: string) {
    setOpenSections((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  async function processText(text: string) {
    setRightState("parsing");
    setError(null);
    try {
      const res = await fetch("/api/parse-structured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
      });
      if (!res.ok) throw new Error("Could not parse resume.");
      const data = (await res.json()) as ParsedResumeStructure;
      const form: ParsedForm = {
        ...data,
        experience: data.experience.map((e) => ({ ...e, id: uid() })),
        education: data.education.map((e) => ({ ...e, id: uid() })),
      };
      setParsedForm(form);
      if (!targetRole && data.targetRole) setTargetRole(data.targetRole);
      setRightState("edit");
    } catch {
      // Fallback: empty form so user can fill manually
      setParsedForm({ fullName: "", email: "", phone: "", location: "", linkedin: "", targetRole: "", summary: text.slice(0, 500), experience: [], education: [], skills: [], certifications: "" });
      setRightState("edit");
    }
  }

  async function onFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setRightState("parsing");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: formData });
      const data = (await res.json()) as { resumeText?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not parse file.");
      await processText(data.resumeText || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse file.");
      setRightState("empty");
    } finally {
      event.target.value = "";
    }
  }

  async function handleEnhance() {
    const text = parsedForm ? serializeFormToText(parsedForm) : pasteText;
    const role = targetRole || parsedForm?.targetRole || "";
    if (!text.trim()) { setError("No resume content to enhance."); return; }
    if (!role.trim()) { setError("Please enter a target role."); return; }
    setEnhancing(true);
    setError(null);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingResume: text, targetRole: role, jobDescription, templateId: selectedTemplate }),
      });
      if (!res.ok) throw new Error("Enhancement failed.");
      const data = (await res.json()) as ImproveResponse;
      setResult(data);
      setResultTab(data.aiAnalysis ? "insights" : "enhanced");
      setRightState("results");
      localStorage.setItem("rf_last_template", selectedTemplate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setEnhancing(false);
    }
  }

  // Form helpers
  function updateWork(id: string, field: keyof WorkEntry, value: string | boolean) { setParsedForm((f) => f ? { ...f, experience: f.experience.map((e) => e.id === id ? { ...e, [field]: value } : e) } : f); }
  function addWork() { setParsedForm((f) => f ? { ...f, experience: [...f.experience, { id: uid(), company: "", title: "", location: "", startDate: "", endDate: "", current: false, description: "" }] } : f); }
  function removeWork(id: string) { setParsedForm((f) => f ? { ...f, experience: f.experience.filter((e) => e.id !== id) } : f); }
  function updateEdu(id: string, field: keyof EduEntry, value: string) { setParsedForm((f) => f ? { ...f, education: f.education.map((e) => e.id === id ? { ...e, [field]: value } : e) } : f); }
  function addEdu() { setParsedForm((f) => f ? { ...f, education: [...f.education, { id: uid(), institution: "", degree: "", field: "", startYear: "", endYear: "", gpa: "" }] } : f); }
  function removeEdu(id: string) { setParsedForm((f) => f ? { ...f, education: f.education.filter((e) => e.id !== id) } : f); }
  function removeSkill(sk: string) { setParsedForm((f) => f ? { ...f, skills: f.skills.filter((s) => s !== sk) } : f); }
  function addSkill() { const v = customSkill.trim(); if (!v || !parsedForm) return; if (!parsedForm.skills.includes(v)) setParsedForm((f) => f ? { ...f, skills: [...f.skills, v] } : f); setCustomSkill(""); }

  function resetPage() { setRightState("empty"); setParsedForm(null); setResult(null); setPasteText(""); setError(null); }

  const tpl = resumeTemplates.find((t) => t.id === selectedTemplate) || resumeTemplates[0];
  const scoreColor = result ? (result.score.score >= 85 ? "#0f766e" : result.score.score >= 70 ? "#d97706" : "#dc2626") : "#aaa";

  return (
    <AppShell title="" subtitle="" fullWidth>
      {/* ── Mode Route Tabs ── */}
      <div className="border-b border-[var(--stroke)] bg-white">
        <div className="flex items-center px-6">
          <Link
            href="/new-resume"
            className="relative flex items-center gap-2 px-5 py-4 text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--foreground)] transition-colors"
          >
            <span className="text-base">✦</span>
            Build New Resume
          </Link>
          <div className="relative flex items-center gap-2 px-5 py-4 text-sm font-bold text-[var(--accent)] border-b-2 border-[var(--accent)] -mb-px">
            <span className="text-base">📄</span>
            Improve Existing Resume
          </div>
          <div className="ml-auto pr-2 py-3">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">AI-Powered</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-64px-53px)]">

        {/* LEFT: Options panel */}
        <div className="w-[360px] flex-shrink-0 overflow-y-auto border-r border-[var(--stroke)] bg-[#fafaf8] px-5 py-5 space-y-4">

          {/* Upload / paste */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-orange-50 flex items-center justify-center text-sm">📄</div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Your Resume</p>
            </div>

            {rightState === "edit" || rightState === "results" ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-teal-50 border border-teal-200 px-3 py-2.5">
                  <span className="text-teal-600">✓</span>
                  <p className="text-xs font-semibold text-teal-800">Resume loaded into editor</p>
                </div>
                <button className="button-ghost w-full py-2 text-xs text-[var(--ink-soft)]" onClick={resetPage}>↺ Load a different resume</button>
              </div>
            ) : (
              <>
                <label className={`flex items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-[var(--stroke)] bg-white px-4 py-3.5 text-sm text-[var(--ink-soft)] hover:border-[var(--accent)] transition-colors ${rightState === "parsing" ? "opacity-60 pointer-events-none" : ""}`}>
                  <span>📎</span>
                  <span>{rightState === "parsing" ? "Reading resume…" : "Upload PDF, DOCX, or TXT"}</span>
                  <input type="file" accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onFileUpload} className="sr-only" disabled={rightState === "parsing"} />
                </label>
                <div className="text-center text-xs text-[var(--ink-soft)]">— or paste text —</div>
                <textarea className="rf-textarea text-xs" rows={6} placeholder={"Paste your resume text here…\n\nJohn Smith\nSoftware Engineer\nExperience:\n• Built…"} value={pasteText} onChange={(e) => setPasteText(e.target.value)} />
                {pasteText.trim() && (
                  <button className="button-secondary w-full py-2 text-sm" onClick={() => processText(pasteText)}>
                    Load Resume →
                  </button>
                )}
              </>
            )}
          </div>

          {/* Target role + JD */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-teal-50 flex items-center justify-center text-sm">🎯</div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Enhancement Settings</p>
            </div>
            <div className="rf-field">
              <label className="rf-label">Target Role *</label>
              <input className="rf-input" placeholder="e.g. Senior Data Engineer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
            </div>
            <div className="rf-field">
              <label className="rf-label">Job Description <span className="rf-hint inline normal-case font-normal">— optional</span></label>
              <textarea className="rf-textarea" rows={4} placeholder="Paste JD here for keyword alignment…" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
            </div>
          </div>

          {/* Template picker */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-purple-50 flex items-center justify-center text-sm">🎨</div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Output Template</p>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {resumeTemplates.map((t) => {
                const sel = t.id === selectedTemplate;
                return (
                  <label key={t.id} className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${sel ? "border-[var(--accent)]" : "border-[var(--stroke)] hover:border-[var(--accent-alt)]"}`}>
                    <input type="radio" name="tpl" value={t.id} checked={sel} onChange={() => setSelectedTemplate(t.id)} className="sr-only" />
                    {sel && <div className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-[var(--accent)] text-white text-[8px] flex items-center justify-center font-bold">✓</div>}
                    <div className="h-10 p-1.5 flex flex-col gap-0.5" style={{ backgroundColor: t.colors.background }}>
                      <div className="h-1.5 rounded-sm w-2/3" style={{ backgroundColor: t.colors.primary }} />
                      <div className="h-1 rounded-sm w-1/2" style={{ backgroundColor: t.colors.accent }} />
                    </div>
                    <div className="px-1.5 py-1" style={{ backgroundColor: t.colors.primary }}>
                      <p className="text-[8px] font-bold text-white truncate">{t.name}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* AI toggle */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-white px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">AI Enhancement</p>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5">{useAi ? "Deep semantic rewrite + section analysis" : "Keyword-optimised ATS rewrite"}</p>
            </div>
            <button onClick={() => setUseAi(!useAi)} className="relative flex-shrink-0 ml-4 h-6 w-11 rounded-full transition-colors duration-200" style={{ backgroundColor: useAi ? "var(--accent)" : "var(--stroke)" }}>
              <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200" style={{ transform: useAi ? "translateX(20px)" : "translateX(2px)" }} />
            </button>
          </div>

          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

          <button
            className="button-primary w-full py-3.5 text-base"
            onClick={handleEnhance}
            disabled={enhancing || rightState === "parsing" || (rightState === "empty" && !pasteText.trim())}
          >
            {enhancing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {useAi ? "AI Enhancing…" : "Enhancing…"}
              </span>
            ) : "✦  Enhance Resume"}
          </button>

          {rightState === "results" && (
            <button className="button-secondary w-full py-2 text-sm" onClick={() => setRightState("edit")}>← Back to Edit</button>
          )}
        </div>

        {/* RIGHT: Dynamic panel */}
        <div className="flex-1 overflow-y-auto">

          {/* EMPTY */}
          {rightState === "empty" && (
            <div className="flex h-full flex-col items-center justify-center text-center py-24 px-8">
              <p className="text-5xl mb-4">📄</p>
              <p className="text-xl font-semibold text-[var(--foreground)]">Upload or paste your resume to begin</p>
              <p className="mt-2 text-sm text-[var(--ink-soft)] max-w-md">AI will read every section — name, contact, work history, education, skills — and load them into an editable form. You can review and edit before enhancing.</p>
              <div className="mt-6 grid grid-cols-2 gap-2 max-w-sm text-xs text-[var(--ink-soft)]">
                {["Extracts all personal info", "Reads each work experience", "Pulls education details", "Identifies skills & certs", "Editable before AI enhance", "Template-styled output"].map((f) => (
                  <span key={f} className="rounded-lg border border-[var(--stroke)] bg-white px-3 py-2 text-left">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* PARSING */}
          {rightState === "parsing" && (
            <div className="flex h-full flex-col items-center justify-center gap-5 py-24 px-8">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
              <div className="text-center">
                <p className="font-semibold text-[var(--foreground)]">AI is reading your resume…</p>
                <p className="text-sm text-[var(--ink-soft)] mt-1">Extracting name, contact info, work history, education, and skills</p>
              </div>
              <div className="w-72 space-y-2.5 animate-pulse">
                {[85, 65, 90, 50, 75, 60].map((w, i) => <div key={i} className="h-3 rounded-full bg-[var(--stroke)]" style={{ width: `${w}%` }} />)}
              </div>
            </div>
          )}

          {/* EDIT */}
          {rightState === "edit" && parsedForm && (
            <div className="px-6 py-5">
              <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-bold text-[var(--foreground)]">Edit Your Resume</p>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">AI pre-populated the sections below from your uploaded resume. Edit anything, then click Enhance.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-green">Resume loaded</span>
                  <span className="text-xs text-[var(--ink-soft)]">{parsedForm.experience.length} jobs · {parsedForm.education.length} qualifications · {parsedForm.skills.length} skills</span>
                </div>
              </div>

              <div className="space-y-3 max-w-3xl">

                {/* Personal Info */}
                <div className="rounded-xl border border-[var(--stroke)] bg-white overflow-hidden">
                  <SectionHeader id="personal" label="Personal Info" icon="👤" open={openSections.has("personal")} onToggle={toggleSection} />
                  {openSections.has("personal") && (
                    <div className="p-4 grid grid-cols-2 gap-3">
                      <div className="rf-field col-span-2"><label className="rf-label">Full Name</label><input className="rf-input" value={parsedForm.fullName} onChange={(e) => setParsedForm((f) => f ? { ...f, fullName: e.target.value } : f)} /></div>
                      <div className="rf-field col-span-2"><label className="rf-label">Target / Current Role</label><input className="rf-input" placeholder="e.g. Product Manager" value={parsedForm.targetRole} onChange={(e) => { setParsedForm((f) => f ? { ...f, targetRole: e.target.value } : f); if (!targetRole) setTargetRole(e.target.value); }} /></div>
                      <div className="rf-field"><label className="rf-label">Email</label><input className="rf-input" type="email" value={parsedForm.email} onChange={(e) => setParsedForm((f) => f ? { ...f, email: e.target.value } : f)} /></div>
                      <div className="rf-field"><label className="rf-label">Phone</label><input className="rf-input" value={parsedForm.phone} onChange={(e) => setParsedForm((f) => f ? { ...f, phone: e.target.value } : f)} /></div>
                      <div className="rf-field"><label className="rf-label">Location</label><input className="rf-input" value={parsedForm.location} onChange={(e) => setParsedForm((f) => f ? { ...f, location: e.target.value } : f)} /></div>
                      <div className="rf-field"><label className="rf-label">LinkedIn</label><input className="rf-input" value={parsedForm.linkedin} onChange={(e) => setParsedForm((f) => f ? { ...f, linkedin: e.target.value } : f)} /></div>
                      <div className="rf-field col-span-2"><label className="rf-label">Professional Summary</label><textarea className="rf-textarea" rows={3} value={parsedForm.summary} onChange={(e) => setParsedForm((f) => f ? { ...f, summary: e.target.value } : f)} /></div>
                    </div>
                  )}
                </div>

                {/* Work Experience */}
                <div className="rounded-xl border border-[var(--stroke)] bg-white overflow-hidden">
                  <SectionHeader id="experience" label="Work Experience" icon="💼" count={parsedForm.experience.length} open={openSections.has("experience")} onToggle={toggleSection} />
                  {openSections.has("experience") && (
                    <div className="p-4 space-y-4">
                      {parsedForm.experience.length === 0 && <p className="text-sm text-[var(--ink-soft)] text-center py-3">No experience entries extracted. Add below.</p>}
                      {parsedForm.experience.map((exp, idx) => (
                        <div key={exp.id} className="rounded-xl border border-[var(--stroke)] p-4 space-y-3">
                          <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Position {idx + 1}</p><button className="button-danger px-2 py-1 text-xs" onClick={() => removeWork(exp.id)}>Remove</button></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rf-field col-span-2"><label className="rf-label">Company</label><input className="rf-input" value={exp.company} onChange={(e) => updateWork(exp.id, "company", e.target.value)} /></div>
                            <div className="rf-field col-span-2"><label className="rf-label">Job Title</label><input className="rf-input" value={exp.title} onChange={(e) => updateWork(exp.id, "title", e.target.value)} /></div>
                            <div className="rf-field"><label className="rf-label">Location</label><input className="rf-input" value={exp.location} onChange={(e) => updateWork(exp.id, "location", e.target.value)} /></div>
                            <div className="rf-field"><label className="rf-label">Start Date</label><input className="rf-input" type="month" value={exp.startDate} onChange={(e) => updateWork(exp.id, "startDate", e.target.value)} /></div>
                            <div className="rf-field"><label className="rf-label">End Date</label><input className="rf-input" type="month" value={exp.endDate} disabled={exp.current} onChange={(e) => updateWork(exp.id, "endDate", e.target.value)} /></div>
                            <div className="rf-field flex items-center gap-2 pt-5"><input type="checkbox" id={`cur-${exp.id}`} checked={exp.current} onChange={(e) => updateWork(exp.id, "current", e.target.checked)} /><label htmlFor={`cur-${exp.id}`} className="text-sm">Currently here</label></div>
                            <div className="rf-field col-span-2"><label className="rf-label">Achievements & Responsibilities</label><textarea className="rf-textarea" rows={4} value={exp.description} onChange={(e) => updateWork(exp.id, "description", e.target.value)} /></div>
                          </div>
                        </div>
                      ))}
                      <button className="button-secondary w-full py-2 text-sm" onClick={addWork}>+ Add Position</button>
                    </div>
                  )}
                </div>

                {/* Education */}
                <div className="rounded-xl border border-[var(--stroke)] bg-white overflow-hidden">
                  <SectionHeader id="education" label="Education" icon="🎓" count={parsedForm.education.length} open={openSections.has("education")} onToggle={toggleSection} />
                  {openSections.has("education") && (
                    <div className="p-4 space-y-4">
                      {parsedForm.education.length === 0 && <p className="text-sm text-[var(--ink-soft)] text-center py-3">No education entries extracted. Add below.</p>}
                      {parsedForm.education.map((edu, idx) => (
                        <div key={edu.id} className="rounded-xl border border-[var(--stroke)] p-4 space-y-3">
                          <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Qualification {idx + 1}</p><button className="button-danger px-2 py-1 text-xs" onClick={() => removeEdu(edu.id)}>Remove</button></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rf-field col-span-2"><label className="rf-label">Institution</label><input className="rf-input" value={edu.institution} onChange={(e) => updateEdu(edu.id, "institution", e.target.value)} /></div>
                            <div className="rf-field"><label className="rf-label">Degree</label><input className="rf-input" value={edu.degree} onChange={(e) => updateEdu(edu.id, "degree", e.target.value)} /></div>
                            <div className="rf-field"><label className="rf-label">Field</label><input className="rf-input" value={edu.field} onChange={(e) => updateEdu(edu.id, "field", e.target.value)} /></div>
                            <div className="rf-field"><label className="rf-label">Start Year</label><input className="rf-input" value={edu.startYear} onChange={(e) => updateEdu(edu.id, "startYear", e.target.value)} /></div>
                            <div className="rf-field"><label className="rf-label">End Year</label><input className="rf-input" value={edu.endYear} onChange={(e) => updateEdu(edu.id, "endYear", e.target.value)} /></div>
                          </div>
                        </div>
                      ))}
                      <button className="button-secondary w-full py-2 text-sm" onClick={addEdu}>+ Add Education</button>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="rounded-xl border border-[var(--stroke)] bg-white overflow-hidden">
                  <SectionHeader id="skills" label="Skills" icon="⚡" count={parsedForm.skills.length} open={openSections.has("skills")} onToggle={toggleSection} />
                  {openSections.has("skills") && (
                    <div className="p-4 space-y-3">
                      {parsedForm.skills.length === 0 && <p className="text-sm text-[var(--ink-soft)]">No skills extracted. Add them below.</p>}
                      <div className="flex flex-wrap gap-2">{parsedForm.skills.map((sk) => (<button key={sk} onClick={() => removeSkill(sk)} className="skill-tag gap-1">{sk} <span className="opacity-60">×</span></button>))}</div>
                      <div className="flex gap-2">
                        <input className="rf-input flex-1" placeholder="Add a skill…" value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} />
                        <button className="button-secondary px-4 py-2 text-sm" onClick={addSkill}>Add</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Certifications */}
                <div className="rounded-xl border border-[var(--stroke)] bg-white overflow-hidden">
                  <SectionHeader id="certifications" label="Certifications & Awards" icon="🏆" open={openSections.has("certifications")} onToggle={toggleSection} />
                  {openSections.has("certifications") && (
                    <div className="p-4">
                      <textarea className="rf-textarea" rows={4} placeholder={"AWS Solutions Architect — Amazon, 2024\nPMP Certification — PMI, 2023"} value={parsedForm.certifications} onChange={(e) => setParsedForm((f) => f ? { ...f, certifications: e.target.value } : f)} />
                    </div>
                  )}
                </div>

                <div className="pb-8" />
              </div>
            </div>
          )}

          {/* RESULTS */}
          {rightState === "results" && result && (
            <div className="px-6 py-5 space-y-4 max-w-3xl">
              {/* ATS score bar */}
              <div className="card p-5 flex items-center gap-5">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-4 text-2xl font-black" style={{ borderColor: scoreColor, color: scoreColor }}>{result.score.score}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Enhanced ATS Score</p>
                    {result.aiAnalysis && <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest">AI Enhanced</span>}
                  </div>
                  <p className="text-xl font-black" style={{ color: scoreColor }}>{result.score.score >= 85 ? "Excellent" : result.score.score >= 70 ? "Good" : result.score.score >= 55 ? "Fair" : "Needs Work"}</p>
                  {result.aiAnalysis && (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--ink-soft)]">Strength: <strong>{result.aiAnalysis.overallStrength}/10</strong> — {STRENGTH_LABELS[result.aiAnalysis.overallStrength]}</span>
                      {TONE_BADGE[result.aiAnalysis.tone] && <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: TONE_BADGE[result.aiAnalysis.tone].color }}>{TONE_BADGE[result.aiAnalysis.tone].label}</span>}
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--ink-soft)] text-right flex-shrink-0">Template<br /><span className="font-semibold" style={{ color: tpl.colors.accent }}>{tpl.name}</span></p>
              </div>

              {/* Tabs */}
              {result.aiAnalysis && (
                <div className="flex rounded-xl border border-[var(--stroke)] overflow-hidden">
                  <button onClick={() => setResultTab("insights")} className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-all ${resultTab === "insights" ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--ink-soft)] hover:bg-[var(--panel)]"}`}>✦ AI Insights</button>
                  <button onClick={() => setResultTab("enhanced")} className={`flex-1 px-4 py-2.5 text-sm font-semibold border-l border-[var(--stroke)] transition-all ${resultTab === "enhanced" ? "bg-[var(--foreground)] text-white" : "bg-white text-[var(--ink-soft)] hover:bg-[var(--panel)]"}`}>◎ Enhanced Resume</button>
                </div>
              )}

              {/* AI Insights */}
              {(resultTab === "insights" && result.aiAnalysis) && (
                <div className="space-y-4">
                  <div className="card p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)] mb-3">What AI Found</p>
                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-lg bg-[var(--panel)] px-4 py-2.5"><p className="text-[10px] text-[var(--ink-soft)] uppercase tracking-widest">Detected Role</p><p className="font-semibold text-sm mt-0.5">{result.aiAnalysis.detectedRole}</p></div>
                      <div className="rounded-lg bg-[var(--panel)] px-4 py-2.5"><p className="text-[10px] text-[var(--ink-soft)] uppercase tracking-widest">Level</p><p className="font-semibold text-sm capitalize mt-0.5">{result.aiAnalysis.experienceLevel}</p></div>
                      <div className="rounded-lg bg-[var(--panel)] px-4 py-2.5"><p className="text-[10px] text-[var(--ink-soft)] uppercase tracking-widest">Strength</p><p className="font-semibold text-sm mt-0.5">{result.aiAnalysis.overallStrength}/10</p></div>
                    </div>
                  </div>
                  {result.aiAnalysis.topImprovements.length > 0 && (
                    <div className="rounded-xl border-2 border-[var(--accent)] bg-orange-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3">✦ Priority Changes</p>
                      <ol className="space-y-2">{result.aiAnalysis.topImprovements.map((imp, i) => <li key={i} className="flex items-start gap-2.5 text-sm"><span className="font-black text-[var(--accent)] flex-shrink-0">{i + 1}.</span>{imp}</li>)}</ol>
                    </div>
                  )}
                  {result.aiAnalysis.sections.length > 0 && (
                    <div className="card p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)] mb-3">Section Feedback</p>
                      <div className="space-y-3">{result.aiAnalysis.sections.map((sec, i) => (
                        <div key={i} className="rounded-xl border border-[var(--stroke)] bg-[var(--panel)] p-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-alt)] mb-1.5">{sec.name}</p>
                          <p className="text-xs text-rose-700 flex items-start gap-1.5 mb-1.5"><span className="flex-shrink-0 mt-0.5">⚠</span>{sec.issue}</p>
                          <p className="text-xs text-teal-700 flex items-start gap-1.5"><span className="flex-shrink-0 mt-0.5">→</span>{sec.suggestion}</p>
                        </div>
                      ))}</div>
                    </div>
                  )}
                  {result.score.missingKeywords.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-2">Missing JD Keywords</p>
                      <div className="flex flex-wrap gap-1.5">{result.score.missingKeywords.map((kw) => <span key={kw} className="badge badge-amber">{kw}</span>)}</div>
                    </div>
                  )}
                  <div className="card p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-3">Upgrades Applied</p>
                    <ul className="space-y-1.5">{result.upgrades.map((item) => <li key={item} className="flex items-start gap-2 text-sm"><span className="text-teal-600 mt-0.5">✓</span>{item}</li>)}</ul>
                  </div>
                  <button className="button-secondary w-full py-2.5 text-sm" onClick={() => setResultTab("enhanced")}>View Enhanced Resume →</button>
                </div>
              )}

              {/* Enhanced Resume */}
              {(resultTab === "enhanced" || !result.aiAnalysis) && (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: tpl.colors.background }}>
                    <div className="px-8 py-5" style={{ backgroundColor: tpl.colors.primary }}>
                      <p className="text-base font-bold text-white">{parsedForm?.fullName || targetRole || "Enhanced Resume"}</p>
                      <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: tpl.colors.accent }}>{tpl.name} Template</p>
                    </div>
                    <div className="px-8 py-6">
                      <pre className="whitespace-pre-wrap text-[11px] leading-relaxed font-sans" style={{ color: tpl.colors.primary }}>{result.rewrittenResume}</pre>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="button-primary flex-1 py-3 text-sm" onClick={() => { navigator.clipboard.writeText(result.rewrittenResume); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? "✓ Copied!" : "Copy Enhanced Resume"}</button>
                    {result.aiAnalysis && <button className="button-secondary px-4 py-3 text-sm" onClick={() => setResultTab("insights")}>← AI Insights</button>}
                  </div>
                  {result.score.recommendations.length > 0 && (
                    <div className="card p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-alt)] mb-3">Next Steps</p>
                      <ol className="space-y-2">{result.score.recommendations.map((rec, i) => <li key={rec} className="flex items-start gap-2.5 text-sm"><span className="font-bold text-[var(--accent)] flex-shrink-0">{i + 1}.</span>{rec}</li>)}</ol>
                    </div>
                  )}
                  <div className="pb-8" />
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}
