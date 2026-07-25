# ResumeForge AI

ResumeForge AI is a full-stack Next.js application that builds a resume from scratch or improves an existing one in a single unified workspace, backed by market-aware AI intelligence.

**🎯 NEW:** Full local LLM support - run entirely offline with Ollama or llama.cpp, zero API costs!

## ✨ Latest features (unified builder v2)

- **One builder, two modes** — `/new-resume` opens a mode-selection screen: *Build from Scratch* or *Upload & Improve*. `/improve-resume` now simply redirects here, so all your old links still work.
- **Import from LinkedIn** — export your own LinkedIn profile as a PDF (`Profile → More → Save to PDF`) and upload it, or paste the profile text directly. We never log in to or scrape LinkedIn on your behalf.
- **40+ resume templates** — 21 curated color palettes × 2 layout engines (single-column and two-column sidebar) across 8 categories: Modern, Classic, Minimal, Creative, Executive, Academic, Technical, and ATS-safe. Filter by category directly inside the builder or on `/templates`.
- **Pixel-perfect PDF export** — the "🖨 Download PDF" button opens a dedicated print view (`/resume-print`) that renders your exact template (colors, layout, fonts) and triggers the browser's native print-to-PDF, so the download matches the on-screen design exactly.
- **Live Resume Score (Build → Score → Target)** — a score panel recalculates on every keystroke while you fill in the form, with a section completion checklist and one-click "+" buttons to add missing job-description keywords straight into your Skills.
- **Per-bullet AI rewrite** — click "✨ AI Improve" next to any experience entry to rewrite just that bullet block into stronger, metric-aware language.
- **AI-assisted proofreading** — click "🔍 Proofread" for a grammar/clarity/tone report (passive voice, repetition, filler words, missing metrics, first-person pronouns) with a writing-quality score. Runs on deterministic heuristics with an optional AI pass for extra suggestions.
- **Autosave & draft recovery** — your in-progress resume saves to your browser automatically; if you navigate away, a "Resume in progress found" banner lets you pick up where you left off.
- **Section completion guidance** — a slim progress bar tracks how complete your resume is (contact info, summary, experience, education, skills) so you always know what's left.

## What this includes

- Unified create-from-scratch + improve-existing resume workspace
- Upload resume files (PDF, DOCX, TXT) or LinkedIn PDF export, auto-extracted into an editable structured form
- ATS scoring API with keyword and quality analysis, plus a live client-side score while editing
- Resume proofreading/grammar-check API (heuristic + optional AI)
- Per-bullet AI rewrite API
- Pixel-perfect print-to-PDF export matching the chosen template exactly
- 40+ templates across 8 categories and 2 layout engines
- Market trends module with role-level demand signals
- **Optional local LLM integration** (Ollama/llama.cpp) - free, offline, portable
- Optional OpenAI integration with deterministic fallback everywhere

## Competitive reference strategy

This build benchmarks against leading resume platforms — Kickresume, Rezi, Teal, EnhanCV, Resume.io, Novorésumé — and implements comparable core capabilities while adding stronger differentiation:

