#!/usr/bin/env python3
"""
Scribe-Architect: Mission-Based Spark Evaluation System

Three core missions:
1. The Data Parser - Convert Markdown Sparks to structured JSON
2. The Stability Audit - Evaluate Spark quality and completeness
3. Governance Advisory - Provide merge recommendations and merit distribution
"""

import json
import re
from typing import Dict, List, Any, Tuple
from enum import Enum
from dataclasses import dataclass, asdict


class AuditStatus(Enum):
    """Audit status levels."""
    GREEN = "GREEN"      # All three phases filled with substantive content
    YELLOW = "YELLOW"    # One or more phases incomplete
    RED = "RED"          # Critical fields empty or contradictory logic


class MeritRole(Enum):
    """Contribution roles."""
    SCOUT = "Scout"
    DESIGNER = "Designer"
    BUILDER = "Builder"


@dataclass
class PhaseContent:
    """Structured phase content."""
    observation: str = ""
    gap: str = ""
    why: str = ""
    novel_core: str = ""
    blueprint: str = ""
    interface: str = ""
    technical_impl: str = ""
    clutch_test: str = ""
    dependencies: str = ""
    is_stable: bool = False


@dataclass
class MeritEntry:
    """Merit distribution entry."""
    handle: str
    role: str
    reward: str  # e.g., "+5 CS", "+15 CS", "+25 CS" (CS = Contribution Score)


