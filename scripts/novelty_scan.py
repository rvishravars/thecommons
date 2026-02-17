
import os
import re
import sys
import argparse

def scan_file(filepath):
    """
    Scans a markdown file for required Spark sections and tags.
    Returns True if valid, False otherwise.
    """
    print(f"🔍 Scanning: {filepath}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return False

    required_sections = [
        (r'Metadata', "Metadata Block"),
        (r'The Novel Core \(The Delta\)', "Novel Core Section"),
        (r'Prior Art Tags', "Prior Art Tags"),
    ]

    missing_sections = []
    for pattern, name in required_sections:
        if not re.search(pattern, content, re.IGNORECASE):
            missing_sections.append(name)

    if missing_sections:
        print(f"❌ Missing critical sections: {', '.join(missing_sections)}")
        return False

    # Extract Tags
    tags_match = re.search(r'\*\*Tags:\*\*\s*(.*)', content)
    tags = tags_match.group(1).strip() if tags_match else "None found"
    
    # Extract Prior Art Tags
    prior_art_match = re.search(r'\*\*Prior Art Tags.*:\*\*\s*(.*)', content, re.IGNORECASE)
    prior_art = prior_art_match.group(1).strip() if prior_art_match else "None found"

    print(f"✅ Structure Validated.")
    print(f"   🏷️  Spark Tags: {tags}")
    print(f"   📚 Prior Art Keys: {prior_art}")
    print(f"   🤖 [SIMULATION] AI Scribe would now search arXiv/GitHub for: {prior_art}")
    
    return True

def main():
    parser = argparse.ArgumentParser(description='Novelty Scan for Sparks.')
    parser.add_argument('--file', help='Specific file to scan')
    args = parser.parse_args()

    if args.file:
        files = [args.file]
    else:
        # Auto-discover modified files in sparks/ directory would happen here in a full action
        # For MVP, we will scan all files in sparks/ if no file arg provided
        files = []
        if os.path.exists('sparks'):
            for f in os.listdir('sparks'):
                if f.endswith('.md'):
                    files.append(os.path.join('sparks', f))

    if not files:
        print("⚠️ No spark files found to scan.")
        return # Not a failure, just nothing to do

    success = True
    for f in files:
        if not scan_file(f):
            success = False

    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
