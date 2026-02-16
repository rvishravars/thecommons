# 📜 TheCommons: Master Framework (v1.6)

---

## Part 1: The Manifesto

### 1. The Prime Directive: Novelty & Transparency
The value of a Spark is determined by its **Unique Insight**. We do not reward "re-inventing the wheel"; we reward the **Delta** (the measurable difference between the status quo and the new idea).
* **1.1 Radical Transparency:** Every project, discussion, and design is visible to the public from day one.
    * **1.1.1 The Delta Lock:** Upon submission, the Originator must explicitly define the **"Novel Core"**—the specific 10% of the idea that does not exist elsewhere.
* **1.2 Execution is the Moat:** While the idea is the seed, the only true competitive advantage is the speed and quality of execution.
* **1.3 The Glass Box AI:** Any AI integrated into governance must be fully open-source. The AI Scribe’s primary function is **Prior Art Discovery**—scanning global repositories to help the community verify the novelty of a Spark.
* **1.4 The Living Spark (Wiki Protocol):** A Spark is not a static post; it is a **Living Document** stored as a Markdown file in the `/sparks/` directory. It is subject to continuous refinement and community hardening via Pull Requests.

### 2. Governance: The Republic of Doers
Influence is earned through tangible value. The system is designed to filter out noise and amplify breakthrough insights.

#### 2.1 The Value Hierarchy
| Role | Reward | Purpose |
| :--- | :--- | :--- |
| **🧹 Janitor** | +2 CS | **Maintenance:** Keeping the existing ecosystem clean (typos, links, docs). |
| **🛠️ Refiner** | +10 CS | **Hardening:** Identifying flaws and stress-testing the "Novel Core" of others' ideas. |
| **⚡ Spark** | +25 CS | **Invention:** Proving a unique insight and defending its Novel Core. |
| **🏛️ Architect** | +50 CS | **Structure:** Proposing structural amendments to the Manifesto. |

#### 2.2 The technical Hierarchy
| Role | Reward | Purpose |
| :--- | :--- | :--- |
| **🧹 Janitor** | +2 CS | **Maintenance:** Cleaning the `/sparks/` directory or fixing formatting in Wiki files. |
| **🛠️ Refiner** | +10 CS | **Hardening:** Stress-testing the "Novel Core" via PRs to existing Spark files. |
| **⚡ Spark** | +25 CS | **Invention:** Creating a new file in `/sparks/` and defining a "Novel Core." |
| **🏛️ Architect** | +50 CS | **Structure:** Proposing amendments to the Root Manifesto. |

#### 2.3 The Novelty Bounty
* **Proof of Delta:** To earn the full **+25 CS**, a Spark must successfully withstand 3 "Refiner" critiques or technical audits.
* **The Implementation Bonus:** A one-time **+30 CS** is awarded when the Novel Core is successfully translated into a working MVP (Minimum Viable Product).
* **Proof of Presence:** All rewards require verifiable documentation (Merged PRs, Commits, or logged Technical Specs).

#### 2.4 Logarithmic Voting Power
To prevent "Whale Dictatorship," influence scales non-linearly:
$$Weight = log_{10}(CS)$$
* **Sybil Protection:** Voting rights are restricted to contributors with **3 merged PRs** or **CS > 50**.

### 3. The Law of the Supermajority (75%)
* **3.1 The Threshold:** Manifesto or core architecture changes require a **75% Weighted Supermajority**.
* **3.2 The Scribe’s Buffer:** AI-proposed updates are held in "Pending" for 24 hours for human review.
* **3.3 The Veto Command:** `!VOTE_VETO [Reason]` halts an update if 10% of total community weight supports the freeze.

### 4. Conflict & Dispute Resolution (The Novelty Audit)
* **4.1 The Challenge:** Users with CS > 10 may file a `!CHALLENGE` if they believe a Spark lacks novelty or is a derivative of existing work without attribution.
* **4.2 The Scribe’s Brief:** The AI Scribe acts as an **Investigator**. It generates a "Novelty Report" comparing the Spark to existing repositories and papers.
* **4.3 Human Jury:** Three randomly selected contributors (CS > 50) review the report and decide if the "Novel Core" stands.
* **4.4 The Cool-Down:** If a Spark receives >5 critical flaws in 24 hours, the AI locks the thread for 12 hours to prevent dogpiling.

### 5. Licensing & Continuity
* **5.1 Documentation:** Licensed under **CC-BY-SA 4.0**.
* **5.2 Software:** All automation and logic scripts licensed under **AGPL-3.0**.
* **5.3 Continuity:** If the host is inaccessible for >72h, the community is pre-authorized to migrate to the most active Fork.

---

## Part 2: Getting Started Guide

### 1. Level 1: The "Janitor" Entry (+2 CS)
Browse the repository. Find a typo, a broken link, or a formatting error. Submit a Pull Request (PR). Once merged, you earn your first **2 CS**. This is the fastest path to unlocking voting rights.

### 2. Level 2: Launch a "Novel Spark" (+25 CS)
Don't just post a project; post a **Unique Insight**.
1. Copy the `novel_spark_template.md`.
2. Define the **Existing Landscape** (What currently exists).
3. Define your **Novel Core** (The "Delta" that makes your idea different).
4. Use `!SPARK` to log it. Defend your logic against Refiners to secure your points.

### 3. Level 3: Become a Refiner (+10 CS)
Review an existing Spark. If you find "Prior Art" (an existing version of the idea) that the author missed, or identify a **Critical Flaw** in their logic, you earn Refiner points.

### 4. Commands for the AI Scribe
* `!SPARK`: Submits a Novel Core for review and system logging.
* `!VOTE_VETO`: Stops a pending Manifesto change.
* `!CHALLENGE`: Initiates a Novelty Audit on an idea.

---

## Part 3: The Development Roadmap

* [x] **Manifesto & Guide v1.5:** Novelty-centered governance and rewards.
* [ ] **Novelty Scan Script:** Integrate a tool for the AI Scribe to scan for prior art automatically.
* [ ] **CS Tracker Bot:** Automate CS point logging via GitHub Actions.
* [ ] **The Midnight Scribe:** Code the logic to generate "Proposed Patches" from community discussions.
* [ ] **Succession Protocol:** Create a "Panic Button" script for CS verification against IPFS hashes.

---
> *"The Commons rewards the insight that changes the game, and the execution that keeps it open."*