class Mission1DataParser:
    """
    Mission 1: The Data Parser
    Parse Markdown Sparks into structured JSON for the Studio Noir UI.
    """

    @staticmethod
    def parse_spark_file(content: str) -> Dict[str, Any]:
        """
        Parse a Spark markdown file into structured JSON.
        Supports both Enhanced (section-based) and Legacy (phase-based) formats.
        
        Args:
            content: Raw markdown content
            
        Returns:
            Dictionary with spark metadata and phase/section content
        """
        # Extract spark metadata
        spark_id = Mission1DataParser._extract_id(content)
        spark_name = Mission1DataParser._extract_name(content)
        
        # Detect if this is an Enhanced spark (has spark_type: in YAML)
        is_enhanced = Mission1DataParser._is_enhanced_spark(content)
        
        if is_enhanced:
            # Parse enhanced 8-section format
            sections = Mission1DataParser._parse_enhanced_sections(content)
            return {
                "spark_id": spark_id,
                "spark_name": spark_name,
                "is_enhanced": True,
                "sections": sections,
                "contributors": {"scout": "", "designer": "", "builder": ""}
            }
        else:
            # Parse legacy 3-phase format
            spark = Mission1DataParser._parse_phase(content, "spark")
            design = Mission1DataParser._parse_phase(content, "design")
            logic = Mission1DataParser._parse_phase(content, "logic")
            
            # Extract contributors
            contributors = Mission1DataParser._extract_contributors(content, spark, design, logic)
            
            return {
                "spark_id": spark_id,
                "spark_name": spark_name,
                "is_enhanced": False,
                "spark": asdict(spark),
                "design": asdict(design),
                "logic": asdict(logic),
                "contributors": contributors
            }

    @staticmethod
    def _extract_id(content: str) -> str:
        """Extract spark ID from YAML frontmatter or generate from name."""
        frontmatter_match = re.search(r'^---\s*\n([\s\S]*?)\n---', content)
        if frontmatter_match:
            yaml = frontmatter_match.group(1)
            id_match = re.search(r'^id:\s*(.+)$', yaml, re.MULTILINE)
            if id_match:
                return id_match.group(1).strip().strip('"\'')
        
        # Fallback: generate from name
        name = Mission1DataParser._extract_name(content)
        return name.lower().replace(' ', '-')

    @staticmethod
    def _extract_name(content: str) -> str:
        """Extract spark name from frontmatter or header."""
        if not content:
            return "Untitled Spark"

        # Try YAML frontmatter name
        frontmatter_match = re.search(r'^---\s*\n([\s\S]*?)\n---', content)
        if frontmatter_match:
            yaml_block = frontmatter_match.group(1)
            name_match = re.search(r'^name:\s*(.+)$', yaml_block, re.MULTILINE)
            if name_match:
                extracted = name_match.group(1).strip().strip('"\'')
                if extracted:
                    return extracted
        
        # Try any H1 header
        # Be lenient: match start of line, whitespace, #, whitespace, content
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('#'):
                # Extract the title part after #
                raw_title = re.sub(r'^#\s*', '', line).strip()
                if not raw_title:
                    continue
                
                # Strip optional emoji and brand prefixes (Spark, Template)
                # Matches: 🧩 Spark: My Name -> My Name
                # Matches: Spark: My Name -> My Name
                # Matches: My Name -> My Name
                # This regex strips leading non-alphanumeric (like emojis) and the brand keywords
                # if followed by a colon or just space.
                clean_title = re.sub(r'^(?:[^\w\s]|\s)*(?:Spark|Template)\s*[:\s]\s*', '', raw_title, flags=re.IGNORECASE)
                
                final_name = clean_title.strip() if clean_title.strip() else raw_title
                return final_name
        
        return "Untitled Spark"

    @staticmethod
    def _is_enhanced_spark(content: str) -> bool:
        """Detect if this is an Enhanced spark (has spark_type: in YAML frontmatter)."""
        frontmatter_match = re.search(r'^---\s*\n([\s\S]*?)\n---', content)
        if frontmatter_match:
            yaml_block = frontmatter_match.group(1)
            # Check for spark_type field (indicates enhanced format)
            if re.search(r'^\s*spark_type:\s*', yaml_block, re.MULTILINE):
                return True
        return False

    @staticmethod
    def _parse_enhanced_sections(content: str) -> Dict[int, str]:
        """
        Parse Enhanced spark content into 8 sections.
        
        Args:
            content: Full markdown content
            
        Returns:
            Dictionary mapping section numbers (1-8) to their content
        """
        sections = {1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: ""}
        
        # Split by section headers (# 1. ..., # 2. ..., etc)
        section_pattern = r'^#\s*(\d+)\.\s+(.+?)$'
        
        lines = content.split('\n')
        current_section = None
        current_content = []
        
        for line in lines:
            # Check if this line starts a new section
            match = re.match(section_pattern, line)
            if match:
                # Save previous section if any
                if current_section is not None and current_section in sections:
                    sections[current_section] = '\n'.join(current_content).strip()
                
                # Start new section
                current_section = int(match.group(1))
                current_content = []
            elif current_section is not None:
                # Add line to current section (skip empty lines at start)
                if current_content or line.strip():
                    current_content.append(line)
        
        # Save last section
        if current_section is not None and current_section in sections:
            sections[current_section] = '\n'.join(current_content).strip()
        
        return sections

    @staticmethod
    def _parse_phase(content: str, phase_name: str) -> PhaseContent:
        """
        Parse a specific phase from markdown.
        
        Args:
            content: Full markdown content
            phase_name: "spark", "design", or "logic"
            
        Returns:
            PhaseContent object with extracted fields
        """
        phase_headers = {
            "spark": r"## 🧠 Phase 1: The Spark",
            "design": r"## 🎨 Phase 2: The Design",
            "logic": r"## 🛠️ Phase 3: The Logic"
        }
        
        header = phase_headers.get(phase_name)
        if not header:
            return PhaseContent()
        
        # Extract phase section (from header to next phase header or end of content)
        pattern = rf"{header}[^\n]*\n([\s\S]*?)(?=\n## |\n---\n|\Z)"
        match = re.search(pattern, content)
        if not match:
            return PhaseContent()
        
        phase_text = match.group(1)
        phase_obj = PhaseContent()
        
        # Extract fields based on phase
        if phase_name == "spark":
            phase_obj.observation = Mission1DataParser._extract_block_value(phase_text, "The Observation")
            phase_obj.gap = Mission1DataParser._extract_block_value(phase_text, "The Gap")
            phase_obj.why = Mission1DataParser._extract_block_value(phase_text, 'The "Why"')
            phase_obj.is_stable = True
            
        elif phase_name == "design":
            phase_obj.novel_core = Mission1DataParser._extract_block_value(phase_text, "The Novel Core")
            phase_obj.blueprint = Mission1DataParser._extract_block_value(phase_text, "The Blueprint")
            phase_obj.interface = Mission1DataParser._extract_block_value(phase_text, "The Interface")
            phase_obj.is_stable = bool(phase_obj.blueprint and phase_obj.interface)
            
        elif phase_name == "logic":
            phase_obj.technical_impl = Mission1DataParser._extract_block_value(phase_text, "Technical Implementation")
            phase_obj.clutch_test = Mission1DataParser._extract_block_value(phase_text, "Clutch Power Test")
            phase_obj.dependencies = Mission1DataParser._extract_block_value(phase_text, "Dependencies")
            phase_obj.is_stable = bool(phase_obj.technical_impl and phase_obj.clutch_test)
        
        return phase_obj

    @staticmethod
    def _extract_block_value(text: str, label: str) -> str:
        """
        Extract value from a labeled block (handles both bold and plain text).
        
        Matches patterns like:
        * **The Gap:** content here
        - **Blueprint:** content
        > quoted content
        """
        # Heading format: ### The Observation
        pattern = rf"###\s*{re.escape(label)}\s*\n([\s\S]*?)(?=\n### |\n\*\*|\n\* |\n## |\n---\n|$)"
        match = re.search(pattern, text, re.DOTALL)
        if match:
            value = match.group(1).strip()
            value = re.sub(r'^>\s+', '', value, flags=re.MULTILINE)
            return value.strip()

        # Bold format: * **Label:** content
        pattern = rf"\*?\s*\*\*{re.escape(label)}:?\*\*\s*(.+?)(?=\n\*\*|\n\* |\n### |\n## |\n---\n|$)"
        match = re.search(pattern, text, re.DOTALL)
        if match:
            value = match.group(1).strip()
            value = re.sub(r'\n\s*[-*]\s+', ' ', value)
            value = value.replace('\n', ' ')
            return value.strip()
        
        return ""

    @staticmethod
    def _extract_contributors(content: str, spark: PhaseContent, design: PhaseContent, logic: PhaseContent) -> Dict[str, str]:
        """Extract contributor handles from phase sections."""
        contributors = {
            "scout": "",
            "designer": "",
            "builder": ""
        }
        
        # Extract from phase status lines (e.g., "@username")
        patterns = {
            "spark": (r"## 🧠 Phase 1.*?@([\w-]+)", "scout"),
            "design": (r"## 🎨 Phase 2.*?@([\w-]+)", "designer"),
            "logic": (r"## 🛠️ Phase 3.*?@([\w-]+)", "builder")
        }
        
        for phase_name, (pattern, role) in patterns.items():
            match = re.search(pattern, content, re.DOTALL)
            if match:
                contributors[role] = match.group(1)
        
        return contributors


