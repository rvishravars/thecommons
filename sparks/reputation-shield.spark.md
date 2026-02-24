---
id: spark_reputation_shield
title: "The Reputation Shield"
domain: "policy"
spark_type: "system_design"

maturity_level: "implemented"
status: "accepted"

core_claim: "Exploitation of the Scout role by bots can be prevented by introducing a time-decay rate for CS earned via Scout tasks."

problem_statement: "We currently reward all Scout discoveries equally, but 100 tiny observations don't equal one high-quality gap analysis. Builders and Designers will get frustrated if voting power is diluted by Point-Farmers."

assumptions:
  - "Bots and point-farmers will target low-effort Scout submissions."
  - "Decaying points encourages sustained, high-quality contribution."
  - "Higher-tier contributions (Design/Logic) demonstrate genuine investment."

unknowns:
  - "Will the 10% decay rate be too aggressive or too lenient?"
  - "How to accurately detect and flag bot-like patterns?"

variables:
  independent:
    - "Time passed since Scout contribution"
    - "Number of higher-tier (Design/Logic) contributions"
  dependent:
    - "Active CS points"
    - "Logarithmic Voting Power"

metrics:
  - "Ratio of Scout-only points vs active total points"
  - "Frequency of high-tier contributions from frequent Scouts"

constraints:
  - "Must scale logarithmically for voting weight."
  - "Must distinguish between active and lifetime CS values."

risks:
  - "Penalizing legitimate but casual contributors."
  - "Complexity in the CS-Tracker-Bot."

evaluation_strategy:
  method: "data_replay"
  success_criteria: "10% monthly decay successfully applied to Scout-only contributors while protecting users with higher-tier contributions."
  falsifiable: true

related_sparks:
  - ""

revision_history:
  - version: "1.0"
    note: "Migrated to the enhanced structured spark template after successful implementation"
---

*Scout: @rvishravars*
*Designer: @rvishravars*
*Builder: @rvishravars*

# 1. Spark Narrative
I have a gut feel that as we grow, the "Scout" role will be exploited by bots just to farm CS points through trivial spark submissions. We currently reward all Scout discoveries equally, but 100 tiny observations (typo hunches, broken links) don't equal one high-quality gap analysis. Builders and Designers will get frustrated if their voting power is diluted by "Point-Farmers" who submit minimal-effort hunches without actual investment in the structure.

**The Blueprint:** Introduce a "Decay Rate" for CS earned via Scout tasks. Unlike Logic/Builder points, which are more permanent, Scout points lose 10% value every month unless the user contributes a higher-tier Spark (Designer or Builder level).

**The Interface:** This snaps into the **Logarithmic Voting Power** formula:
$$Weight = \log_{10}(CS_{active})$$

**Prior Art:** Traditional DAOs use "Staking" (locking money). Our "Delta" is **Staking Time/Consistency** instead of capital.

---

# 2. Hypothesis Formalization
<!-- Convert the spark into a falsifiable statement. -->

**Hypothesis Statement**
> "Applying a 10% monthly decay to Scout-based CS points will reduce the impact of bot farming without discouraging legitimate users, maintaining a balanced voting ecosystem."

**Null Hypothesis**
> "The decay rate has no effect on preventing point farming, or it disproportionately penalizes legitimate participants compared to point-farmers."

---

# 3. Simulation / Modeling Plan
<!-- Describe how the idea will be tested before full implementation. -->

## Model Type
- Data replay using 3 months of historical contribution data.

## Inputs
- Contributor histories, CS attribution (Scout vs Design vs Logic).

## Expected Outputs
- Identification of "farming" profiles.
- Recalculated CS values demonstrating decay.

## Sensitivity Analysis
- Adjusting the decay rate (5% vs 10% vs 20%).

---

# 4. Evaluation Strategy
<!-- Define how evidence will be gathered and judged. -->

- Measurement method: Script simulation over historical dataset.
- Data source: CS-Tracker-Bot database output.
- Statistical or logical criteria: Successfully dampening purely cumulative (Scout-only) CS while protecting balanced profiles.
- Comparison baseline: Current static CS point system.

---

# 5. Feedback & Critique
<!-- Document structured critique. -->

## Internal Critique
- Hidden assumptions: Assumes users will naturally progress to Design/Logic.
- Weaknesses: A user that *only* identifies great ideas (but never builds) provides value but gets penalized.
- Scalability concerns: Cron jobs for monthly decay recalculation across a massive userbase.

## Counter-Hypothesis
> "A reputation system based on peer review (upvotes/downvotes) of Sparks is better at preventing spam than a time-based decay mechanism."

---

# 6. Results (When Available)
<!-- Populate after simulation or experimentation. -->

- Observed outcomes: The script successfully applied 10% monthly decay to Scout-only contributors and protected users with higher-tier contributions.
- Deviations from expectation: N/A - Simulation proved successful.
- Surprises: Discovered logarithmic voting weights worked seamlessly with the decayed active_cs values.

---

# 7. Revision Notes
<!-- Track how the idea evolves. -->

- What changed? Promoted from Hunch to Design to Build.
- Why? Simulation successful.
- New maturity level: Implemented / Accepted.

---

# 8. Next Actions
<!-- Concrete steps forward. -->

- [x] Run simulation against 3 months of data
- [x] Implement in Spark Assembly Lab backend
- [x] Integrate with CS-Tracker-Bot (`active_cs` and `lifetime_cs`)
- [ ] Set up monthly cron job for automatic decay

---
> *Instructions: This Spark is now a "Standard Brick" in TheCommons architecture. Any further refinements should be submitted as a Pull Request to the Logic section.*
