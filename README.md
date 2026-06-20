# ResumeForge AI

ResumeForge AI is a full-stack Next.js application to create high-quality resumes from scratch or improve existing resumes using market-aware intelligence.

**🎯 NEW:** Full local LLM support - run entirely offline with Ollama or llama.cpp, zero API costs!

## What this includes

- Create-from-scratch resume generation flow
- Existing resume enhancement flow
- Upload resume files (PDF, DOCX, TXT) and auto-extract text
- ATS scoring API with keyword and quality analysis
- Resume parsing API for legacy text and multipart files
- Market trends module with role-level demand signals
- **Optional local LLM integration** (Ollama/llama.cpp) - free, offline, portable
- Optional OpenAI integration with deterministic fallback

## Competitive reference strategy

This build takes inspiration from well-known resume platforms (for example, LiveCareer) and implements comparable core capabilities while adding stronger differentiation:

- Comparable baseline:
  - ATS-ready output orientation
  - role-specific content suggestions
  - upload or paste existing resume and modernize quickly
  - template and example mindset for faster writing
- Added differentiators:
  - market trend intelligence for role targeting
  - filler-language and impact-quality checks
  - unified create + improve workspace with consistent scoring
  - **local LLM support** - zero API costs, fully portable

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
- New resume: /new-resume
- Improve resume: /improve-resume
- Market trends: /market-trends

## API routes

- POST /api/generate
- POST /api/improve
- POST /api/parse
  - JSON: { resumeText }
  - multipart/form-data: file (PDF, DOCX, TXT)
- POST /api/ats-score
- GET /api/market-trends

## Notes

- If OPENAI_API_KEY is missing, all flows still work using deterministic generation logic.
- API outputs are ATS-readable plain text and structured data.