class Mission2StabilityAudit:
    """
    Mission 2: The Stability Audit
    Evaluate Spark quality and assign GREEN/YELLOW/RED status.
    """

    @staticmethod
    def audit_spark(spark_data: Dict[str, Any]) -> Tuple[AuditStatus, str, Dict[str, Any]]:
        """
        Audit a parsed Spark for stability and quality.
        Supports both enhanced (section-based) and legacy (phase-based) sparks.
        
        Args:
            spark_data: Output from Mission1DataParser.parse_spark_file()
            
        Returns:
            Tuple of (status, scribe_report, audit_details)
        """
        # Detect if this is an enhanced spark using the is_enhanced flag
        is_enhanced = spark_data.get("is_enhanced", False)
        
        if is_enhanced:
            return Mission2StabilityAudit._audit_enhanced_spark(spark_data)
        else:
            return Mission2StabilityAudit._audit_legacy_spark(spark_data)

    @staticmethod
    def _audit_enhanced_spark(spark_data: Dict[str, Any]) -> Tuple[AuditStatus, str, Dict[str, Any]]:
        """Audit enhanced spark (8-section format)."""
        sections = spark_data.get("sections", {})
        
        # Check critical sections
        section_1_complete = bool(sections.get(1, "").strip()) and len(sections.get(1, "")) > 50
        section_2_complete = bool(sections.get(2, "").strip()) and len(sections.get(2, "")) > 30
        section_3_or_4_complete = (
            (bool(sections.get(3, "").strip()) and len(sections.get(3, "")) > 30) or
            (bool(sections.get(4, "").strip()) and len(sections.get(4, "")) > 30)
        )
        
        stable_count = sum([section_1_complete, section_2_complete, section_3_or_4_complete])
        
        if stable_count == 3:
            status = AuditStatus.GREEN
            report = "✅ Fully stable across core sections (1, 2, 3/4)."
        elif stable_count >= 2:
            status = AuditStatus.YELLOW
            missing = []
            if not section_1_complete:
                missing.append("Section 1 (Spark Narrative)")
            if not section_2_complete:
                missing.append("Section 2 (Hypothesis)")
            if not section_3_or_4_complete:
                missing.append("Section 3/4 (Simulation/Evaluation)")
            report = f"⚠️ Needs refinement: {', '.join(missing)} incomplete."
        else:
            status = AuditStatus.RED
            report = "❌ Unstable. Critical sections are missing or incomplete."
        
        critical_flaws = Mission2StabilityAudit._detect_flaws_enhanced(sections)
        
        audit_details = {
            "stable_sections": stable_count,
            "total_required": 3,
            "critical_flaws": critical_flaws,
            "checks": {
                "section_1_complete": section_1_complete,
                "section_2_complete": section_2_complete,
                "section_3_or_4_complete": section_3_or_4_complete,
            }
        }
        
        return status, report, audit_details

    @staticmethod
    def _audit_legacy_spark(spark_data: Dict[str, Any]) -> Tuple[AuditStatus, str, Dict[str, Any]]:
        """Audit legacy spark (3-phase format)."""
        spark = spark_data.get("spark", {})
        design = spark_data.get("design", {})
        logic = spark_data.get("logic", {})
        
        # Count stable phases
        stable_phases = sum([
            bool(spark.get("is_stable")),
            bool(design.get("is_stable")),
            bool(logic.get("is_stable"))
        ])
        
        # Determine audit status
        if stable_phases == 3:
            status = AuditStatus.GREEN
            report = "✅ Fully stable across all three phases."
        elif stable_phases >= 1:
            status = AuditStatus.YELLOW
            missing = []
            if not spark.get("is_stable"):
                missing.append("Phase 1 (Spark)")
            if not design.get("is_stable"):
                missing.append("Phase 2 (Design)")
            if not logic.get("is_stable"):
                missing.append("Phase 3 (Logic)")
            report = f"⚠️  Needs refinement: {', '.join(missing)} incomplete."
        else:
            status = AuditStatus.RED
            report = "❌ Unstable. Critical phases are missing or empty."
        
        # Check for critical flaws
        critical_flaws = Mission2StabilityAudit._detect_flaws_legacy(spark_data)
        
        audit_details = {
            "stable_phases": stable_phases,
            "total_phases": 3,
            "critical_flaws": critical_flaws,
            "checks": {
                "spark_complete": spark.get("is_stable", False),
                "design_complete": design.get("is_stable", False),
                "logic_complete": logic.get("is_stable", False),
                "interface_snappable": bool(design.get("interface", "")),
                "logic_testable": bool(logic.get("clutch_test", ""))
            }
        }
        
        return status, report, audit_details

    @staticmethod
    def _detect_flaws_enhanced(sections: Dict[int, str]) -> List[str]:
        """Detect critical flaws in enhanced spark content."""
        flaws = []
        
        # Check for placeholder text
        placeholder_text = ["<", ">", "(", ")", "Describe", "Define", "TBD"]
        
        if len(sections.get(1, "")) < 50:
            flaws.append("Section 1 narrative too brief")
        if not sections.get(2, "").strip():
            flaws.append("Section 2 hypothesis missing")
            
        return flaws

    @staticmethod
    def _detect_flaws_legacy(spark_data: Dict[str, Any]) -> List[str]:
        """Detect critical flaws in legacy spark content."""
        flaws = []
        
        return flaws


