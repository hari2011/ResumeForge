# ResumeForge AI - Local LLM Setup Guide

📚 **For Non-Technical Users:** This guide will help you run AI on your own computer to create resumes for free. Pick **Option 1 (Ollama)** if you're not sure what to do.

---

## ⚡ Quick Choice

Choose one:

- 🟢 **Option 1: Ollama** - Recommended, easiest (brew install + 2 commands)
- 🟡 **Option 2: llama.cpp** - More control, lightweight
- 🔵 **Option 3: Cloud Only** - Use OpenAI (costs money)

Both Options 1 and 2 let you run AI on your computer for **$0 cost**.

---

## 🟢 Option 1: Ollama (Recommended)

**What is Ollama?** A simple program that runs AI models on your computer, like having ChatGPT but private and free.

### Installation (One-time)

**Step 1: Open Terminal**

Press **Cmd+Space**, type `Terminal`, hit Enter.

**Step 2: Install Ollama**

Copy and paste this into Terminal:
```bash
brew install ollama
```

Press Enter. Wait for it to finish (1-2 minutes).

**What you should see:** No errors. It just installs.

### Running Ollama Server

**Step 3: Start Ollama**

In Terminal, paste:
```bash
ollama serve
```

Press Enter.

**What you should see:**
```
Ollama is running on http://localhost:11434
```

⚠️ **IMPORTANT:** Keep this Terminal open. Don't close it or press Ctrl+C. This server needs to stay running.

**Step 4: Open a NEW Terminal Tab**

Press **Cmd+T** to open a new tab (keeps the first one running).

In the new tab, paste:
```bash
ollama pull mistral
```

Press Enter. Wait for it to finish (2-5 minutes, downloads 4GB).

**What you should see:**
```
pulling manifest
pulling layers...
...
success
```

✅ The AI model is now downloaded!

**❓ Which Mistral model was downloaded?**

When you run `ollama pull mistral`, you get the latest version. To see exactly which one, run:
```bash
ollama list
```

**You should see something like:**
```
NAME                 ID              SIZE      MODIFIED
mistral:latest       2e405b12efb3    4.1 GB    2 minutes ago
```

**Want a specific Mistral version?** Ollama has many Mistral variants:

```bash
# See all available Mistral versions
ollama ls | grep mistral

# Or download a specific version:
ollama pull mistral:latest          # Latest (default)
ollama pull mistral:7b              # Mistral 7B base model
ollama pull mistral:7b-instruct     # 7B fine-tuned for instructions
ollama pull mistral:7b-instruct-v0.2  # Specific older version

# For best resume generation results:
ollama pull mistral:7b-instruct
```

**How to use a different version:**

Edit `.env.local`:
```env
USE_LOCAL_MODEL=true
LOCAL_MODEL_URL=http://localhost:11434
LOCAL_MODEL=mistral:7b-instruct    # Use specific version
```

Or just use:
```env
LOCAL_MODEL=mistral                # Uses latest version (usually best)
```

### Configure ResumeForge

**Step 5: Open another NEW Terminal tab** (Cmd+T)

Paste:
```bash
cd /Users/meena-5181/ResumeBuilder
npm install
cp .env.example .env.local
```

Press Enter. This installs ResumeForge dependencies.

**Step 6: Edit the Configuration File**

Open Finder → find the ResumeBuilder folder → look for a file called `.env.local` → right-click → Open With → TextEdit

Find and change these lines (delete the `#` at the start):

**BEFORE:**
```
# USE_LOCAL_MODEL=false
# LOCAL_MODEL_URL=http://localhost:11434
# LOCAL_MODEL=mistral
```

**AFTER:**
```
USE_LOCAL_MODEL=true
LOCAL_MODEL_URL=http://localhost:11434
LOCAL_MODEL=mistral
```

Save the file (Cmd+S).

**Step 7: Start ResumeForge**

In Terminal tab 3, paste:
```bash
npm run dev
```

Press Enter.

**What you should see:**
```
ready - started server on 0.0.0.0:3000
```

**Step 8: Open ResumeForge**

Open your web browser and go to: **http://localhost:3000**

You should see ResumeForge! Try creating a resume - it uses your local AI model for free! 🎉

---

## 🟡 Option 2: llama.cpp (Lightweight Alternative)

**What is llama.cpp?** A lighter-weight program similar to Ollama, uses fewer resources. Good if your computer is older or you want to run it on a server.

