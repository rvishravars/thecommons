export const ENHANCED_SPARK_TEMPLATE = `---
id: spark_<unique_id>
title: "<Clear, concise spark title>"
domain: "<research | engineering | policy | education | product | other>"
spark_type: "<hypothesis | reframing | contradiction | system_design | constraint | exploration>"

maturity_level: "<seed | structured | modeled | validated | implemented>"
status: "<draft | under_review | iterating | accepted | archived>"

core_claim: "<One-sentence central claim or shift>"

problem_statement: "<What gap or inefficiency does this address?>"

assumptions:
  - "<Assumption 1>"
  - "<Assumption 2>"

unknowns:
  - "<Unknown 1>"
  - "<Unknown 2>"

variables:
  independent:
    - "<Variable manipulated>"
  dependent:
    - "<Outcome measured>"

metrics:
  - "<Metric 1>"
  - "<Metric 2>"

constraints:
  - "<Budget / time / technical constraint>"
  - "<Acceptable trade-offs>"

risks:
  - "<Technical risk>"
  - "<Adoption risk>"
  - "<Ethical or unintended consequence>"

evaluation_strategy:
  method: "<experiment | simulation | case study | prototype | survey | analysis>"
  success_criteria: "<What defines success?>"
  falsifiable: true

related_sparks:
  - "<spark_id_if_any>"

revision_history:
  - version: "0.1"
    note: "Initial structured spark"
---

# 1. Spark Narrative
<!-- Describe the idea clearly and compellingly.
     Explain the shift in thinking.
     What makes this different from current approaches? -->

---

# 2. Hypothesis Formalization
<!-- Convert the spark into a falsifiable statement. -->

**Hypothesis Statement**
> "<Clear measurable hypothesis>"

**Null Hypothesis**
> "<What would prove this wrong?>"

---

# 3. Simulation / Modeling Plan
<!-- Describe how the idea will be tested before full implementation. -->

## Model Type
- <Data replay / mathematical model / agent-based simulation / prototype / other>

## Inputs
- <Data or parameters required>

## Expected Outputs
- <What results will be generated?>

## Sensitivity Analysis
- <What variables may significantly change outcomes?>

---

# 4. Evaluation Strategy
<!-- Define how evidence will be gathered and judged. -->

- Measurement method:
- Data source:
- Statistical or logical criteria:
- Comparison baseline:

---

# 5. Feedback & Critique
<!-- Document structured critique. -->

## Internal Critique
- Hidden assumptions:
- Weaknesses:
- Scalability concerns:

## Counter-Hypothesis
> "<Alternative explanation or competing theory>"

---

# 6. Results (When Available)
<!-- Populate after simulation or experimentation. -->

- Observed outcomes:
- Deviations from expectation:
- Surprises:

---

# 7. Revision Notes
<!-- Track how the idea evolves. -->

- What changed?
- Why?
- New maturity level:

---

# 8. Next Actions
<!-- Concrete steps forward. -->

- [ ] Run simulation
- [ ] Gather dataset
- [ ] Peer review
- [ ] Prototype
- [ ] Publish findings

---

# Maturity Guide (Reference)

- **Seed** → Conceptual spark only
- **Structured** → Hypothesis defined
- **Modeled** → Simulated or analyzed
- **Validated** → Empirical support
- **Implemented** → Deployed in real context
`;
