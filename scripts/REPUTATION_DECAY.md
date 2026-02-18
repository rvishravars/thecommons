# Reputation Decay System

Implementation of the "Reputation Shield" Spark for TheCommons v2.0

## Overview

This system prevents CS point farming by applying a 10% monthly decay rate to Scout-level contributions, while rewarding consistent higher-tier engagement.

## Key Features

- **Dual CS Tracking**: Maintains both Lifetime CS (permanent record) and Active CS (with decay)
- **Smart Decay Prevention**: Scout points don't decay if followed by Designer/Builder contributions
- **Point Farmer Detection**: Automatically flags suspicious contribution patterns
- **Logarithmic Voting Integration**: Calculates `Weight = log10(CS_active)` for governance
- **Sybil Protection**: Low-effort contributors naturally lose influence over time

## Architecture

### Decay Rules

| Role | Monthly Decay | Protection Mechanism |
|------|--------------|---------------------|
| **Scout** | 10% | Prevented by subsequent Designer/Builder contributions |
| **Designer** | 0% | No decay |
| **Builder** | 0% | No decay |

### Voting Weight Formula

```
Active CS = Lifetime CS - (Scout CS × 0.9^months_elapsed)
Voting Weight = log10(Active CS)
```

**Minimum Voting Threshold**: CS > 20 or 3+ merged actions (as per Manifesto)

## Usage

### Run Simulation

Test the decay logic with sample data:

```bash
python scripts/reputation_decay.py --simulate
```

**Expected Output:**
```
📊 Current Reputation Scores:

Username             Lifetime CS  Active CS    Voting Weight    Status
--------------------------------------------------------------------------------
@DevDevon            60           60.00        1.7782           ✅ Active
@CreativeClara       25           25.00        1.3979           ✅ Active
@IntuitionIvan       25           21.23        1.327            ✅ Active
@PointFarmer01       25           18.23        1.2607           ⚠️  Low Influence
@Bot-Hunter          30           21.87        1.3398           ⚠️  Low Influence

🚨 Point Farmer Detection:

Username             Active Ratio  Scout %    Status
------------------------------------------------------------
@PointFarmer01       0.729         100.0%     🔴 FLAGGED
@Bot-Hunter          0.729         100.0%     🔴 FLAGGED
```

### Process Real Data

```bash
# Calculate current CS scores
python scripts/reputation_decay.py \
  --input data/contributors.json \
  --output data/updated_cs.json
```

### Input Format

See `contributors_schema.json` for the expected structure:

```json
[
  {
    "username": "@username",
    "contributions": [
      {
        "date": "2026-01-15",
        "role": "scout|designer|builder",
        "cs": 5,
        "spark_id": "spark-001",
        "description": "Contribution description"
      }
    ]
  }
]
```

## Integration Points

### CS-Tracker-Bot Requirements

The bot needs to track two CS values:

```python
{
  "lifetime_cs": 100,  # Never decreases
  "active_cs": 87.3,   # Recalculated monthly
  "voting_weight": 1.94  # log10(active_cs)
}
```

### Recommended Cron Schedule

```bash
# Run decay calculation monthly (1st day at 00:00 UTC)
0 0 1 * * python /path/to/reputation_decay.py --input /data/contributors.json --output /data/updated_cs.json
```

### API Integration

```python
from reputation_decay import ReputationDecayEngine

# Load contributor data
engine = ReputationDecayEngine(contributor_data)

# Apply decay and get results
updated_scores = engine.apply_decay()

# Detect suspicious accounts
flagged_users = engine.detect_point_farmers(threshold_ratio=0.3)
```

## Detection Thresholds

### Point Farmer Flags

A user is flagged when:
- `active_cs / lifetime_cs < 0.3` (70%+ decay)
- Scout contributions > 80% of total
- Pattern indicates automated/low-effort submissions

### False Positive Prevention

The system avoids penalizing:
- **New Contributors**: No penalty for first Scout contribution
- **Active Learners**: Scout → Designer → Builder progression is rewarded
- **Balanced Contributors**: Mixed role contributions maintain full CS

## Testing

### Unit Tests

```bash
# Run test suite
pytest scripts/test_reputation_decay.py

# Test specific scenarios
pytest scripts/test_reputation_decay.py::test_scout_decay
pytest scripts/test_reputation_decay.py::test_higher_tier_protection
```

### Simulation Scenarios

The `--simulate` mode tests:
1. ✅ Scout-only user loses influence over 3 months
2. ✅ Developer with mixed roles maintains full CS
3. ✅ Bot-like patterns are successfully flagged
4. ✅ Voting power correctly filters low-effort accounts

## Dependencies

```bash
pip install -r requirements.txt
```

Required packages:
- Python 3.8+
- Standard library only (no external dependencies)

## Maintenance

### Monthly Review

1. Run simulation to verify decay rates
2. Review flagged accounts manually
3. Adjust `threshold_ratio` if needed based on community growth

### Quarterly Audit

- Analyze contribution patterns
- Tune decay parameters if gaming is detected
- Update documentation with findings

## Roadmap

- [ ] **v1.1**: Add configurable decay rates per role
- [ ] **v1.2**: Implement "Stability Audit" bonus decay protection
- [ ] **v1.3**: Real-time CS dashboard integration
- [ ] **v2.0**: Machine learning-based pattern detection

## References

- **Spark**: `sparks/reputation-shield.spark.md`
- **Manifesto**: `docs/MANIFESTO.md` (Section 2.2 - Logarithmic Voting)
- **Forum Discussion**: [Link to community discussion]

---

**Status**: ✅ Merged to Logic Phase  
**Last Updated**: 2026-02-19  
**Maintainer**: @DevDevon
