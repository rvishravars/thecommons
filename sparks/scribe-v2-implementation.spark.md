---
name: The Scribe v2.0—Glass Box AI Agent
designer: CopilotAgent
phase: BUILD
status: Completed
stability: 9
clutch_power: 45
---

# 🧠 Spark: The Scribe v2.0—Glass Box AI Agent

---

## 🧠 Phase 1: The Intuition (!HUNCH)
*Status: [Claimed]* *Scout: @rvishravars*

### The Observation
> The AI "Scribe" is currently a concept. To enforce our Manifesto and automate compatibility verification, we need a deterministic, hardware-agnostic intelligence layer that runs locally and outputs its reasoning transparently.

* **The Gap:** We need a distributed AI agent that:
  - Runs on standard CPU hardware without external dependencies
  - Validates `!HUNCH` (Intuition) and `!SHAPE` (Imagination) phases for novelty and logical soundness
  - Outputs a "Glass Box" reasoning log explaining every decision (hardware choice, prompt used, logic path)
  - Posts stability audits to Pull Requests automatically
  - Costs nothing to operate (no commercial APIs required)

* **The "Why":** 
  - **Trust & Transparency:** Contributors must see _why_ the Scribe rejected or approved a Spark.
  - **Meritocracy Over Oligarchy:** A Scribe that depends on expensive commercial APIs creates a barrier to entry. A local, CPU-native Scribe levels the playing field.
  - **Sustainable Governance:** The Manifesto promises "Graduated Sanctions" and "AI-Powered Standards." Without a working Scribe, we're a framework without enforcement.

---

## 🎨 Phase 2: The Imagination (!SHAPE)
*Status: [Designed]* *Designer: @CopilotAgent*

### The Novel Core (The 10% Delta)
* **The Blueprint:** "The Glass Box Scribe"—a modular, hardware-aware AI agent that:
  1. **Deterministic Hardware Switching:** Detects available compute (NVIDIA GPU → Apple Metal → Multi-thread CPU) and routes inference accordingly
  2. **Nano-Model Priority:** Uses Qwen2.5-1.5B-Instruct-GGUF (Q4_K_M) as the default "Brain"—a ~1B parameter model that runs on laptops
  3. **Local First, Groq Failover:** Falls back to a lightweight OpenAI-compatible endpoint (Groq) only if local hardware is insufficient
  4. **Glass Box Output:** Every decision includes a reasoning log showing:
     - Which prompt was used (hunch_eval.md vs shape_eval.md)
     - Hardware performance metrics (inference time, memory, device type)
     - Logic path taken (which checks were applied)
     - Stability audit findings
  5. **GitHub Integration:** PR bot that posts stability reports and reasoning logs as comments
  6. **React Integration:** Real-time status JSON for visualization in Assembly Lab

* **The Interface:** This snaps into the **Manifesto's Vision**:
  - Replaces manual code review (less decentralized) with automated, transparent gates
  - Protects the Commons from low-effort (Loose Studs) contributions without gatekeeping high-quality ideas
  - Uses **Clutch Power** language (Stability Audit, Bricks, Stability, Loose Studs) throughout logs

* **Prior Art:** 
  - OpenAI's o1 and o3 use "reasoning logs" for transparency (our "Glass Box")
  - Hugging Face's `llama-cpp-python` enables local GGUF inference on any hardware
  - GitHub Actions already trigger on PR events (standard industry practice)

### Directory & File Structure
```
scribe/
├── models/
│   └── downloader.py           # Fetch Qwen2.5-1.5B GGUF if missing
├── prompts/
│   ├── hunch_eval.md           # System prompt for !HUNCH validation
│   └── shape_eval.md           # System prompt for !SHAPE validation
├── logic/
│   └── stability_audit.py      # Refactored novelty_scan.py logic
├── scribe_brain.py             # Core router with hardware switching
└── utils/
    └── glass_box_logger.py     # Reasoning log formatter

.github/
└── workflows/
    └── scribe-bot.yml          # PR bot trigger

scribe_status.json              # Real-time thinking steps for UI
```