**⚠️ Note:** This option is more technical. If you're not comfortable with terminal commands, use Option 1 instead.

### Installation

**Step 1: Open Terminal**

Press **Cmd+Space**, type `Terminal`, hit Enter.

**Step 2: Download and Build llama.cpp**

Paste:
```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make
```

Press Enter. Wait 2-5 minutes while it builds.

**What you should see:** Text scrolling, eventually says "done" or has no errors.

### Download AI Model

**Step 3: Download the Model**

Paste:
```bash
wget https://huggingface.co/TheBloke/Mistral-7B-GGUF/resolve/main/mistral-7b-instruct-v0.1.Q4_K_M.gguf
```

Press Enter. Wait 2-5 minutes (downloads 4GB).

**What you should see:** Progress bar, eventually finished.

**Tip:** If `wget` doesn't work, use this instead:
```bash
curl -L -o mistral-7b-instruct-v0.1.Q4_K_M.gguf https://huggingface.co/TheBloke/Mistral-7B-GGUF/resolve/main/mistral-7b-instruct-v0.1.Q4_K_M.gguf
```

### Start Server

**Step 4: Start llama.cpp Server**

Paste:
```bash
./server -m mistral-7b-instruct-v0.1.Q4_K_M.gguf -ngl 33
```

Press Enter.

**What you should see:**
```
http server listening on port 8080
```

⚠️ **IMPORTANT:** Keep this Terminal open!

### Setup ResumeForge

**Step 5: Open a NEW Terminal tab** (Cmd+T)

Paste:
```bash
cd /Users/meena-5181/ResumeBuilder
npm install
cp .env.example .env.local
```

**Step 6: Edit Configuration**

Open `.env.local` file in TextEdit and change:

**BEFORE:**
```
# USE_LOCAL_MODEL=false
# LOCAL_MODEL_URL=http://localhost:11434
# LOCAL_MODEL=mistral
```

**AFTER:**
```
USE_LOCAL_MODEL=true
LOCAL_MODEL_URL=http://localhost:8080
LOCAL_MODEL=mistral
```

Save the file.

**Step 7: Start ResumeForge**

In Terminal tab 2, paste:
```bash
npm run dev
```

**Step 8: Open in Browser**

Go to: **http://localhost:3000** ✅

---

---

## 🎯 How It Works

**Simple explanation:** When you create a resume:

1. ResumeForge checks if Ollama or llama.cpp is running locally
2. If yes → Uses your local AI model (Free! 🎉)
3. If no → Tries OpenAI cloud (if you have an API key set)
4. If both fail → Uses built-in formulas to create a basic resume

