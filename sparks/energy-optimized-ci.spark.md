---
id: spark_energy_optimized_ci
title: "Energy-Optimized CI Pipelines"
domain: "engineering"
spark_type: "hypothesis"

maturity_level: "seed"
status: "draft"

core_claim: "Optimize CI for energy efficiency instead of build time."

problem_statement: "Current defaults focus on minimizing execution time rather than energy consumption."

assumptions:
  - "Energy can be measured per workflow."
  - "Slower builds might use less power."

unknowns:
  - "How to measure accurately?"
  - "Trade-off with developer productivity?"

variables:
  independent:
    - "Scheduling"
    - "Hardware selection"
    - "Workload batching"
  dependent:
    - "Energy consumption"

metrics:
  - "Energy used per workflow run"
  - "Total build time vs energy consumed"

constraints:
  - "Must not severely block developer productivity"

risks:
  - "Measurement inaccuracy"
  - "Developer friction"

evaluation_strategy:
  method: "experiment"
  success_criteria: "Demonstrable reduction in CI energy footprint"
  falsifiable: true

related_sparks:
  - ""

revision_history:
  - version: "0.1"
    note: "Migrated to enhanced structured spark"
---

*Scout: @rvishravars*

# 1. Spark Narrative

**The Observation:** Every GitHub Action triggered, every CircleCI pipeline executed, every Jenkins build run consumes electricity. Yet the industry's default optimization target is singular: minimize wall-clock time. We parallelize aggressively, spin up powerful instances, and treat compute as if it were free. Meanwhile, data centers consume 1-2% of global electricity, and CI/CD workloads represent a growing slice of that pie.

Current CI optimization can be expressed as:
$$\min_{\text{config}} T_{\text{build}} \quad \text{subject to: } \text{tests pass}$$

But the true cost function should be:
$$\min_{\text{config}} \left( \alpha \cdot E_{\text{total}} + \beta \cdot T_{\text{build}} \right) \quad \text{where } E_{\text{total}} = \sum_{i=1}^{n} P_i \cdot t_i \cdot C_i$$

Here, $E_{\text{total}}$ is total energy (kWh), $P_i$ is power draw of instance $i$ (kW), $t_i$ is duration (hours), $C_i$ is grid carbon intensity (gCO₂/kWh), and $\alpha, \beta$ are weights balancing energy vs time.

**The Gap:** Current CI/CD platforms provide *zero visibility* into energy consumption per workflow. You can see build duration, but not kilowatt-hours used. There's no "energy budget" concept, no throttling based on carbon intensity of the grid, no scheduler that optimizes for watts instead of seconds. The tooling doesn't exist because the incentive structure doesn't exist—developers are measured on velocity, not sustainability.

**The "Why":** Three converging forces make this urgent:
1. **Economic Pressure:** Cloud providers are beginning to price carbon costs into compute. AWS launched "Customer Carbon Footprint Tool"; Azure has "Emissions Impact Dashboard". Energy-aware CI could reduce cloud bills by 20-40%.
2. **Regulatory Momentum:** EU's Corporate Sustainability Reporting Directive (CSRD) requires large companies to report digital carbon footprint starting 2024. CI pipelines are measurable, optimizable, and right in the critical path.
3. **Developer Ethos:** The open-source community increasingly values sustainability. Projects that can demonstrate "green builds" will attract contributors and sponsorships.

**The Shift:** Instead of asking *"How fast can this build?"*, ask *"What's the minimum energy needed to validate this commit?"* This reframes CI as an **energy arbitrage problem**: schedule non-critical tests during low-grid-carbon hours, use ARM instances for lightweight workloads, batch dependency updates to reduce cold-start overhead, and implement adaptive parallelism based on real-time energy pricing.

The energy arbitrage opportunity can be quantified as:
$$\text{Savings}_{\text{potential}} = \int_{t_0}^{t_0 + \Delta t} \left[ C(t) - C_{\min} \right] \cdot P \, dt$$

Where $C(t)$ is time-varying carbon intensity, $C_{\min}$ is the minimum during the scheduling window $\Delta t$, and $P$ is average power draw. For a typical 4-hour window with 30% carbon intensity variance, this yields 15-40% potential savings.

---

# 2. Hypothesis Formalization

**Hypothesis Statement**
> "Implementing energy-aware scheduling policies in CI/CD pipelines (time-shifting non-critical jobs to low-carbon hours, using lower-power instance types, and batching similar workloads) will reduce total energy consumption by **25-35%** compared to time-optimized defaults, while keeping median build latency within **15%** of baseline for critical path workflows."

