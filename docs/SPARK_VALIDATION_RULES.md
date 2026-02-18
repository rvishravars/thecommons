# Spark Submission Validation Rules

All sparks submitted to the repository must follow the 8-Question Lego Block template and pass the novelty scan validation.

## The 4 Blocks + 8 Questions Framework

### Block 1: THE SPARK - My Big Idea
**Questions (2):**
1. **What's the problem I'm trying to solve?** - Describe the problem in simple terms
2. **What's my cool way of solving it?** - Describe your specific solution/approach

**Validation:** Both questions must have substantive answers (minimum 5 words each)

---

### Block 2: THE SOUL - Why It Matters
**Questions (2):**
1. **Who does this help?** - Identify the stakeholders/beneficiaries
2. **What good thing happens?** - Describe the positive outcome

**Validation:** Both questions must have substantive answers (minimum 5 words each)

---

### Block 3: THE MUSCLE - How to Build It
**Questions (3):**
1. **How does it work? (step by step)** - Provide a clear process/mechanism
2. **What's the first thing I do?** - Identify the initial concrete action
3. **What could go wrong?** - List potential risks or failure modes

**Validation:** All three questions must have substantive answers (minimum 5 words each)

---

### Block 4: THE SKIN - Does It Work?
**Questions (2):**
1. **How do I check if it's working?** - Define measurement mechanisms
2. **What tells me I'm on the right track?** - Define success indicators

**Validation:** Both questions must have substantive answers (minimum 5 words each)

---

## File Requirements

- **Filename:** `your-spark-name.spark.md`
- **Location:** `/sparks/` directory
- **Metadata:** Must include `**Originator:** @[GitHub-Username]`

## Submission Checklist

- [ ] File is named `[something].spark.md`
- [ ] File is saved in `/sparks/` directory
- [ ] All 4 blocks are present with correct headers
- [ ] All 8 questions are answered (not empty)
- [ ] Each answer has at least 5 words
- [ ] Metadata includes Originator
- [ ] Language is simple and clear (written like for a 10-year-old)
- [ ] Passes `novelty_scan.py --file sparks/your-spark-name.spark.md`

## Running Validation

```bash
# Validate a specific spark
python scripts/novelty_scan.py --file sparks/your-spark-name.spark.md

# Validate all sparks in the sparks/ directory
python scripts/novelty_scan.py
```

## Failure Cases

The validation script will return a failure if:
- Any of the 8 questions are missing
- Any question has an empty or very brief answer (< 5 words)
- The file is not readable

## Passing Criteria

A spark PASSES validation when:
- All required sections are present
- All 8 questions have substantive answers
- Originator is identified in metadata
- File follows naming convention

Once a spark passes validation, it is eligible for community review and audit.