**Cost:** $0 when using local models (just uses your computer's power)

---

## ❓ Common Questions

**Q: Which should I use, Ollama or llama.cpp?**
A: Ollama is easier. Use that unless you have a specific reason to use llama.cpp (like Docker).

**Q: Do I need a powerful computer?**
A: Mistral 7B works on any modern computer. If you have 4GB+ RAM and any GPU, you're good.

**Q: Can I try different AI models?**
A: Yes! Instead of `mistral`, try `llama2`, `neural-chat`, or `phi`. Just replace the model name in your commands and `.env.local`.

**Q: Will it work offline?**
A: Yes! Once the model is downloaded, you don't need internet.

**Q: Does it cost money?**
A: No! Local models are free. Only OpenAI costs money.

---

## 🚀 Troubleshooting

### Problem: "could not connect to ollama server"

**Solution:** Make sure you ran `ollama serve` in Terminal 1 and kept it open.

Check:
1. Is Terminal 1 still running? (Look for `Ollama is running on http://localhost:11434`)
2. Try again from Terminal 2

### Problem: "command not found: ollama"

**Solution:** Ollama didn't install properly. Try:
```bash
brew install ollama
```

### Problem: ResumeForge loads but resume generation is slow

**Solution:** This is normal! On CPU, it takes 10-20 seconds. On GPU, 2-5 seconds.

If it's very slow, check:
1. Is ollama server running? (Terminal 1 should have output)
2. Is GPU being used? (Run `ollama show mistral` to check)

### Problem: Model download is stuck or very slow

**Solution:** Your internet is slow. You can stop it (Ctrl+C) and try later. The partial download will resume.

---

## 🔧 Configuration

### Environment Variables

```env
# Local Model Settings
USE_LOCAL_MODEL=true|false          # Enable/disable local model
LOCAL_MODEL_URL=http://localhost:11434  # Ollama/llama.cpp server
LOCAL_MODEL=mistral                 # Model name

# Cloud Fallback
OPENAI_API_KEY=sk-...              # Optional: for cloud fallback
OPENAI_MODEL=gpt-4.1-mini          # Cloud model

# App
JWT_SECRET=your-secret             # Auth tokens
```

### Model Selection

| Model | Size | Speed | Quality | RAM | Notes |
|-------|------|-------|---------|-----|-------|
| **Mistral 7B** ⭐ | 4GB | ⚡⚡ | ⭐⭐⭐⭐ | 8GB | Best default |
| Llama 2 7B | 4GB | ⚡ | ⭐⭐⭐ | 8GB | Versatile |
| Neural Chat 7B | 4GB | ⚡⚡⚡ | ⭐⭐⭐ | 8GB | Fast, good quality |
| Phi 2.7B | 2GB | ⚡⚡⚡⚡ | ⭐⭐ | 4GB | Very fast, lower quality |
| Mistral Medium | 15GB | ⚡ | ⭐⭐⭐⭐⭐ | 16GB | Highest quality (if you have 16GB+ RAM) |

**For most people:** Use Mistral 7B (the default).

---

## 🤖 Understanding Ollama Models and Versions

### Check What Models You Have Downloaded

```bash
# See all downloaded models
ollama list
```

**Example output:**
```
NAME                        ID              SIZE      MODIFIED
mistral:latest              2e405b12efb3    4.1 GB    2 hours ago
mistral:7b-instruct         a6eb3bc66c09    4.1 GB    1 hour ago
llama2:latest               5046e4fb82d8    3.8 GB    yesterday
```

### Changing Your Model

**Currently using:** Whatever is set in `LOCAL_MODEL=` in `.env.local`

**To switch models:**

1. **Pull the model you want:**
```bash
# Mistral variants
ollama pull mistral:7b-instruct

# Or try another model entirely
ollama pull llama2
ollama pull neural-chat
ollama pull phi
```

2. **Edit `.env.local`:**
```env
LOCAL_MODEL=mistral:7b-instruct
```

3. **Restart ResumeForge** (`npm run dev`)

### Available Mistral Versions (If You Want Specific Ones)

```bash
# See all Mistral versions available
ollama ls | grep mistral

# Or search online: huggingface.co/ollama/mistral

# Pull specific versions:
ollama pull mistral:latest          # Default (recommended)
ollama pull mistral:7b              # Base model
ollama pull mistral:7b-instruct     # Best for instructions
ollama pull mistral:7b-instruct-v0.1
ollama pull mistral:7b-instruct-v0.2
```

**For resume generation, use:** `mistral:latest` or `mistral:7b-instruct`

### Other Popular Models to Try

```bash
# Llama 2 (versatile)
ollama pull llama2

# Neural Chat (fast, optimized for chat)
ollama pull neural-chat

# Phi (lightweight, CPU-friendly)
ollama pull phi

# Mixtral (more powerful, if you have 16GB+ RAM)
ollama pull mixtral
```

Then in `.env.local`:
```env
LOCAL_MODEL=llama2              # Use whatever model name you pulled
```

---

## ⏱️ How Fast Is It?

**Expectations:**
- **With GPU** (M1/M2, NVIDIA, AMD): 2-5 seconds to create a resume
- **CPU only**: 10-20 seconds (slow but works!)
- **OpenAI cloud**: 1-2 seconds (but costs money)

**First time is slowest** because it's loading the model. After that, it's faster.

**Want faster?**
- Enable GPU (see below)
- Use smaller model (Phi 2.7B)
- Use OpenAI cloud

---

## 🎮 Using GPU (Optional - Makes It Faster)

**macOS (M1/M2/M3):** Automatic! You don't need to do anything.

**NVIDIA GPU (GeForce/RTX):** 
1. Install CUDA 12.2 from https://developer.nvidia.com/cuda-downloads
2. Run normally - Ollama auto-detects it

**AMD GPU:** Similar setup as NVIDIA, but more complex. Search "AMD ROCm setup".

**No GPU?** Don't worry, CPU works fine!

---

## 🔍 Check If Everything Works

Open this link in your browser:
```
http://localhost:3000/api/status
```

You should see something like:
```
{
  "status": "ok",
  "activeModel": "mistral"
}
```

✅ If you see this, everything works!

---

## 🆘 Something Went Wrong?

**Issue: "Cannot connect to Ollama"**
- Make sure Terminal 1 has `ollama serve` running
- Check it says "Ollama is running on http://localhost:11434"
- Try in a new Terminal: `curl http://localhost:11434`

**Issue: Generation is very slow (15+ seconds)**
- This is normal on CPU. If you want faster, enable GPU or use OpenAI.
- Or use Phi 2.7B instead of Mistral (faster but lower quality)

**Issue: "Error: Not enough memory"**
- Your computer ran out of RAM
- Use smaller model: `ollama pull phi`
- Or increase computer memory

**Issue: Model download failed**
- Probably internet connection
- Try again - it will resume where it stopped
- Or try manual download (advanced users only)
   - Increase CPU allocation

### "Using OpenAI when I have Ollama running"

1. Check `.env.local` has `USE_LOCAL_MODEL=true`
2. Verify `LOCAL_MODEL_URL=http://localhost:11434`
3. Restart app: `npm run dev`
4. Check `/api/status` endpoint

---

## 📚 Features Using AI

All these features work with local models:

- ✅ **Resume Generation** - Create complete resume from form
- ✅ **Resume Enhancement** - Rewrite with better language
- ✅ **Bullet Suggestions** - AI-powered achievement phrases
- ✅ **Cover Letter** - Tone-based letter generation
- ✅ **ATS Scoring** - Resume vs job description matching
- ✅ **Interview Prep** - Q&A and tips
- ✅ **Market Trends** - Optional trend analysis

All **free and offline** when using local models. 🎉

---

## 🔒 Privacy

**Local Mode:** ✅ All data stays on your machine. No API calls.

**Hybrid Mode (Local + OpenAI Fallback):**
- First try local (private)
- Fall back to OpenAI if local unavailable
- Minimal API costs

**Cloud Only (No Local):** Standard OpenAI data handling

---

## 🚀 Production Deployment

### Cloud VM / Server

```bash
# On AWS/GCP/Azure VM or dedicated server
sudo apt-get install ollama
ollama pull mistral
ollama serve

# In separate terminal
npm run build
npm run start
```

### Hybrid (Recommended for Scale)

```env
USE_LOCAL_MODEL=false
OPENAI_API_KEY=sk-prod-key
```

Use cloud for production reliability, but keep local option for development.

---

## 💰 Cost Analysis

| Scenario | Cost | Notes |
|----------|------|-------|
| Local Only | $0 | Just electricity |
| Hybrid (Mostly Local) | ~$0.01/day avg | Fallback only |
| Cloud Only | ~$0.02 per resume | Predictable costs |
| High Volume (1000+/day) | Local + Cloud combo | Lowest total cost |

---

## 📖 Next Steps

1. ✅ **Install Ollama** (`brew install ollama`)
2. ✅ **Pull model** (`ollama pull mistral`)
3. ✅ **Start server** (`ollama serve`)
4. ✅ **Configure app** (set `.env.local` with `USE_LOCAL_MODEL=true`)
5. ✅ **Run app** (`npm run dev`)
6. ✅ **Generate resume** at http://localhost:3000
7. ✅ **Check status** at http://localhost:3000/api/status

---

## 🆘 Support

- **Ollama Issues:** https://github.com/ollama/ollama/issues
- **llama.cpp Issues:** https://github.com/ggerganov/llama.cpp/issues
- **ResumeForge Issues:** Check GitHub issues or logs
- **Check API Status:** http://localhost:3000/api/status

---

## 📝 Advanced Configuration

### Custom Model Download

Download any GGUF format model:

```bash
# Create ~/.ollama/modelfile
FROM ./path/to/custom-model.gguf

# Create custom model
ollama create my-model -f ~/.ollama/modelfile

# Use in ResumeForge
LOCAL_MODEL=my-model
```

### Batch Resume Generation

```bash
# Generate 100 resumes using local Mistral
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{...}' | tee resume_1.json

# Costs: $0 (local only)
```

### Monitor Performance

```bash
# Check Ollama memory usage
ollama show mistral

# Check server logs
tail -f ~/.ollama/logs/ollama.log
```

---

**Ready to get started?** Begin with Step 1 above! 🚀