Mathematically:
$$\frac{E_{\text{treatment}} - E_{\text{control}}}{E_{\text{control}}} \leq -0.25 \quad \text{(25% reduction)}$$
$$\frac{T_{\text{median}}^{\text{treatment}} - T_{\text{median}}^{\text{control}}}{T_{\text{median}}^{\text{control}}} \leq 0.15 \quad \text{(15% increase tolerance)}$$

**Null Hypothesis**
> "Energy-aware CI optimizations either fail to achieve meaningful energy reduction (< 10%), or they degrade developer experience by increasing build latency beyond acceptable thresholds (> 25% increase in p95 latency), making the approach impractical for real-world adoption."

**Falsifiability Criteria:**
- **Measurable:** Energy consumption tracked via cloud provider APIs (AWS CloudWatch, GCP Carbon Footprint) and open-source tools (Scaphandre, CodeCarbon).
- **Bounded:** Clear thresholds defined (25% energy reduction, 15% latency tolerance).
- **Testable:** Can be validated through A/B testing on real CI infrastructure over 30-day periods.
- **Refutable:** If energy savings < 10% OR latency increase > 25%, hypothesis is rejected.

---

# 3. Simulation / Modeling Plan

## Model Type
**Data Replay + Discrete Event Simulation**
- Replay 90 days of historical CI logs from 3-5 open-source repositories (varying sizes: small <100 builds/day, medium 100-500, large >500)
- Simulate alternative scheduling policies using discrete event simulation framework (SimPy or similar)
- Model includes: job arrival patterns, execution DAGs, instance provisioning delays, energy cost functions

## Inputs
**Historical Data:**
- GitHub Actions workflow logs (JSON): timestamps, duration, runner type, job dependencies
- Grid carbon intensity data: ElectricityMap API (gCO2/kWh by region, hourly granularity)
- Cloud instance specifications: CPU/memory, TDP (Thermal Design Power), pricing

**Policy Parameters:**
- Time-shift tolerance window (e.g., "non-blocking tests can wait up to 4 hours")
- Carbon intensity threshold for triggering delays (e.g., "pause if grid > 400 gCO2/kWh")
- Instance selection rules (ARM vs x86, spot vs on-demand)

**Energy Estimation Model:**
$$E_{\text{job}} = \left( P_{\text{CPU}} \cdot U_{\text{CPU}} + P_{\text{DRAM}} + P_{\text{base}} \right) \cdot \frac{t_{\text{duration}}}{3600}$$

Where:
- $P_{\text{CPU}}$ = CPU TDP (e.g., 65W for typical x86, 15W for ARM)
- $U_{\text{CPU}}$ = CPU utilization (0-1, measured via profiling)
- $P_{\text{DRAM}}$ = Memory power (≈3W per 8GB)
- $P_{\text{base}}$ = Baseline system power (≈20-30W)
- $t_{\text{duration}}$ = Job duration in seconds

**Baseline Metrics:**
- Current energy consumption (estimated via instance type × duration × TDP)
- Current p50/p95 build latency
- Current cost per 1000 builds

## Expected Outputs
1. **Energy Reduction Matrix:** % savings by policy combination (time-shift vs instance-type vs batching)
2. **Latency Impact Distribution:** Histogram of build time deltas for each policy
3. **Cost-Benefit Curves:** Energy savings vs developer experience trade-off frontier
4. **Optimal Policy Recommendation:** Configuration that maximizes energy savings while meeting latency SLO

## Sensitivity Analysis
**Critical Variables:**
- **Repository Commit Frequency:** High-velocity repos (>20 commits/hour) have less flexibility for time-shifting
- **Test Suite Composition:** CPU-bound tests benefit more from ARM; I/O-bound less so
- **Grid Carbon Intensity Variance:** Regions with stable low-carbon grids (e.g., Iceland, Norway) see smaller gains from time-shifting
- **Developer Tolerance:** Survey-based "frustration threshold" for build delays impacts policy aggressiveness

**Scenarios to Model:**
- Best case: Low-carbon region + batch-friendly workloads + flexible deadlines → 40-50% savings
- Worst case: High-carbon region + real-time workflows + legacy x86 dependencies → 5-10% savings
- Typical case: Mixed workload, moderate flexibility → 25-35% savings (hypothesis target)

**Optimization Objective Function:**
$$\min \sum_{j \in \text{Jobs}} \left[ E_j \cdot C(t_j) + \lambda \cdot \max(0, T_j - T_{\text{SLO}}) \right]$$