- Comparable baseline:
  - ATS-ready output orientation with real-time scoring (Rezi's "Build/Score/Target" loop)
  - LinkedIn import and existing-resume upload (Kickresume, EnhanCV)
  - large, categorized template library (Kickresume's 40+ templates)
  - built-in proofreading/grammar checker (EnhanCV)
  - one-click job-description keyword targeting (Rezi)
- Added differentiators:
  - market trend intelligence for role targeting
  - unified create + improve workspace with consistent scoring (no separate tools/tabs)
  - pixel-perfect print-to-PDF that always matches the live preview
  - **local LLM support** - zero API costs, fully portable, fully private

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Optional OpenAI SDK
- Optional local LLM (Ollama/llama.cpp)

## Run locally

### 🚀 What Are My Options?

**You have 3 choices:**

1. **Ollama (Recommended for beginners)** - Easiest setup, automatic everything
2. **llama.cpp (For advanced users)** - Lighter weight, more control
3. **Cloud Only** - Use OpenAI API (costs money)

---

### Option 1: Ollama - Easiest Setup (Recommended)

**What is this?** Ollama is a simple program that runs AI models on your computer. Once you set it up, ResumeForge can use it for free to generate resumes.

#### Step 1: Install Ollama (one-time setup)

Open Terminal and paste this:
```bash
brew install ollama
```

**What you should see:**
- Installation messages scrolling
- Eventually says "done" or similar
- Takes 1-2 minutes

#### Step 2: Start Ollama Server (keep this running)

In the **same Terminal**, paste:
```bash
ollama serve
```

**⚠️ IMPORTANT:** Keep this Terminal window open. Don't close it or press Ctrl+C.

**What you should see:**
```
Ollama is running on http://localhost:11434
```

#### Step 3: Download the AI Model (in a NEW Terminal tab)

Press **Cmd+T** to open a new Terminal tab (keep the first tab running).

In the new tab, paste:
```bash
ollama pull mistral
```

**What you should see:**
```
pulling manifest
pulling 975e...
pulling ef97...
...
success
```

This downloads the AI model (about 4GB, takes 2-5 minutes depending on internet speed).

**❓ Which model was downloaded?**

To see the exact model, run:
```bash
ollama list
```

You should see:
```
NAME                 ID              SIZE
mistral:latest       2e405b12efb3    4.1 GB
```

**Want a specific Mistral version?** You can choose from:

```bash
# Latest (recommended)
ollama pull mistral:latest

# Or specific versions
ollama pull mistral:7b-instruct    # Best for instructions
ollama pull mistral:7b              # Base model
```

**Want to try a different model?** Download one:

```bash
ollama pull llama2                  # Llama 2 (versatile)
ollama pull neural-chat             # Neural Chat (fast)
ollama pull phi                     # Phi (lightweight)
```

Then in Step 6, edit `.env.local` and change:
```env
LOCAL_MODEL=llama2
```

#### Step 4: Setup ResumeForge (in another NEW Terminal tab)

Press **Cmd+T** again to open another new Terminal tab.

Paste:
```bash
cd /Users/meena-5181/ResumeBuilder
npm install
cp .env.example .env.local
```

#### Step 5: Tell ResumeForge to use Ollama

Open the file `.env.local` in a text editor:
- Find the line that says `# USE_LOCAL_MODEL=false`
- Delete the `#` at the start so it says `USE_LOCAL_MODEL=true`
- Find `# LOCAL_MODEL_URL=http://localhost:11434` and delete the `#`
- Find `# LOCAL_MODEL=mistral` and delete the `#`
- Save the file

**Your file should look like:**
```env
USE_LOCAL_MODEL=true
LOCAL_MODEL_URL=http://localhost:11434
LOCAL_MODEL=mistral
OPENAI_API_KEY=
```

#### Step 6: Start ResumeForge

In the same Terminal tab, paste:
```bash
npm run dev
```

**What you should see:**
```
ready - started server on 0.0.0.0:3000
```

#### Step 7: Open ResumeForge

Open your web browser and go to: **http://localhost:3000**

You should see the ResumeForge website. Try creating a resume - it will use your local AI model for **free**! ✅

---

### Option 2: llama.cpp - Lightweight Alternative

**What is this?** Similar to Ollama, but uses fewer resources. Good if you have an old computer or want to run on a server.

#### Step 1: Install llama.cpp

Open Terminal and paste:
```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make
```

**What this does:** Downloads and builds the llama.cpp program (takes 2-5 minutes).

#### Step 2: Download the AI Model

Choose which model you want. **Recommended: Mistral 7B Instruct**

```bash
# Recommended: Mistral 7B Instruct (best quality for instructions)
wget https://huggingface.co/TheBloke/Mistral-7B-GGUF/resolve/main/mistral-7b-instruct-v0.1.Q4_K_M.gguf
```

**Or choose another model:**

```bash
# Llama 2 7B
wget https://huggingface.co/TheBloke/Llama-2-7B-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf

# Neural Chat 7B
wget https://huggingface.co/TheBloke/neural-chat-7B-v3-2-GGUF/resolve/main/neural-chat-7b-v3-2.Q4_K_M.gguf

# Phi 2.7B (lightweight)
wget https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q4_K_M.gguf
```

**What this does:** Downloads the AI model (about 4GB, takes 2-5 minutes).

#### Step 3: Start llama.cpp Server

Paste (replace `mistral-7b-instruct-v0.1.Q4_K_M.gguf` with your downloaded filename if different):
```bash
./server -m mistral-7b-instruct-v0.1.Q4_K_M.gguf -ngl 33
```

**What you should see:**
```
http server listening on port 8080
```

**⚠️ IMPORTANT:** Keep this Terminal open.

#### Step 4: Setup ResumeForge (in a NEW Terminal tab)

Press **Cmd+T** for a new tab, then paste:
```bash
cd /Users/meena-5181/ResumeBuilder
npm install
cp .env.local .env.local
```

Open `.env.local` file and edit these lines:
```env
USE_LOCAL_MODEL=true
LOCAL_MODEL_URL=http://localhost:8080
LOCAL_MODEL=mistral
```

#### Step 5: Start ResumeForge

Paste:
```bash
npm run dev
```

Go to: **http://localhost:3000** ✅

---

### Option 3: Cloud Only (OpenAI - Costs Money)

```bash
cd /Users/meena-5181/ResumeBuilder
npm install
cp .env.example .env.local
```

Edit `.env.local`:
```env
USE_LOCAL_MODEL=false
OPENAI_API_KEY=sk-your-key-here
```

Then:
```bash
npm run dev
```

Go to: **http://localhost:3000** ✅

---

### Advanced Setup

See [SETUP_LOCAL_LLM.md](SETUP_LOCAL_LLM.md) for:
- Troubleshooting
- GPU acceleration
- Different AI models to try
- Production deployment

## Key routes

- Home: /
- Dashboard: /dashboard
- Resume builder (build from scratch or upload & improve): /new-resume
- Improve resume (redirects to /new-resume): /improve-resume
- Pixel-perfect print/export view: /resume-print
- Templates gallery (40+ templates, filter by category): /templates
- ATS score checker: /ats-score
- Bullet suggestions: /suggestions
- Cover letter generator: /cover-letter
- Market trends: /market-trends
- Interview prep: /interview-prep

## API routes

- POST /api/generate — build a resume from structured form input
- POST /api/improve — rewrite an existing resume with AI analysis + ATS score
- POST /api/improve-bullet — rewrite a single experience bullet block
- POST /api/proofread — grammar/clarity/tone check with a writing-quality score
- POST /api/parse
  - JSON: { resumeText }
  - multipart/form-data: file (PDF, DOCX, TXT, or LinkedIn PDF export)
- POST /api/parse-structured — turn raw resume/LinkedIn text into structured fields (name, experience, education, skills…)
- POST /api/ats-score — keyword/quality ATS scoring, optional AI-enhanced insights
- POST /api/suggestions — role-specific bullet suggestions (35+ roles, O*NET-enriched)
- POST /api/cover-letter — generate a tone-matched cover letter
- POST /api/export — plain-text-based PDF/DOCX/TXT export (fallback; use /resume-print for pixel-perfect PDF)
- GET /api/market-trends

## Notes

- If OPENAI_API_KEY is missing, every flow still works using deterministic heuristic logic — including proofreading and per-bullet rewriting.
- For the most visually accurate PDF, use the "🖨 Download PDF" button inside the builder (print-to-PDF flow) rather than the legacy /api/export PDF, which is plain-text only.
- LinkedIn import works by exporting your own profile as a PDF from LinkedIn's official "Save to PDF" feature — the app never logs in to or scrapes LinkedIn.