### Technical Specifications

#### Hardware Switching Logic
1. Check for NVIDIA GPU (cuda availability)
2. Fall back to Apple Metal (mlx framework if available)
3. Use multi-threaded CPU as default
4. If local device exhausts >80% RAM or has <30% free compute, failover to Groq API

#### Dependency Strategy
- **CPU-Only Stack:** llama-cpp-python, requests
- **Optional GPU:** onnxruntime (for NVIDIA), mlx (for Apple)
- **Failover:** groq-sdk

#### Glass Box Output Format
```json
{
  "status": "approved|rejected|needs_review",
  "phase": "hunch|shape",
  "reasoning_log": {
    "hardware_used": "nvidia_gpu|apple_metal|cpu",
    "time_elapsed_ms": 1234,
    "memory_used_mb": 512,
    "prompts_tested": ["hunch_eval.md"],
    "decision_path": [
      "Scanning for Loose Studs...",
      "Checking Clutch Power (novelty)...",
      "Validating Prior Art..."
    ],
    "stability_score": 8.5,
    "critical_flaws": [],
    "recommendations": []
  }
}
```

---

## 🛠️ Phase 3: The Logic (!BUILD)
*Status: [Completed]* *Builder: @CopilotAgent*

### Technical Implementation

**The Logic:** The Glass Box Scribe is fully operational with a modular architecture:
- **Core Router** ([scribe_brain.py](../scribe/scribe_brain.py)): Hardware-aware inference engine with automatic device detection (NVIDIA GPU → Apple Metal → Multi-thread CPU → Groq failover)
- **Nano-Model** (Qwen2.5-1.5B-Instruct-GGUF Q4_K_M): Locally running 1B parameter model optimized for CPU
- **System Prompts** ([hunch_eval.md](../scribe/prompts/hunch_eval.md), [shape_eval.md](../scribe/prompts/shape_eval.md)): Phase-specific validation prompts
- **Stability Audit** ([stability_audit.py](../scribe/logic/stability_audit.py)): Refactored novelty_scan.py with Clutch Power language
- **GitHub Bot** ([.github/workflows/scribe-bot.yml](../.github/workflows/scribe-bot.yml)): Automated PR bot for stability reports
- **Glass Box Logger** ([glass_box_logger.py](../scribe/utils/glass_box_logger.py)): Transparent reasoning output formatter

**Clutch Power Test:** Successfully validated through comprehensive testing:
- ✅ Model downloads and loads correctly on CPU, GPU, and Apple Metal devices
- ✅ Hardware switching dynamically routes inference based on available compute
- ✅ Glass Box logs contain hardware metrics (device type, inference time, memory usage), decision paths, and stability findings
- ✅ GitHub Action successfully posts PR comments with full reasoning logs
- ✅ `scribe_status.json` updates in real-time for Assembly Lab visualization
- ✅ Stability audit validated on all existing Sparks (reputation-shield, paw-quiet-path, scribe-v2-implementation)

**Dependencies:** 
- Python 3.9+ with llama-cpp-python (CPU inference), requests (GitHub API)
- Optional: onnxruntime (NVIDIA GPU acceleration), mlx (Apple Metal acceleration)
- Groq API key (failover only, when local resources insufficient)
- GitHub Actions with PR trigger permissions
- Qwen2.5-1.5B-Instruct-GGUF model (auto-downloaded on first run)

---

## 📊 Contribution Log (CS Tracker)
| Phase | Contributor | Action | Reward |
| :--- | :--- | :--- | :--- |
| **Intuition** | @TheCommons | Identified gap | +5 CS |
| **Imagination** | @CopilotAgent | Designed Glass Box Scribe | +15 CS |
| **Logic** | @CopilotAgent | Implemented Glass Box Scribe | +25 CS ✅ |

---

## 🔗 Related Sparks
- [Reputation Shield](reputation-shield.spark.md) - CS decay logic the Scribe monitors
- [MANIFESTO.md](../docs/MANIFESTO.md) - Lingo & governance framework
