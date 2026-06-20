"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ExportButton } from "@/components/export-button";
import { industries, industrySkills, marketCoreSkills, getEducationRecommendation } from "@/data/career-options";
import { marketTrends } from "@/data/market-trends";
import { resumeTemplates } from "@/data/templates";
import { GeneratedResume } from "@/types/resume";

interface WorkEntry { id: string; company: string; title: string; location: string; startDate: string; endDate: string; current: boolean; description: string; }
interface EduEntry { id: string; institution: string; degree: string; field: string; startYear: string; endYear: string; gpa: string; notes: string; }
interface ProjectEntry { id: string; name: string; role: string; year: string; description: string; }
interface PersonalInfo { fullName: string; email: string; phone: string; location: string; linkedin: string; website: string; targetRole: string; summary: string; }
type Section = "personal" | "experience" | "education" | "skills" | "projects" | "certifications" | "template";
interface NewResumeResponse { resume: GeneratedResume; }

function uid() { return Math.random().toString(36).slice(2, 9); }

function SectionShell({ id, label, icon, open, onToggle, children, badge }: { id: Section; label: string; icon: string; open: boolean; onToggle: (s: Section) => void; children: React.ReactNode; badge?: string; }) {
  return (
    <div className="section-card">
      <div className="section-header" onClick={() => onToggle(id)}>
        <div className="section-title">
          <span>{icon}</span>{label}
          {badge && <span className="badge badge-orange ml-2">{badge}</span>}
        </div>
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0)", display: "inline-block", transition: "transform 0.2s", fontSize: "11px", color: "var(--ink-soft)" }}>▼</span>
      </div>
      {open && <div className="border-t border-[var(--stroke)] p-5">{children}</div>}
    </div>
  );
}

