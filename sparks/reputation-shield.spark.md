# 🧩 Spark Template: The Reputation Shield

---

## 🧠 Phase 1: The Intuition (!HUNCH)
*Status: Claimed* *Scout: @IntuitionIvan*

### The Observation
> I have a gut feel that as we grow, the "Janitor" role will be exploited by bots just to farm CS points.
* **The Gap:** We currently reward all typo fixes equally, but 100 tiny typo PRs don't equal one high-quality documentation rewrite.
* **The "Why":** Logic-builders will get frustrated if their voting power is diluted by "Point-Farmers" who aren't actually invested in the structure.

---

## 🎨 Phase 2: The Imagination (!SHAPE)
*Status: Designed* *Designer: @CreativeClara*

### The Novel Core (The 10% Delta)
* **The Blueprint:** Introduce a "Decay Rate" for CS earned via Janitor tasks. Unlike Logic points, which are permanent, Janitor points lose 10% value every month unless the user contributes a higher-tier Spark.
* **The Interface:** This snaps into the **Logarithmic Voting Power** formula ($$Weight = log_{10}(CS_{active})$$).
* **Prior Art:** Traditional DAOs use "Staking" (locking money). Our "Delta" is **Staking Time/Consistency** instead of capital.

---

## 🛠️ Phase 3: The Logic (!BUILD)
*Status: Merged* *Builder: @DevDevon*

### Technical Implementation
* **The Logic:** [Link to PR #42 - Reputation_Decay_Script.py]
* **Clutch Power Test:** Ran a simulation against the last 3 months of contribution data. The script successfully filtered out 3 bot-like accounts without affecting the voting weight of active Architects.
* **Dependencies:** Requires the `CS-Tracker-Bot` (v1.2) to be updated to support the "Active vs. Lifetime" CS variable.

---

## 📊 Contribution Log (CS Tracker)
| Phase | Contributor | Action | Reward |
| :--- | :--- | :--- | :--- |
| **Intuition** | @IntuitionIvan | Submitted Hunch | +5 CS |
| **Imagination** | @CreativeClara | Designed Shape | +15 CS (+5 Echo Bonus) |
| **Logic** | @DevDevon | Merged Build | +25 CS (+10 Prototype Bonus) |

---
> *Instructions: This Spark is now a "Standard Brick" in TheCommons architecture. Any further refinements should be submitted as a Pull Request to the Logic section.*