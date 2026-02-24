---
id: spark_nz_001
title: "Dynamic Infrastructure-Linked Zoning to Improve Housing Affordability"
domain: "policy"
spark_type: "system_design"

maturity_level: "seed"
status: "draft"

core_claim: "Linking zoning density permissions dynamically to infrastructure capacity could accelerate housing supply while controlling urban strain."

problem_statement: "Housing affordability remains a persistent issue in major NZ cities due to constrained land supply, slow zoning updates, and infrastructure bottlenecks."

assumptions:
  - "Infrastructure capacity can be measured in near real-time."
  - "Zoning restrictions are a significant constraint on housing supply."
  - "Developers respond predictably to density incentives."

unknowns:
  - "Political feasibility of automated zoning triggers."
  - "Accuracy of infrastructure capacity metrics."
  - "Community response to dynamic densification."

variables:
  independent:
    - "zoning_density_multiplier"
    - "infrastructure_capacity_threshold"
  dependent:
    - "housing_supply_rate"
    - "median_house_price"
    - "infrastructure_stress_index"

metrics:
  - "new_dwellings_per_year"
  - "price_to_income_ratio"
  - "average_commute_time"
  - "infrastructure_utilization_percentage"

constraints:
  - "Must not exceed defined infrastructure stress limits."
  - "Must comply with national environmental standards."

risks:
  - "Speculative land banking."
  - "Uneven urban development."
  - "Political resistance."

evaluation_strategy:
  method: "simulation + historical data replay"
  success_criteria: "10% increase in housing supply without >5% infrastructure stress increase"
  falsifiable: true

related_sparks: []

revision_history:
  - version: "0.1"
    note: "Initial structured spark"
---

# 1. Spark Narrative

What if zoning density automatically increased when local infrastructure capacity
(water, transport, energy) exceeded defined utilization thresholds?

Instead of static zoning plans updated every decade, urban density permissions
could adjust dynamically based on measurable infrastructure readiness.

This could reduce bureaucratic lag and allow supply to respond faster to demand.

---

# 2. Hypothesis Formalization

**Hypothesis Statement**
> Regions using infrastructure-triggered zoning adjustments will increase annual housing supply by at least 10% compared to static zoning regions.

**Null Hypothesis**
> Dynamic zoning adjustments produce no statistically significant change in housing supply.

---

# 3. Simulation / Modeling Plan

## Model Type
Agent-based urban development simulation using historical permit and infrastructure data.

## Inputs
- Historical building consent data
- Infrastructure capacity metrics
- Population growth data

## Expected Outputs
- Housing supply growth curves
- Infrastructure utilization trajectories
- Price trend projections

## Sensitivity Analysis
- Population growth variability
- Developer response elasticity
- Infrastructure expansion timing

---

# 4. Evaluation Strategy

Compare:
- Regions with simulated dynamic zoning
vs
- Historical baseline performance

---

# 5. Feedback & Critique

## Hidden Assumptions
- Infrastructure capacity data is reliable.
- Developers act immediately on density incentives.

## Counter-Hypothesis
> Infrastructure constraints are not the main limiting factor; land speculation and construction labor shortages dominate.

---

# 6. Results (When Available)

- Observed outcomes:
- Deviations from expectation:
- Surprises:

---

# 7. Revision Notes

- Version 0.1: Initial structured spark.

---

# 8. Next Actions

- [ ] Gather regional building consent data
- [ ] Model infrastructure utilization thresholds
- [ ] Prototype simulation
