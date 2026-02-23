# 🧩 The Reputation Shield

---

## 🧠 Phase 1: The Spark (!HUNCH)
*Status: [Claimed]* *Scout: @rvishravars*

### The Observation
> I have a gut feel that as we grow, the "Scout" role will be exploited by bots just to farm CS points through trivial spark submissions.
* **The Gap:** We currently reward all Scout discoveries equally, but 100 tiny observations (typo hunches, broken links) don't equal one high-quality gap analysis.
* **The "Why":** Builders and Designers will get frustrated if their voting power is diluted by "Point-Farmers" who submit minimal-effort hunches without actual investment in the structure.

---

## 🎨 Phase 2: The Design (!SHAPE)
*Status: [Designed]* *Designer: @rvishravars*

### The Novel Core (The 10% Delta)
* **The Blueprint:** Introduce a "Decay Rate" for CS earned via Scout tasks. Unlike Logic/Builder points, which are more permanent, Scout points lose 10% value every month unless the user contributes a higher-tier Spark (Designer or Builder level).
* **The Interface:** This snaps into the **Logarithmic Voting Power** formula:

$$Weight = \log_{10}(CS_{active})$$
* **Prior Art:** Traditional DAOs use "Staking" (locking money). Our "Delta" is **Staking Time/Consistency** instead of capital.

---

## 🛠️ Phase 3: The Logic (!BUILD)
*Status: [Merged]* *Builder: @rvishravars*

### Technical Implementation
* **The Logic:** Implemented in the Spark Assembly Lab backend (reputation service TBD)
* **Documentation:** See Spark Assembly Lab deployment docs for backend integration
* **Clutch Power Test:** Ran a simulation against 3 months of contribution data. The script successfully:
  - Applied 10% monthly decay to Scout-only contributors
  - Protected users with higher-tier contributions from decay
  - Calculated logarithmic voting weights correctly
  - Flagged bot-like patterns without false positives
* **Dependencies:** 
  - Python 3.8+ (standard library only)
  - Requires CS-Tracker-Bot to track both `active_cs` and `lifetime_cs` values
  - Monthly cron job recommended for automatic decay calculation

---

## 📊 Contribution Log (CS Tracker)
| Phase | Contributor | Action | Reward |
| :--- | :--- | :--- | :--- |
| **Spark** | @IntuitionIvan | Submitted Hunch | +5 CS |
| **Design** | @CreativeClara | Designed Shape | +15 CS (+5 Echo Bonus) |
| **Logic** | @DevDevon | Merged Build | +25 CS (+10 Prototype Bonus) |

---
> *Instructions: This Spark is now a "Standard Brick" in TheCommons architecture. Any further refinements should be submitted as a Pull Request to the Logic section.*
