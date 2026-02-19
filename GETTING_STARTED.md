# 🧠 Scribe v2.0 - Getting Started Guide

Welcome to the Scribe v2.0 Glass Box AI Agent for TheCommons! This guide will help you understand and use the system.

## 📋 Quick Overview

The Scribe v2.0 is an intelligent quality-assurance system that:
- ✅ **Validates Sparks** for structural integrity (Intuition → Imagination → Logic phases)
- 🔍 **Evaluates Novelty** to ensure unique ideas
- 📊 **Generates Glass Box Logs** showing all reasoning transparently
- 🔄 **Switches Hardware** automatically (GPU → CPU → Cloud API)
- 🤖 **Automates PR Reviews** with GitHub Actions

## 🚀 5-Minute Quick Start

### Step 1: Verify Installation
```bash
python3 verify_scribe.py
```
Expected output: ✅ ALL CHECKS PASSED

### Step 2: See It In Action (Demo Mode)
```bash
python3 scribe/scribe_brain.py --demo
```
Shows example Glass Box output without needing a model.

### Step 3: Audit Your Sparks
```bash
python3 scribe/logic/stability_audit.py --dir sparks/
```
Validates all Spark files for quality.

### Step 4: (Optional) Set Up Full Inference
Choose one:

**Option A: Local Model**
```bash
pip install llama-cpp-python
python3 scribe/models/downloader.py --download
python3 scribe/scribe_brain.py
```

**Option B: Cloud API (Groq)**
```bash
pip install groq
export GROQ_API_KEY='your-key-here'
python3 scribe/scribe_brain.py
```

**Option C: Both (Recommended)**
```bash
python3 scribe/models/downloader.py --download
export GROQ_API_KEY='your-key-here'
pip install groq
python3 scribe/scribe_brain.py
```

## 📚 Core Components

### 1. Scribe Brain (`scribe/scribe_brain.py`)
The main AI router that:
- Detects hardware (GPU/Metal/CPU/Groq)
- Loads models for inference
- Runs evaluations
- Outputs Glass Box logs
- Updates real-time status

**Usage:**
```bash
python3 scribe/scribe_brain.py           # Run live evaluation
python3 scribe/scribe_brain.py --demo    # Show demo without model
python3 scribe/scribe_brain.py --help    # See all options
```

### 2. Stability Auditor (`scribe/logic/stability_audit.py`)
Validates Spark structural integrity:
- Checks all 3 phases are present (Intuition/Imagination/Logic)
- Verifies contributor handles (@username)
- Calculates novelty scores (0-100)
- Identifies critical flaws
- Generates recommendations

**Usage:**
```bash
python3 scribe/logic/stability_audit.py --file sparks/your.spark.md
python3 scribe/logic/stability_audit.py --dir sparks/
python3 scribe/logic/stability_audit.py --json  # Machine-readable output
```

### 3. System Prompts
**Hunch Evaluator** (`scribe/prompts/hunch_eval.md`)
- Validates !HUNCH (Intuition) submissions
- Checks: specificity, actionability, novelty, scope alignment

**Shape Evaluator** (`scribe/prompts/shape_eval.md`)
- Validates !SHAPE (Imagination) submissions  
- Checks: Novel Core clarity, buildability, integration, prior art, risk awareness

### 4. Model Downloader (`scribe/models/downloader.py`)
Manages the Qwen2.5-1.5B GGUF model:
```bash
python3 scribe/models/downloader.py --verify    # Check if model exists
python3 scribe/models/downloader.py --download  # Fetch from Hugging Face
```

### 5. GitHub Actions Bot (`.github/workflows/scribe-bot.yml`)
Automatically:
- Runs on PRs to Spark files
- Executes stability audits
- Posts results in PR comments
- Provides actionable feedback

## 🎯 Understanding Glass Box Logs

Every Scribe decision includes transparent reasoning:

```json
{
  "status": "approved",
  "phase": "hunch",
  "stability_score": 8.5,
  "reasoning": {
    "hardware_used": "cpu",
    "time_elapsed_ms": 1234.5,
    "decision_path": [
      "Scanning for Loose Studs...",
      "Checking Clutch Power (specificity)...",
      "Validating actionability..."
    ],
    "critical_flaws": [],
    "recommendations": ["Consider adding examples..."]
  }
}
```

**Key Fields:**
- **status**: approved, rejected, or needs_clarification
- **stability_score**: 0-10 rating of submission quality
- **hardware_used**: Which compute was selected (CPU, GPU, Metal, Groq)
- **decision_path**: Step-by-step reasoning trace
- **critical_flaws**: Show-stopper issues
- **recommendations**: Suggestions for improvement

## 🏗️ How to Create a Spark for Review

