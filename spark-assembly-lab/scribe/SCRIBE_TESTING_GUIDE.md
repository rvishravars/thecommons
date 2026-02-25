# 🧪 Scribe v3.0 Testing Guide

Quick reference for testing the Scribe Brain without heavy dependencies.

## ✅ Demo Mode (No Dependencies Required)

Test the Glass Box reasoning format without needing a model or API:

```bash
python3 scribe/scribe_brain.py --demo
```

Output shows:
- Sample !HUNCH submission
- Glass Box reasoning log
- Stability scoring
- Decision path trace
- Next steps for full deployment

## 🧱 Stability Auditor (Always Works)

Validate Spark files for structural integrity and novelty:

```bash
# Audit all Sparks
python3 scribe/logic/stability_audit.py --dir sparks/

# Audit specific file
python3 scribe/logic/stability_audit.py --file sparks/scribe-v2-implementation.md

# Get JSON output for scripts
python3 scribe/logic/stability_audit.py --json
```

## 🚀 Full Setup (With Model or API)

### Option A: Local Inference (Recommended)

```bash
# 1. Download Qwen2.5-1.5B model (~1.5GB)
python3 scribe/models/downloader.py --download

# 2. Run Scribe Brain with local inference
python3 scribe/scribe_brain.py
```

### Option B: Groq API Fallback

```bash
# 1. Get API key from groq.com
# 2. Install Groq SDK
pip install groq>=0.4.0

# 3. Set API key
export GROQ_API_KEY='your-api-key-here'

# 4. Run Scribe Brain (uses Groq if local inference fails)
python3 scribe/scribe_brain.py
```

### Option C: Both (Recommended)

Combine local model with Groq fallback:

```bash
# Download model for primary inference
python3 scribe/models/downloader.py --download

# Set Groq API as backup
export GROQ_API_KEY='your-api-key-here'
pip install groq>=0.4.0

# Run Scribe (tries local first, falls back to Groq if needed)
python3 scribe/scribe_brain.py
```

## 🔍 Verify Installation

```bash
# Check Python version (3.8+)
python3 --version

# Verify core dependencies
python3 -c "import psutil; import requests; print('✅ Core deps OK')"

# Check llama-cpp-python
python3 -c "from llama_cpp import Llama; print('✅ llama-cpp-python OK')" || echo "⚠️  llama-cpp-python not installed"

# Check Groq SDK
python3 -c "from groq import Groq; print('✅ Groq OK')" || echo "⚠️  Groq not installed"
```

## 📊 Expected Outputs

### Demo Mode Output Structure
```
🧠 SCRIBE v3.0 GLASS BOX DEMO
============================================================
📥 INPUT: Section 1 Narrative
📊 OUTPUT: Glass Box Reasoning Log
- mission: "narrative_audit|design_hypothesis_audit"
- status: "approved|rejected|needs_clarification"
- stability_score: 0-10
- hardware_telemetry: [...]
- decision_path: [...] 
- critical_flaws: [...]
- recommendations: [...]
============================================================
✅ Demo complete
```

### Stability Audit Output Structure
```
🧱 Stability Report: filename.spark.md
✅ Status: Valid|Invalid
📊 Completion Level: X/8 sections
💎 Novelty Score: 0-100
🔨 Section Stability: [Narrative, Hypothesis, Modeling...]
⚠️  Loose Studs Identified: [if any]
💡 Recommendations: [if any]
```

## 🐛 Troubleshooting

### Issue: "Model not found"
**Solution:** `python3 scribe/models/downloader.py --download`

### Issue: "Groq SDK not installed"
**Solution:** `pip install groq>=0.4.0`

### Issue: "GROQ_API_KEY not set"
**Solution:** `export GROQ_API_KEY='your-key'`

### Issue: "All inference methods failed"
**Solution:** Run in demo mode: `python3 scribe/scribe_brain.py --demo`

## ✅ Test Checklist

- [ ] Run demo mode: `python3 scribe/scribe_brain.py --demo`
- [ ] Run stability audit: `python3 scribe/logic/stability_audit.py --dir sparks/`
- [ ] Check model: `python3 scribe/models/downloader.py --verify`
- [ ] Test stability auditor on all Sparks
- [ ] (Optional) Download model and test live inference
- [ ] (Optional) Set up Groq API and test fallback

## 📚 Next Steps

1. **Understand Glass Box Output:**
   - Read the reasoning log in demo mode
   - Understand hardware selection logic
   - Review decision paths

2. **Validate Existing Sparks:**
   - Run stability audits on all Spark files
   - Review novelty scores
   - Identify recommendations

3. **Set Up Full Pipeline:**
   - Download model or configure Groq
   - Run live evaluations
   - Test GitHub Actions trigger

4. **Integrate with CI/CD:**
   - Enable `.github/workflows/scribe-bot.yml`
   - Test on PR to Spark files
   - Validate PR comments

---

**Status:** All core Scribe functionality is operational and testable! 🎉
