#!/usr/bin/env python3
"""
Test script for Scribe-Architect missions evaluation.
Demonstrates Mission 1, 2, and 3 execution.
"""

import json
import sys
from missions import evaluate_spark_mission

# Example Spark markdown for testing
EXAMPLE_SPARK = """# 🧩 Spark: GitHub Reputation Decay Algorithm

---

## 🧠 Phase 1: The Intuition (!HUNCH)

*Status: [Active]* *Scout: @vishravars*

### The Observation
> Contributors on GitHub accumulate reputation but lose momentum when inactive. There's no mechanism to decay stale contributions or refresh reputation based on recent activity.

* **The Gap:** GitHub's contribution graph is static—it doesn't reflect a contributor's *current* relevance in the ecosystem.
* **The "Why":** A developer who contributed 5 years ago shouldn't hold the same weight as someone actively shipping code today. Meritocracy requires *proof of present capability*.

---

## 🎨 Phase 2: The Imagination (!SHAPE)

*Status: [Active]* *Designer: @designer-handle*

### The Novel Core (The 10% Delta)
* **The Blueprint:** Implement a decay function that:
  - Awards full CS (Contribution Score) for code merged in the last 6 months
  - Applies a logarithmic decay curve for older contributions
  - Resets on new merge (proof of active participation)
  
* **The Interface:** 
  - Snap into GitHub API: Read contributor's commit history
  - Snap into TheCommons merit system: Recalculate CS on-demand
  - Snap into Spark Assembly UI: Show "Reputation Freshness" score (0-100)

* **Prior Art:** GitHub Contributions API only counts commits (static). Existing reputation systems (StackOverflow, Discourse) don't decay—they only accumulate.

---

## 🛠️ Phase 3: The Logic (!BUILD)

*Status: [Active]* *Builder: @builder-handle*

### Technical Implementation
The reputation decay algorithm is handled in the Spark Assembly Lab backend:
- Uses exponential decay: `score = original_score * exp(-lambda * days_inactive)`
- Lambda parameter: 0.002 (half-life ≈ 346 days)
- Triggers on-demand via GitHub Actions on each PR merge

* **Clutch Power Test:** 
  - Unit tests verify decay curve accuracy (±5% threshold)
  - Integration test: Simulate 2-year-old contributor, confirm < 50% penalty
  - Live test: Run on real GitHub logs from 10 contributors, verify fairness

* **Dependencies:** 
  - Python 3.8+
  - PyGithub library
  - NumPy for numerical calculations
  - No external API calls beyond GitHub

---

## 📊 Contribution Log (CS Tracker)

| Phase | Contributor | Action | Reward |
| :--- | :--- | :--- | :--- |
| **Intuition** | @vishravars | Submitted Hunch | +5 CS |
| **Imagination** | @designer-handle | Designed Shape | +15 CS (+5 Echo) |
| **Logic** | @builder-handle | Merged Build | +25 CS (+10 Prototype) |

---

> *The Commons rewards the intuition to see the gap, the imagination to design the piece, and the logic to make it stick.*
"""


def test_missions():
    """Test all three missions."""
    print("=" * 80)
    print("🧩 SCRIBE-ARCHITECT: MISSION EVALUATION TEST")
    print("=" * 80)
    
    # Evaluate the example spark
    result = evaluate_spark_mission(EXAMPLE_SPARK)
    
    # Pretty print results
    print("\n📋 MISSION EVALUATION RESULT:\n")
    print(json.dumps(result, indent=2))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"Spark ID: {result['spark_info']['id']}")
    print(f"Spark Name: {result['spark_info']['name']}")
    print(f"Stability Score: {result['spark_info']['stability_score']}/3")
    print(f"Audit Status: {result['audit']['status']}")
    print(f"Recommendation: {result['audit']['recommendation']}")
    print(f"Confidence: {result['audit']['confidence_level']}")
    print(f"\nScribe Report: {result['audit']['scribe_report']}")
    print(f"Governance Notes: {result['governance_notes']}")
    
    if result['audit']['critical_flaws']:
        print(f"\n⚠️  Critical Flaws Found:")
        for flaw in result['audit']['critical_flaws']:
            print(f"  - {flaw}")
    
    print(f"\n💰 Merit Distribution:")
    for merit in result['merit_plan']:
        print(f"  - {merit['handle']} ({merit['role']}): {merit['reward']}")
    
    print("\n" + "=" * 80)


if __name__ == "__main__":
    test_missions()
