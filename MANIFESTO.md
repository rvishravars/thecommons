# 📜 TheCommons: Master Framework

---

## Part 1: The Manifesto (v1.3)

### 1. The Prime Directive: Open by Default
Innovation is a public utility. We renounce "stealth mode," NDAs, and private repositories.
* **1.1 Radical Transparency:** Every project, discussion, and design is visible to the public from day one.
    * **1.1.1 Security Exception:** Security vulnerabilities in the Governance Platform itself may be patched in a private temporary fork (max 72 hours) before public disclosure.
* **1.2 Execution is the Moat:** The only true competitive advantage is the speed and quality of execution.
* **1.3 Integrity of Origin:** Purposely misrepresenting external IP as an original Spark is a System Offense. The AI Scribe will re-attribute "Originator" status to primary sources when discovered.
* **1.4 The Glass Box AI:** Any AI model integrated into the governance workflow must be fully open-source (weights and code) and explainable. "Black Box" APIs are strictly prohibited.

### 2. Governance: The Republic of Doers
Influence is earned through tangible value added to the ecosystem.

#### 2.1 The Four Roles of Contribution
The system recognizes four tiers of effort, each with specific rewards:

* **🧹 The Janitor (+2 CS):** The entry point. Janitors maintain the "Garden" by fixing typos, repairing broken links, updating documentation, and improving formatting. This is the fastest path to earning initial voting rights.
* **🛠️ The Refiner (+10 CS):** The technical backbone. Refiners identify **Critical Flaws** in Sparks, write technical specifications, and design the "Manual Logic" (human-executable instructions) for a project.
* **⚡ The Spark (+15 CS):** The originators. Sparks launch new ideas using the `idea_template.md`. As "Root Originators," they are entitled to a 15% CS royalty from downstream forks and refinements.
* **🏛️ The Architect (+50 CS):** The structural designers. Architects propose amendments to this Manifesto, the Governance Logic, or the Core AI Scribe code. These changes require a 75% Supermajority.

| Role | Reward | Purpose |
| :--- | :--- | :--- |
| **Janitor** | +2 CS | Reliability & Onboarding |
| **Refiner** | +10 CS | Feasibility & Technical Depth |
| **Spark** | +15 CS | Creative Origin & Expansion |
| **Architect** | +50 CS | Structural Integrity & Evolution |

#### 2.2 Logarithmic Voting Power
Voting weight is decoupled from total points to prevent "Whale Dictatorship." 
$$Weight = log_{10}(CS)$$
To prevent **Sybil attacks**, voting rights are restricted to contributors with a verifiable history of at least **3 merged PRs** or **CS > 50**.

### 3. The Law of the Supermajority (75%)
* **3.1 The Threshold:** Manifesto or core architecture changes require a **75% Weighted Supermajority**.
* **3.2 The Scribe’s Buffer:** AI-generated updates are held in "Pending" for 24 hours.
* **3.3 The Veto Command:** A `!VOTE_VETO [Reason]` command halts an update if 10% of the total community weight supports the freeze.

### 4. The Pulse: Life & Death of an Idea
* **4.1 Stagnation Check:** Ideas with no updates for **60 days** are automatically **Archived**.
* **4.2 The Reclamation Right:** Any archived or stagnant idea can be **Claimed** by a new lead. 

### 5. Universal Accessibility (IT-Optional)
* **5.1 The Manual First Rule:** Contributors are encouraged to define the "Human Logic" (paper/pencil) of their idea before digital automation.
* **5.2 Proof of Presence:** CS for "Execution" requires verifiable documentation (URLs, Repos, or Photos).

### 6. Conflict & Dispute Resolution
* **6.1 The Challenge Mechanism:** Users with CS > 10 may file a `!CHALLENGE` to trigger an AI audit.
* **6.2 Resolution Tiers:** Resolves via Automated Audit (Tier 1), Community Jury (Tier 2), or Split Fork (Tier 3).
* **6.3 The "Bad Faith" Penalty:** Malicious flagging results in a CS Penalty.

### 7. Licensing & Legal Protection
* **7.1 Documentation:** All text and ideas are licensed under **CC-BY-SA 4.0**.
* **7.2 Software:** All automation scripts are licensed under **AGPL-3.0**.
* **7.3 The Sentinel:** The AI Scribe scans for unattributed use of Commons logic externally.
* **7.4 The Continuity Clause:** If the host is inaccessible for >72 hours, the community is pre-authorized to migrate to the most active Fork.

### 8. Hosting Openness (The Freedom to Run)
* **8.1 Self-Hosting Guarantee:** The platform must be self-hostable. No features shall be gated behind proprietary cloud services.
* **8.2 Zero Vendor Lock-in:** All dependencies must be open-source or easily replaceable.
* **8.3 The "Code & Data" Covenant:**
    * **Code:** Mirrored to multiple public repositories (GitHub, GitLab, etc.).
    * **Data:** A snapshot of all public Sparks and CS scores published daily to IPFS/Arweave.

---

## Part 2: Getting Started Guide

### 1. Your First Action: The "Janitor" Entry (+2 CS)
Browse the repository. Find a typo, a broken link, or a formatting error. Submit a Pull Request (PR). Once merged, you earn your first **2 CS**. Complete 3 of these to unlock your voting rights.

### 2. Launch a "Spark" (+15 CS)
Have an idea? Copy the `idea_template.md`, fill out the **Manual Logic**, and post it in **Discussions**. Once validated, you are the **Root Originator**.

### 3. Become a Refiner (+10 CS)
Review an existing Spark. Post a **Critical Flaw** or a **Technical Spec**. Providing a solution to a flaw earns you Refiner status.

### 4. Commands for the AI Scribe
Type these in GitHub comments to interact with the system:
* `!SPARK`: Submits an idea for review.
* `!VOTE_VETO`: Stops a pending Manifesto change.
* `!CHALLENGE`: Questions the origin or points of a project.

---

## Part 3: TODO - The Development Roadmap

* [x] **Manifesto v1.3:** Codified governance, licensing, roles, and continuity.
* [ ] **Getting Started Guide:** Finalize detailed onboarding manual.
* [ ] **Automated IPFS Backups:** Script a daily snapshot of CS scores and Sparks to IPFS/Arweave.
* [ ] **CS Tracker Bot:** Automate CS point logging via GitHub Actions.
* [ ] **The Midnight Scribe:** Code the logic to generate "Proposed Patches" from community discussions.
* [ ] **Succession Protocol:** Create a "Panic Button" script for CS verification against IPFS hashes.
* [ ] **Knowledge Royalty Script:** Automate the 15% CS royalty flow back to Root Originators.

---
> *"The Commons belongs to those who build it, and it stays open for those who follow."*