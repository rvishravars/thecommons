#!/usr/bin/env python3
"""
⚠️ DEPRECATED: This script has been migrated to Scribe v2.0

Use instead: python3 scribe/logic/stability_audit.py

This file is maintained for backward compatibility only.
For new development, use the Scribe stability auditor.
"""

import os
import re
import sys
import argparse
import warnings

# Show deprecation warning
warnings.warn(
    "novelty_scan.py is deprecated. Use 'python3 scribe/logic/stability_audit.py' instead.",
    DeprecationWarning,
    stacklevel=1
)

def scan_spark(filepath):
    """
    Scans a Spark file for the Phase-based LEGO architecture:
    1. Intuition (!HUNCH)
    2. Imagination (!SHAPE)
    3. Logic (!BUILD)
    """
    print(f"\n🧱 Checking Brick Stability: {filepath}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return False

    # Define Requirements for each Phase
    phases = {
        "Intuition (!HUNCH)": {
            "patterns": [r"The Observation", r"The Gap", r"The \"Why\""],
            "required_role": r"\*Scout: @[\w-]+"
        },
        "Imagination (!SHAPE)": {
            "patterns": [r"The Novel Core", r"The Blueprint", r"The Interface"],
            "required_role": r"\*Designer: @[\w-]+"
        },
        "Logic (!BUILD)": {
            "patterns": [r"Technical Implementation", r"Clutch Power Test"],
            "required_role": r"\*Builder: @[\w-]+"
        }
    }

    completion_status = []
    
    # 1. Evaluate Completion Level
    for phase_name, requirements in phases.items():
        # Check if Header exists
        header_exists = re.search(re.escape(phase_name), content, re.IGNORECASE)
        
        if header_exists:
            # Check for Role/Handle
            role_match = re.search(requirements["required_role"], content)
            
            # Check for pattern content
            missing_patterns = []
            for p in requirements["patterns"]:
                if not re.search(p, content, re.IGNORECASE):
                    missing_patterns.append(p)

            if role_match and not missing_patterns:
                completion_status.append(phase_name)
            else:
                if not role_match:
                    print(f"⚠️  {phase_name} found but missing @handle.")
                if missing_patterns:
                    print(f"⚠️  {phase_name} missing components: {', '.join(missing_patterns)}")

    # 2. Output Stability Report
    if not completion_status:
        print("❌ Invalid Brick: No phases completed.")
        return False

    print(f"✅ Stability Level: {len(completion_status)}/3 Phases locked.")
    for phase in completion_status:
        print(f"   [Snap] {phase} is stable.")

    # 3. Novelty Audit (The Scribe's Logic)
    # Check for the "Novel Core" description length in Imagination phase
    if "Imagination (!SHAPE)" in completion_status:
        novel_core_match = re.search(r"The Novel Core(.*?)(?=---|\n##)", content, re.DOTALL | re.IGNORECASE)
        if novel_core_match:
            text = novel_core_match.group(1).strip()
            if len(text.split()) < 15:
                print("⚠️  Warning: Novel Core description is too thin. Needs more Imagination.")

    return True

def main():
    parser = argparse.ArgumentParser(description='TheCommons v2.0 Stability Scan')
    parser.add_argument('--file', help='Specific Spark file to scan')
    args = parser.parse_args()

    files = []
    if args.file:
        files = [args.file]
    else:
        # Looking for .md files in the sparks directory
        if os.path.exists('sparks'):
            files = [os.path.join('sparks', f) for f in os.listdir('sparks') if f.endswith('.md')]

    if not files:
        print("⚠️ No Spark bricks found in /sparks/")
        return

    all_passed = True
    for f in files:
        if not scan_spark(f):
            all_passed = False

    if not all_passed:
        print("\n❌ Build failed. Some bricks are wobbly.")
        sys.exit(1)
    else:
        print("\n🌟 All scanned bricks are structurally sound!")

if __name__ == "__main__":
    main()