1. **Start with a gap:** Identify something broken or missing (that's your !HUNCH)

2. **Propose a solution:** Design a blueprint (that's your !SHAPE)

3. **Get reviewed:** The Scribe validates your submission

4. **Submit PR:** Add your Spark to `/sparks/` directory

5. **Get feedback:** GitHub Action comments with stability report

Example minimal Spark:
```markdown
# 🧩 Example Spark

## 🧠 Phase 1: The Intuition (!HUNCH)
*Status: Claimed* *Scout: @yourname*

### The Observation
> We have no way to track Spark creation dates.
- **The Gap:** Timestamps are missing
- **The "Why":** Can't analyze velocity

## 🎨 Phase 2: The Imagination (!SHAPE)
*Status: Designed* *Designer: @yourname*

### The Novel Core (The 10% Delta)
- **The Blueprint:** Add timestamp fields to Spark frontmatter
```

## 🔍 Interpretation Guide

### Stability Scores
- **90-100:** Excellent (ready to build)
- **70-89:** Good (minor refinements needed)
- **50-69:** Fair (needs significant work)
- **Below 50:** Poor (needs redesign)

### Completion Levels
- **3/3 phases:** Fully defined, ready to merge
- **2/3 phases:** Blueprint approved, awaiting implementation
- **1/3 phase:** Idea documented, needs design
- **0/3 phases:** Missing critical structure

### Novelty Scores
- **80-100:** Truly novel, clear differentiation
- **60-79:** Novel enough, minor prior art exists
- **40-59:** Incremental improvement
- **Below 40:** Too similar to existing solutions

## 🔧 Hardware Selection

The Scribe automatically chooses the best available hardware:

```
🖥️ NVIDIA GPU (CUDA)
   ↓ (if unavailable)
🍎 Apple Metal (macOS)
   ↓ (if unavailable)  
💻 Multi-threaded CPU
   ↓ (if needed)
☁️ Groq Cloud API
```

**Why this order?** GPU is fastest, CPU works everywhere, API is fallback.

## 📊 Real-Time Status

The Scribe outputs real-time thinking to `scribe_status.json`:

```json
{
  "timestamp": 1676923456.123,
  "thinking_step": "Checking Clutch Power...",
  "hardware": "cpu"
}
```

The React Assembly Lab UI monitors this file for live updates.

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Model not found" | No GGUF downloaded | `python3 scribe/models/downloader.py --download` |
| "Groq SDK not installed" | Missing dependency | `pip install groq>=0.4.0` |
| "All inference methods failed" | No model + no API key | Use demo mode: `--demo` |
| "Script exited with code 1" | Error in evaluation | Check logs & switch to demo mode |

## 🎓 Learning Resources

| Document | Purpose |
|----------|---------|
| [SCRIBE_TESTING_GUIDE.md](SCRIBE_TESTING_GUIDE.md) | Testing procedures & setup |
| [scribe/README.md](scribe/README.md) | Technical documentation |
| [SCRIBE_IMPLEMENTATION_SUMMARY.md](SCRIBE_IMPLEMENTATION_SUMMARY.md) | Architecture overview |
| [docs/MANIFESTO.md](docs/MANIFESTO.md) | Governance philosophy |
| [sparks/scribe-v2-implementation.md](sparks/scribe-v2-implementation.md) | Design blueprint |

## 🚀 Next Steps

1. **Run verification:** `python3 verify_scribe.py`
2. **See demo:** `python3 scribe/scribe_brain.py --demo`
3. **Audit sparks:** `python3 scribe/logic/stability_audit.py --dir sparks/`
4. **Read guide:** `SCRIBE_TESTING_GUIDE.md`
5. **Deploy:** Choose your inference setup (local model or Groq)
6. **Monitor PRs:** Watch GitHub Actions bot on Spark submissions

## 💡 Tips & Tricks

### Make Better !HUNCH Submissions
- Be **specific**: "Spark files lack date fields" not "code is bad"
- Show **evidence**: "Makes velocity tracking impossible"
- Stay **focused**: One clear problem, not a list

### Make Better !SHAPE Designs
- Define the **10% delta**: What's NEW vs. existing solutions?
- Explain **integration**: How does it snap into Commons Bricks?
- Address **risks**: What could go wrong?
- Cite **prior art**: Show you've researched similar approaches

### Reading Scribe Feedback
- Look at **decision_path** to understand the reasoning
- Check **stability_score** (0-10) for overall quality
- Review **recommendations** for next steps
- Note **critical_flaws** that must be fixed

## 🎉 You're Ready!

The Scribe v2.0 is fully operational. Start with demo mode, audit your Sparks, and then deploy full inference when ready.

**Questions?** Check the documentation files—comprehensive guides are available in every step!

---

_"The Scribe sees all. The Scribe explains all."_ 🧠