class Mission3GovernanceAdvisory:
    """
    Mission 3: Governance Advisory
    Provide merge recommendations and merit distribution plan.
    """

    @staticmethod
    def generate_advisory(spark_data: Dict[str, Any], audit_status: AuditStatus, audit_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate governance advisory for spark evaluation.
        
        Args:
            spark_data: Parsed spark data
            audit_status: Status from Mission2
            audit_details: Audit details from Mission2
            
        Returns:
            Governance advisory with recommendation and merit plan
        """
        # Determine recommendation
        if audit_status == AuditStatus.GREEN:
            recommendation = "Final Lock"
            confidence = "high"
        elif audit_status == AuditStatus.YELLOW:
            recommendation = "Request Refinement"
            confidence = "medium"
        else:  # RED
            recommendation = "Reject"
            confidence = "low"
        
        # Calculate merit distribution
        merit_plan = Mission3GovernanceAdvisory._calculate_merit(spark_data, audit_status)
        
        # Generate governance advisory
        advisory = {
            "final_lock_recommendation": recommendation,
            "confidence_level": confidence,
            "merge_ready": audit_status == AuditStatus.GREEN,
            "critical_issues": audit_details.get("critical_flaws", []),
            "merit_distribution": merit_plan,
            "governance_notes": Mission3GovernanceAdvisory._generate_notes(spark_data, audit_status)
        }
        
        return advisory

    @staticmethod
    def _calculate_merit(spark_data: Dict[str, Any], audit_status: AuditStatus) -> List[Dict[str, str]]:
        """
        Calculate merit (CS = Contribution Score) distribution based on contributions.
        
        Args:
            spark_data: Parsed spark data
            audit_status: Audit status
            
        Returns:
            List of merit entries with contributor handles and rewards
        """
        merit = []
        contributors = spark_data.get("contributors", {})
        
        # Scout: +5 CS for completing spark
        if contributors.get("scout"):
            scout_reward = "+5 CS"
            if spark_data.get("spark", {}).get("is_stable"):
                merit.append({
                    "handle": f"@{contributors['scout']}",
                    "role": MeritRole.SCOUT.value,
                    "reward": scout_reward
                })
        
        # Designer: +15 CS for completing design (+ echo bonus if stable)
        if contributors.get("designer"):
            designer_reward = "+15 CS"
            if spark_data.get("design", {}).get("is_stable") and audit_status == AuditStatus.GREEN:
                designer_reward = "+15 CS (+5 Echo bonus)"
            merit.append({
                "handle": f"@{contributors['designer']}",
                "role": MeritRole.DESIGNER.value,
                "reward": designer_reward
            })
        
        # Builder: +25 CS for completing logic (+ prototype bonus if merged)
        if contributors.get("builder"):
            builder_reward = "+25 CS"
            if audit_status == AuditStatus.GREEN:
                builder_reward = "+25 CS (+10 Prototype bonus)"
            merit.append({
                "handle": f"@{contributors['builder']}",
                "role": MeritRole.BUILDER.value,
                "reward": builder_reward
            })
        
        return merit

    @staticmethod
    def _generate_notes(spark_data: Dict[str, Any], audit_status: AuditStatus) -> str:
        """Generate governance notes."""
        spark_name = spark_data.get("spark_name", "Unnamed Spark")
        
        if audit_status == AuditStatus.GREEN:
            return "Meets all Meritocratic Standards. Ready for Final Lock and community integration."
        elif audit_status == AuditStatus.YELLOW:
            return "Shows promise but requires refinement before merge. Request contributors address feedback."
        else:
            return "Does not meet Meritocratic Standards. Recommend rejection until critical flaws are resolved."


def evaluate_spark_mission(content: str) -> Dict[str, Any]:
    """
    Complete evaluation pipeline: Execute all three missions.
    
    Args:
        content: Raw markdown spark content
        
    Returns:
        Structured JSON output with all mission results
    """
    # Mission 1: Parse
    spark_data = Mission1DataParser.parse_spark_file(content)
    
    # Mission 2: Audit
    audit_status, scribe_report, audit_details = Mission2StabilityAudit.audit_spark(spark_data)
    
    # Mission 3: Advise
    advisory = Mission3GovernanceAdvisory.generate_advisory(spark_data, audit_status, audit_details)
    
    # Compile output schema
    output = {
        "spark_info": {
            "id": spark_data.get("spark_id"),
            "name": spark_data.get("spark_name"),
            "stability_score": audit_details.get("stable_phases", 0)
        },
        "content": {
            "spark": {
                "observation": spark_data.get("spark", {}).get("observation", ""),
                "gap": spark_data.get("spark", {}).get("gap", ""),
                "why": spark_data.get("spark", {}).get("why", ""),
                "is_stable": spark_data.get("spark", {}).get("is_stable", False)
            },
            "design": {
                "core": spark_data.get("design", {}).get("novel_core", ""),
                "blueprint": spark_data.get("design", {}).get("blueprint", ""),
                "interface": spark_data.get("design", {}).get("interface", ""),
                "is_stable": spark_data.get("design", {}).get("is_stable", False)
            },
            "logic": {
                "implementation": spark_data.get("logic", {}).get("technical_impl", ""),
                "test_pass": spark_data.get("logic", {}).get("clutch_test", ""),
                "dependencies": spark_data.get("logic", {}).get("dependencies", ""),
                "is_stable": spark_data.get("logic", {}).get("is_stable", False)
            }
        },
        "audit": {
            "status": audit_status.value,
            "scribe_report": scribe_report,
            "recommendation": advisory.get("final_lock_recommendation"),
            "confidence_level": advisory.get("confidence_level"),
            "critical_flaws": audit_details.get("critical_flaws", []),
            "checks": audit_details.get("checks", {})
        },
        "merit_plan": advisory.get("merit_distribution", []),
        "governance_notes": advisory.get("governance_notes", "")
    }
    
    return output


# CLI INTERFACE - RESERVED FOR LATER
# The AI scribe is not invoked via commands currently.
# This functionality is preserved for future use.

# if __name__ == "__main__":
#     # Example usage
#     import sys
#     
#     if len(sys.argv) < 2:
#         print("Usage: python missions.py <spark_file.md>")
#         sys.exit(1)
#     
#     with open(sys.argv[1], 'r') as f:
#         content = f.read()
#     
#     result = evaluate_spark_mission(content)
#     print(json.dumps(result, indent=2))