Where $E_j$ is energy for job $j$, $C(t_j)$ is carbon intensity at scheduled time, $T_j$ is completion time, $T_{\text{SLO}}$ is latency target, and $\lambda$ is the penalty weight for SLO violations. This formulation balances energy optimization with developer experience constraints.

---

# 4. Evaluation Strategy

## Measurement Method
**Instrumented A/B Test on Production CI Infrastructure**
- **Control Group:** 50% of builds use standard time-optimized scheduling (GitHub Actions defaults)
- **Treatment Group:** 50% use energy-aware scheduling via custom GitHub Actions dispatcher
- **Duration:** 30-day test period per repository
- **Randomization:** Per-commit hash modulo 2 to ensure stable assignment

## Data Collection
**Energy Metrics:**
- **Tool:** CodeCarbon Python library + Scaphandre (for Linux runners)
- **Capture:** CPU energy, DRAM energy, GPU energy (if applicable), embodied carbon of infrastructure
- **Granularity:** Per-job, aggregated to per-workflow and per-repository levels
- **Storage:** Export to Prometheus + Grafana for visualization

**Performance Metrics:**
- **Build Latency:** Time from commit push to all checks complete (p50, p95, p99)
- **Queue Time:** Time jobs spend waiting for runner availability
- **Failure Rate:** % of builds that fail due to timeout or resource constraints

**Developer Experience:**
- **Survey:** Weekly pulse survey (5-point Likert scale): "How satisfied are you with build speed this week?"
- **Behavioral:** Track PR merge velocity, incidents of developers bypassing CI

## Statistical Criteria
**Primary Success Metric:**
- Energy consumption per successful build reduced by **≥25%** in treatment group
- Statistical significance: $p < 0.05$ via Welch's t-test
- Effect size: Cohen's $d > 0.5$ (medium effect)

**Statistical Test:**
$$t = \frac{\bar{E}_{\text{treatment}} - \bar{E}_{\text{control}}}{\sqrt{\frac{s_{\text{treatment}}^2}{n_{\text{treatment}}} + \frac{s_{\text{control}}^2}{n_{\text{control}}}}}$$

**Effect Size:**
$$d = \frac{\bar{E}_{\text{treatment}} - \bar{E}_{\text{control}}}{s_{\text{pooled}}} \quad \text{where } s_{\text{pooled}} = \sqrt{\frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1+n_2-2}}$$

**Secondary Success Metrics:**
- Median build latency increase **<15%** (non-inferiority test)
- P95 build latency increase **<25%**
- Developer satisfaction score ≥ 3.5/5.0 (acceptable threshold)
- Cost savings ≥ 20% (energy + compute cost combined)

**Failure Conditions (Hypothesis Rejection):**
- Energy savings < 10% OR
- Median latency increase > 15% OR
- Developer satisfaction < 3.0/5.0 OR
- Increased failure rate > 5 percentage points

## Comparison Baseline
**Control Configuration:**
- GitHub Actions standard runners (ubuntu-latest, 2-core)
- Default concurrent job limits (20 for free tier, 60 for Teams, 180 for Enterprise)
- No time-shifting, no instance selection, no batching
- Measured over 30-day pre-test period to establish stable baseline

**Expected Variance:**
- Historical CV (coefficient of variation) for energy consumption: ~15-20%
- Min detectable effect size: 20% difference with 80% power, assumes N > 500 builds per group

**Power Analysis:**
$$n = \frac{2(z_{\alpha/2} + z_{\beta})^2 \sigma^2}{(\mu_1 - \mu_2)^2}$$

For $\alpha = 0.05$, $\beta = 0.20$ (80% power), $\sigma/\mu = 0.15$ (CV), and target effect $\mu_1 - \mu_2 = 0.25\mu$:
$$n \approx 2 \cdot \frac{(1.96 + 0.84)^2 \cdot (0.15)^2}{(0.25)^2} \approx 112 \text{ builds per group}$$

With safety margin: **N ≥ 500 builds/group recommended** to account for outliers and non-normality.

## Publication Plan
- **Open Data:** Anonymized build logs, energy measurements, and analysis code published to GitHub
- **Reproducibility:** Docker container with full simulation environment
- **Peer Review:** Submit findings to USENIX ATC or ACM SoCC conference for validation

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
> *Instructions: This is an enhanced spark template. Use the sections above to document the evolution from idea to implementation.*