function ResumePreview({ personal, experience, education, skills, result, templateId }: { personal: PersonalInfo; experience: WorkEntry[]; education: EduEntry[]; skills: string[]; result: GeneratedResume | null; templateId: string; }) {
  const tpl = resumeTemplates.find((t) => t.id === templateId) || resumeTemplates[0];
  const name = personal.fullName || "Your Name";
  const role = personal.targetRole || "Target Role";
  const summary = result?.summary || personal.summary || "Your professional summary will appear here after generation.";
  return (
    <div className="resume-doc w-full" style={{ backgroundColor: tpl.colors.background }}>
      <div className="px-7 py-5" style={{ backgroundColor: tpl.colors.primary }}>
        <div className="text-lg font-bold" style={{ color: "#fff" }}>{name}</div>
        <div className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: tpl.colors.accent }}>{role}</div>
        <div className="mt-2 flex flex-wrap gap-x-3 text-[9px]" style={{ color: "rgba(255,255,255,0.75)" }}>
          {personal.email && <span>✉ {personal.email}</span>}
          {personal.phone && <span>✆ {personal.phone}</span>}
          {personal.location && <span>⌖ {personal.location}</span>}
          {personal.linkedin && <span>in {personal.linkedin}</span>}
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <div className="text-[8px] font-bold uppercase tracking-widest pb-1 mb-2 border-b" style={{ color: tpl.colors.accent, borderColor: tpl.colors.accent }}>Professional Summary</div>
          <p className="text-[8.5px] leading-relaxed" style={{ color: tpl.colors.primary }}>{summary}</p>
        </div>
        {(experience.some((e) => e.company) || result) && (
          <div>
            <div className="text-[8px] font-bold uppercase tracking-widest pb-1 mb-2 border-b" style={{ color: tpl.colors.accent, borderColor: tpl.colors.accent }}>Experience</div>
            {result?.sections.find((s) => s.title === "Experience") ? (
              <ul className="space-y-1">{result.sections.find((s) => s.title === "Experience")!.bullets.slice(0, 5).map((b, i) => (
                <li key={i} className="flex gap-1.5 text-[8px]" style={{ color: tpl.colors.primary }}><span style={{ color: tpl.colors.accent }}>▸</span><span>{b}</span></li>
              ))}</ul>
            ) : experience.filter((e) => e.company).map((exp) => (
              <div key={exp.id} className="mb-2">
                <div className="flex justify-between"><span className="text-[8.5px] font-bold" style={{ color: tpl.colors.primary }}>{exp.title || "Job Title"}</span><span className="text-[7.5px]" style={{ color: tpl.colors.accent }}>{exp.startDate}{exp.current ? "– Present" : exp.endDate ? `– ${exp.endDate}` : ""}</span></div>
                <div className="text-[8px]" style={{ color: tpl.colors.accent }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
              </div>
            ))}
          </div>
        )}
        {education.some((e) => e.institution) && (
          <div>
            <div className="text-[8px] font-bold uppercase tracking-widest pb-1 mb-2 border-b" style={{ color: tpl.colors.accent, borderColor: tpl.colors.accent }}>Education</div>
            {education.filter((e) => e.institution).map((edu) => (
              <div key={edu.id} className="mb-1.5">
                <div className="flex justify-between"><span className="text-[8.5px] font-bold" style={{ color: tpl.colors.primary }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</span><span className="text-[7.5px]" style={{ color: tpl.colors.accent }}>{edu.endYear}</span></div>
                <div className="text-[8px]" style={{ color: tpl.colors.accent }}>{edu.institution}</div>
              </div>
            ))}
          </div>
        )}
        {skills.length > 0 && (
          <div>
            <div className="text-[8px] font-bold uppercase tracking-widest pb-1 mb-2 border-b" style={{ color: tpl.colors.accent, borderColor: tpl.colors.accent }}>Skills</div>
            <div className="flex flex-wrap gap-1">{skills.slice(0, 12).map((sk) => (
              <span key={sk} className="rounded px-1.5 py-0.5 text-[7.5px] font-medium" style={{ backgroundColor: `${tpl.colors.accent}18`, color: tpl.colors.accent }}>{sk}</span>
            ))}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewResumePage() {
  const [openSection, setOpenSection] = useState<Section>("personal");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedResume | null>(null);
  const [personal, setPersonal] = useState<PersonalInfo>({ fullName: "", email: "", phone: "", location: "", linkedin: "", website: "", targetRole: "", summary: "" });
  const [experience, setExperience] = useState<WorkEntry[]>([{ id: "work-0", company: "", title: "", location: "", startDate: "", endDate: "", current: false, description: "" }]);
  const [education, setEducation] = useState<EduEntry[]>([{ id: "edu-0", institution: "", degree: "", field: "", startYear: "", endYear: "", gpa: "", notes: "" }]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [industry, setIndustry] = useState(industries[0]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [certifications, setCertifications] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>(resumeTemplates[0]?.id);

  useEffect(() => {
    const stored = localStorage.getItem("rf_last_template");
    if (stored) setSelectedTemplate(stored);
  }, []);

  useEffect(() => { localStorage.setItem("rf_last_template", selectedTemplate); }, [selectedTemplate]);

  const roleSuggested = useMemo(() => { const norm = personal.targetRole.toLowerCase(); return marketTrends.find((t) => norm.includes(t.role.toLowerCase()))?.topSkills ?? []; }, [personal.targetRole]);
  const skillOptions = useMemo(() => Array.from(new Set([...(industrySkills[industry] ?? []), ...roleSuggested, ...marketCoreSkills])).slice(0, 28), [industry, roleSuggested]);
  const educationHint = useMemo(() => getEducationRecommendation(personal.targetRole), [personal.targetRole]);

  // Sort entries: current role first, then by startDate descending, blank dates last
  const sortedExperience = useMemo(() => [...experience].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    if (!a.startDate && !b.startDate) return 0;
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return b.startDate.localeCompare(a.startDate);
  }), [experience]);

  function toggleSection(s: Section) { setOpenSection((cur) => (cur === s ? "personal" : s)); }
  function toggleSkill(sk: string) { setSelectedSkills((cur) => cur.includes(sk) ? cur.filter((x) => x !== sk) : [...cur, sk].slice(0, 18)); }
  function addCustomSkill() { const v = customSkill.trim(); if (!v) return; setSelectedSkills((cur) => cur.includes(v) ? cur : [...cur, v].slice(0, 18)); setCustomSkill(""); }

  function addWorkEntry() { setExperience((cur) => [...cur, { id: uid(), company: "", title: "", location: "", startDate: "", endDate: "", current: false, description: "" }]); }
  function updateWork(id: string, field: keyof WorkEntry, value: string | boolean) { setExperience((cur) => cur.map((e) => e.id === id ? { ...e, [field]: value } : e)); }
  function removeWork(id: string) { setExperience((cur) => cur.filter((e) => e.id !== id)); }

  function addEduEntry() { setEducation((cur) => [...cur, { id: uid(), institution: "", degree: "", field: "", startYear: "", endYear: "", gpa: "", notes: "" }]); }
  function updateEdu(id: string, field: keyof EduEntry, value: string) { setEducation((cur) => cur.map((e) => e.id === id ? { ...e, [field]: value } : e)); }
  function removeEdu(id: string) { setEducation((cur) => cur.filter((e) => e.id !== id)); }

  function addProject() { setProjects((cur) => [...cur, { id: uid(), name: "", role: "", year: "", description: "" }]); }
  function updateProject(id: string, field: keyof ProjectEntry, value: string) { setProjects((cur) => cur.map((p) => p.id === id ? { ...p, [field]: value } : p)); }
  function removeProject(id: string) { setProjects((cur) => cur.filter((p) => p.id !== id)); }

  async function handleGenerate() {
    if (!personal.fullName || !personal.targetRole) { setError("Please fill in your Full Name and Target Role first."); setOpenSection("personal"); return; }
    if (selectedSkills.length < 2) { setError("Please select at least 2 skills."); setOpenSection("skills"); return; }
    setGenerating(true); setError(null);
    const achievements = experience.map((e) => e.description).filter(Boolean).join("\n");
    const educationStr = education.filter((e) => e.institution || e.degree).map((e) => `${e.degree}${e.field ? ` in ${e.field}` : ""} — ${e.institution}${e.endYear ? `, ${e.endYear}` : ""}`).join("\n");
    const payload = { fullName: personal.fullName, targetRole: personal.targetRole, yearsOfExperience: experience.filter((e) => e.company).length, industries: industry, skills: selectedSkills, achievements: achievements || personal.summary || "Experienced professional.", education: educationStr, certifications, jobDescription, templateId: selectedTemplate };
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Generation failed");
      const data = (await res.json()) as NewResumeResponse;
      setResult(data.resume);
      setPersonal((cur) => ({ ...cur, summary: data.resume.summary }));
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setGenerating(false); }
  }

  const tpl = resumeTemplates.find((t) => t.id === selectedTemplate) || resumeTemplates[0];
  const atsColor = result ? (result.score >= 85 ? "#0f766e" : result.score >= 70 ? "#d97706" : "#dc2626") : "#aaa";
  const exportContent = result ? { name: personal.fullName, title: personal.targetRole, email: personal.email || "your.email@example.com", phone: personal.phone || "(555) 123-4567", summary: result.summary, templateId: selectedTemplate, sections: result.sections } : null;

  return (
    <AppShell title="Resume Builder" subtitle="Fill in your details — live preview updates as you type" fullWidth>
      <div className="flex min-h-[calc(100vh-64px)]">

        {/* LEFT: Form panel */}
        <div className="w-full max-w-[560px] flex-shrink-0 overflow-y-auto border-r border-[var(--stroke)] bg-[#fafaf8] px-5 py-5 space-y-3">

          <SectionShell id="personal" label="Personal Info" icon="👤" open={openSection === "personal"} onToggle={toggleSection} badge="Required">
            <div className="grid grid-cols-2 gap-3">
              <div className="rf-field col-span-2"><label className="rf-label">Full Name *</label><input className="rf-input" placeholder="e.g. Priya Anand" value={personal.fullName} onChange={(e) => setPersonal((c) => ({ ...c, fullName: e.target.value }))} /></div>
              <div className="rf-field col-span-2"><label className="rf-label">Target Role *</label><input className="rf-input" placeholder="e.g. Product Manager" value={personal.targetRole} onChange={(e) => setPersonal((c) => ({ ...c, targetRole: e.target.value }))} /></div>
              <div className="rf-field"><label className="rf-label">Email</label><input className="rf-input" type="email" placeholder="you@example.com" value={personal.email} onChange={(e) => setPersonal((c) => ({ ...c, email: e.target.value }))} /></div>
              <div className="rf-field"><label className="rf-label">Phone</label><input className="rf-input" placeholder="+1 (555) 000-0000" value={personal.phone} onChange={(e) => setPersonal((c) => ({ ...c, phone: e.target.value }))} /></div>
              <div className="rf-field"><label className="rf-label">Location</label><input className="rf-input" placeholder="City, Country" value={personal.location} onChange={(e) => setPersonal((c) => ({ ...c, location: e.target.value }))} /></div>
              <div className="rf-field"><label className="rf-label">LinkedIn</label><input className="rf-input" placeholder="linkedin.com/in/you" value={personal.linkedin} onChange={(e) => setPersonal((c) => ({ ...c, linkedin: e.target.value }))} /></div>
              <div className="rf-field col-span-2"><label className="rf-label">Website / Portfolio</label><input className="rf-input" placeholder="https://yoursite.com" value={personal.website} onChange={(e) => setPersonal((c) => ({ ...c, website: e.target.value }))} /></div>
              <div className="rf-field col-span-2"><label className="rf-label">Industry</label><select className="rf-select" value={industry} onChange={(e) => setIndustry(e.target.value)}>{industries.map((ind) => <option key={ind}>{ind}</option>)}</select></div>
              <div className="rf-field col-span-2"><label className="rf-label">Professional Summary <span className="rf-hint inline">· AI will improve this</span></label><textarea className="rf-textarea" rows={3} placeholder="Brief 2–3 line overview of your professional story…" value={personal.summary} onChange={(e) => setPersonal((c) => ({ ...c, summary: e.target.value }))} /></div>
            </div>
          </SectionShell>

          <SectionShell id="experience" label="Work Experience" icon="💼" open={openSection === "experience"} onToggle={toggleSection}>
            <div className="space-y-5">
              {sortedExperience.map((exp, idx) => (
                <div key={exp.id} className="rounded-xl border border-[var(--stroke)] bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Position {idx + 1}</p>{experience.length > 1 && <button className="button-danger px-2 py-1 text-xs" onClick={() => removeWork(exp.id)}>Remove</button>}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rf-field col-span-2"><label className="rf-label">Company / Organisation</label><input className="rf-input" placeholder="Acme Corp" value={exp.company} onChange={(e) => updateWork(exp.id, "company", e.target.value)} /></div>
                    <div className="rf-field col-span-2"><label className="rf-label">Job Title</label><input className="rf-input" placeholder="Senior Product Manager" value={exp.title} onChange={(e) => updateWork(exp.id, "title", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Location</label><input className="rf-input" placeholder="City, Country" value={exp.location} onChange={(e) => updateWork(exp.id, "location", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Start Date</label><input className="rf-input" type="month" value={exp.startDate} onChange={(e) => updateWork(exp.id, "startDate", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">End Date</label><input className="rf-input" type="month" value={exp.endDate} disabled={exp.current} onChange={(e) => updateWork(exp.id, "endDate", e.target.value)} /></div>
                    <div className="rf-field flex items-center gap-2 pt-5"><input type="checkbox" id={`cur-${exp.id}`} checked={exp.current} onChange={(e) => updateWork(exp.id, "current", e.target.checked)} /><label htmlFor={`cur-${exp.id}`} className="text-sm">Currently here</label></div>
                    <div className="rf-field col-span-2">
                      <label className="rf-label">Achievements & Responsibilities</label>
                      <p className="rf-hint">Include numbers: "Grew revenue by 40%" or "Led team of 8"</p>
                      <textarea className="rf-textarea mt-1" rows={4} placeholder={"• Led cross-functional team of 8 to launch…\n• Improved conversion rate by 23% through…\n• Reduced cost by $200K by renegotiating…"} value={exp.description} onChange={(e) => updateWork(exp.id, "description", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button className="button-secondary w-full py-2.5 text-sm" onClick={addWorkEntry}>+ Add Another Position</button>
            </div>
          </SectionShell>

          <SectionShell id="education" label="Education" icon="🎓" open={openSection === "education"} onToggle={toggleSection}>
            <div className="space-y-5">
              {personal.targetRole && (
                <div className="rounded-lg bg-teal-50 border border-teal-100 px-3 py-2.5 text-xs text-teal-800">
                  <strong>Suggested for {personal.targetRole}:</strong> {educationHint.recommended} in {educationHint.fields.slice(0, 3).join(", ")}
                </div>
              )}
              {education.map((edu, idx) => (
                <div key={edu.id} className="rounded-xl border border-[var(--stroke)] bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Qualification {idx + 1}</p>{education.length > 1 && <button className="button-danger px-2 py-1 text-xs" onClick={() => removeEdu(edu.id)}>Remove</button>}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rf-field col-span-2"><label className="rf-label">Institution / University / School</label><input className="rf-input" placeholder="e.g. Anna University, MIT, Coursera" value={edu.institution} onChange={(e) => updateEdu(edu.id, "institution", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Degree / Qualification</label><input className="rf-input" placeholder="B.E., MBA, Diploma…" value={edu.degree} onChange={(e) => updateEdu(edu.id, "degree", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Field / Specialisation</label><input className="rf-input" placeholder="Computer Science, Finance…" value={edu.field} onChange={(e) => updateEdu(edu.id, "field", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Start Year</label><input className="rf-input" placeholder="2016" value={edu.startYear} onChange={(e) => updateEdu(edu.id, "startYear", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">End Year / Expected</label><input className="rf-input" placeholder="2020" value={edu.endYear} onChange={(e) => updateEdu(edu.id, "endYear", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">GPA / Grade <span className="rf-hint inline">optional</span></label><input className="rf-input" placeholder="3.8 / 4.0  or  First Class" value={edu.gpa} onChange={(e) => updateEdu(edu.id, "gpa", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Notes</label><input className="rf-input" placeholder="Dean's List, Thesis topic…" value={edu.notes} onChange={(e) => updateEdu(edu.id, "notes", e.target.value)} /></div>
                  </div>
                </div>
              ))}
              <button className="button-secondary w-full py-2.5 text-sm" onClick={addEduEntry}>+ Add Another Qualification</button>
            </div>
          </SectionShell>

          <SectionShell id="skills" label="Skills" icon="⚡" open={openSection === "skills"} onToggle={toggleSection}>
            <div className="space-y-4">
              <p className="text-xs text-[var(--ink-soft)]">Skills update when you change Industry or Target Role. Select all that apply.</p>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((sk) => { const sel = selectedSkills.includes(sk); return (<button key={sk} type="button" onClick={() => toggleSkill(sk)} className={sel ? "skill-tag" : "skill-tag-neutral"}>{sel && <span>✓</span>}{sk}</button>); })}
              </div>
              {selectedSkills.length > 0 && (
                <div><p className="text-xs font-semibold text-[var(--ink-soft)] mb-2">Selected ({selectedSkills.length}/18):</p>
                <div className="flex flex-wrap gap-2">{selectedSkills.map((sk) => (<button key={sk} onClick={() => toggleSkill(sk)} className="skill-tag text-xs gap-1">{sk} <span className="opacity-60">×</span></button>))}</div></div>
              )}
              <div className="flex gap-2 pt-1">
                <input className="rf-input flex-1" placeholder="Add a custom skill…" value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomSkill()} />
                <button className="button-secondary px-4 py-2 text-sm" onClick={addCustomSkill}>Add</button>
              </div>
            </div>
          </SectionShell>

          <SectionShell id="projects" label="Projects" icon="🔧" open={openSection === "projects"} onToggle={toggleSection}>
            <div className="space-y-4">
              {projects.length === 0 && <p className="text-xs text-[var(--ink-soft)]">Add personal, academic, or open-source projects to stand out.</p>}
              {projects.map((proj, idx) => (
                <div key={proj.id} className="rounded-xl border border-[var(--stroke)] bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Project {idx + 1}</p><button className="button-danger px-2 py-1 text-xs" onClick={() => removeProject(proj.id)}>Remove</button></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rf-field col-span-2"><label className="rf-label">Project Name</label><input className="rf-input" placeholder="E-commerce Analytics Dashboard" value={proj.name} onChange={(e) => updateProject(proj.id, "name", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Your Role</label><input className="rf-input" placeholder="Lead Developer" value={proj.role} onChange={(e) => updateProject(proj.id, "role", e.target.value)} /></div>
                    <div className="rf-field"><label className="rf-label">Year</label><input className="rf-input" placeholder="2024" value={proj.year} onChange={(e) => updateProject(proj.id, "year", e.target.value)} /></div>
                    <div className="rf-field col-span-2"><label className="rf-label">Description & Impact</label><textarea className="rf-textarea" rows={3} placeholder="What was built, what tech, what was the outcome…" value={proj.description} onChange={(e) => updateProject(proj.id, "description", e.target.value)} /></div>
                  </div>
                </div>
              ))}
              <button className="button-secondary w-full py-2.5 text-sm" onClick={addProject}>+ Add Project</button>
            </div>
          </SectionShell>

          <SectionShell id="certifications" label="Certifications & Awards" icon="🏆" open={openSection === "certifications"} onToggle={toggleSection}>
            <div className="rf-field">
              <label className="rf-label">Certifications, Licences, Awards</label>
              <p className="rf-hint">One per line. Example: AWS Solutions Architect — Amazon, 2024</p>
              <textarea className="rf-textarea mt-2" rows={5} placeholder={"AWS Solutions Architect — Amazon, 2024\nPMP Certification — PMI, 2023\nDean's Award for Excellence, 2022"} value={certifications} onChange={(e) => setCertifications(e.target.value)} />
            </div>
          </SectionShell>

          <SectionShell id="template" label="Template & Job Description" icon="🎨" open={openSection === "template"} onToggle={toggleSection}>
            <div className="space-y-5">
              <div>
                <p className="rf-label mb-3">Choose Template</p>
                <div className="grid grid-cols-2 gap-3">
                  {resumeTemplates.map((t) => { const sel = t.id === selectedTemplate; return (
                    <label key={t.id} className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${sel ? "border-[var(--accent)] shadow-md" : "border-[var(--stroke)] hover:border-[var(--accent-alt)]"}`}>
                      <input type="radio" name="tpl" value={t.id} checked={sel} onChange={() => setSelectedTemplate(t.id)} className="sr-only" />
                      {sel && <div className="absolute top-2 right-2 z-10 h-5 w-5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">✓</div>}
                      <div className="h-24 p-3 flex flex-col gap-1.5" style={{ backgroundColor: t.colors.background }}>
                        <div className="h-3 rounded-sm w-3/4" style={{ backgroundColor: t.colors.primary }} />
                        <div className="h-1.5 rounded-sm w-1/2" style={{ backgroundColor: t.colors.accent }} />
                        <div className="mt-1 h-1 rounded-sm w-full opacity-30" style={{ backgroundColor: t.colors.primary }} />
                        <div className="h-1 rounded-sm w-5/6 opacity-20" style={{ backgroundColor: t.colors.primary }} />
                        <div className="h-1 rounded-sm w-4/6 opacity-15" style={{ backgroundColor: t.colors.primary }} />
                      </div>
                      <div className="px-3 py-2" style={{ backgroundColor: t.colors.primary }}>
                        <p className="text-[10px] font-bold text-white truncate">{t.name}</p>
                        <p className="text-[9px] capitalize" style={{ color: t.colors.accent }}>{t.category}</p>
                      </div>
                    </label>
                  ); })}
                </div>
              </div>
              <div className="rf-field">
                <label className="rf-label">Job Description <span className="rf-hint inline normal-case font-normal">— optional, improves ATS keyword match</span></label>
                <textarea className="rf-textarea" rows={6} placeholder="Paste the job description here. ResumeForge will extract keywords and weave them into your resume to improve ATS pass-through." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
              </div>
            </div>
          </SectionShell>

          <div className="pt-2 pb-8">
            {error && <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
            <button className="button-primary w-full py-3.5 text-base" onClick={handleGenerate} disabled={generating}>
              {generating ? (<span className="flex items-center justify-center gap-2"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Generating with AI…</span>) : "✦  Generate Resume"}
            </button>
            <p className="mt-2 text-center text-xs text-[var(--ink-soft)]">Uses local AI — free, private, no cloud required</p>
          </div>
        </div>

        {/* RIGHT: Live preview panel */}
        <div className="flex-1 overflow-y-auto bg-[#e8e4db] px-8 py-6">
          <div className="flex items-center justify-between mb-5">
            <div><p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Live Preview</p><p className="text-xs text-[var(--ink-soft)] mt-0.5">Template: <span className="font-semibold" style={{ color: tpl.colors.accent }}>{tpl.name}</span></p></div>
            {result && (
              <div className="flex items-center gap-4">
                <div className="text-right"><span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-soft)]">ATS Score</span><div className="text-2xl font-black leading-none" style={{ color: atsColor }}>{result.score}<span className="text-xs font-normal">/100</span></div></div>
                {exportContent && <ExportButton resumeContent={exportContent} />}
              </div>
            )}
          </div>
          {result?.missingKeywords && result.missingKeywords.length > 0 && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-1.5">Missing JD Keywords — add these to boost score</p>
              <div className="flex flex-wrap gap-1">{result.missingKeywords.slice(0, 8).map((kw) => <span key={kw} className="badge badge-amber">{kw}</span>)}</div>
            </div>
          )}
          <div className="shadow-2xl"><ResumePreview personal={personal} experience={sortedExperience} education={education} skills={selectedSkills} result={result} templateId={selectedTemplate} /></div>
        </div>

      </div>
    </AppShell>
  );
}
