# 🧩 Spark Build Validation Rules (v2.0)

All Sparks submitted to TheCommons must follow the **Intuition → Imagination → Logic** assembly line. Our validation ensures that every "brick" has enough **Clutch Power** to hold the structure together.

---

## 🏗️ The 3-Phase Assembly Framework

### Phase 1: 🧠 INTUITION (!HUNCH)
*Focus: Problem Discovery & Signal.*
**Requirements:**
1.  **The Observation:** What is currently "loose" or missing in the ecosystem?
2.  **The Gap:** Identify the specific void.
3.  **The "Why":** Why does this matter now?
**Validation:** Must include a `@Scout` handle. Minimum 10 words per section.

---

### Phase 2: 🎨 IMAGINATION (!SHAPE)
*Focus: The Blueprint & The Novel Core.*
**Requirements:**
1.  **The Novel Core:** Define the specific 10% "Delta" that makes this unique.
2.  **The Blueprint:** A high-level description of the solution's shape.
3.  **The Interface:** How does this "snap" into existing Sparks?
**Validation:** Must include a `@Designer` handle. Must provide "Prior Art" context to prove novelty.

---

### Phase 3: 🛠️ LOGIC (!BUILD)
*Focus: Technical Rigor & Integration.*
**Requirements:**
1.  **Technical Implementation:** Link to PR, code, or deep technical specs.
2.  **Clutch Power Test:** Evidence that the build is stable and doesn't break other bricks.
**Validation:** Must include a `@Builder` handle. Technical links must be reachable.

---

## 📂 File & Metadata Requirements

- **Location:** All bricks must reside in the `/sparks/` directory.
- **Format:** Standard Markdown (`.md`).
- **Handle Requirement:** Every phase must be signed (e.g., `*Scout: @username*`) to trigger **Contribution Score (CS)** rewards.

## 📋 Submission Checklist

- [ ] **Phase Integrity:** At least one Phase (Intuition) is 100% complete.
- [ ] **Handle Mapping:** All active phases have a valid GitHub `@username`.
- [ ] **Standard Gauge:** Language is clear and technical terms are defined.
- [ ] **Clutch Check:** Passes the `novelty_scan.py` stability audit.

## 🤖 Running the Stability Audit

The **AI Scribe** uses the `novelty_scan.py` script to check the "Clutch Power" of your brick.

```bash
# Audit a specific brick
python scripts/novelty_scan.py --file sparks/your-brick-name.md

# Audit the entire baseplate
python scripts/novelty_scan.py