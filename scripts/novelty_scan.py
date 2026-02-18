
import os
import re
import sys
import argparse

def scan_file(filepath):
    """
    Scans a markdown file for the 8-question Spark template.
    Validates: All 4 blocks + 8 questions have content.
    Returns True if valid, False otherwise.
    """
    print(f"\n🔍 Scanning: {filepath}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return False

    # Define the 8 required questions across 4 blocks
    required_questions = [
        # SPARK Block
        (r"What's the problem I'm trying to solve\?", "SPARK: Problem"),
        (r"What's my cool way of solving it\?", "SPARK: Solution"),
        # SOUL Block
        (r"Who does this help\?", "SOUL: Who"),
        (r"What good thing happens\?", "SOUL: Impact"),
        # MUSCLE Block
        (r"How does it work\? \(step by step\)", "MUSCLE: How It Works"),
        (r"What's the first thing I do\?", "MUSCLE: First Step"),
        (r"What could go wrong\?", "MUSCLE: Risks"),
        # SKIN Block
        (r"How do I check if it's working\?", "SKIN: Measurement"),
        (r"What tells me I'm on the right track\?", "SKIN: Success Signals"),
    ]

    missing_questions = []
    empty_questions = []
    
    for pattern, label in required_questions:
        # Check if question exists
        match = re.search(pattern, content, re.IGNORECASE)
        if not match:
            missing_questions.append(label)
            continue
        
        # Check if question has content after it (not empty)
        question_pos = match.end()
        next_question = re.search(r'^###', content[question_pos:], re.MULTILINE)
        
        if next_question:
            answer_text = content[question_pos:question_pos + next_question.start()].strip()
        else:
            answer_text = content[question_pos:].strip()
        
        # Simple check: answer should have at least 10 characters of non-whitespace
        if len(answer_text.split()) < 5:
            empty_questions.append(label)

    # Check for Metadata
    if not re.search(r'\*\*Originator:', content):
        print(f"⚠️  Missing Originator in Metadata")
    
    issues = []
    if missing_questions:
        issues.append(f"Missing questions: {', '.join(missing_questions)}")
    if empty_questions:
        issues.append(f"Incomplete answers: {', '.join(empty_questions)}")
    
    if issues:
        print(f"❌ Issues found:")
        for issue in issues:
            print(f"   • {issue}")
        return False

    print(f"✅ All 8 questions answered!")
    print(f"   Block 1 (SPARK): Problem + Solution")
    print(f"   Block 2 (SOUL): Who + Impact")
    print(f"   Block 3 (MUSCLE): How + First Step + Risks")
    print(f"   Block 4 (SKIN): Measurement + Success Signals")
    
    return True

def main():
    parser = argparse.ArgumentParser(description='Novelty Scan for Sparks (8Q Template)')
    parser.add_argument('--file', help='Specific file to scan')
    args = parser.parse_args()

    if args.file:
        files = [args.file]
    else:
        # Auto-discover .spark.md files in sparks/ directory
        files = []
        if os.path.exists('sparks'):
            for f in os.listdir('sparks'):
                if f.endswith('.spark.md') or f.endswith('.md'):
                    files.append(os.path.join('sparks', f))

    if not files:
        print("⚠️ No spark files found to scan.")
        return

    success = True
    for f in files:
        if not scan_file(f):
            success = False

    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()

