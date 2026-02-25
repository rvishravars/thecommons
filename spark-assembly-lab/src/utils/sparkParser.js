/**
 * Parse a Spark markdown file
 * Note: Simplified parser for browser compatibility
 */
export function parseSparkFile(content) {
  console.log('🔍 Parsing spark file, content length:', content.length);

  let enhancedContributors = { scout: '' };

  // Extract spark name - support multiple formats
  let name = 'Untitled Spark';
  let markedForDeletion = false;

  // Try YAML frontmatter first
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const yaml = frontmatterMatch[1];
    // Try `name:` first, then `title:` (used by enhanced sparks)
    const nameFieldMatch = yaml.match(/^name:\s*(.+)$/m);
    const titleFieldMatch = yaml.match(/^title:\s*(.+)$/m);
    if (nameFieldMatch) {
      name = nameFieldMatch[1].trim().replace(/^["']|["']$/g, '');
    } else if (titleFieldMatch) {
      name = titleFieldMatch[1].trim().replace(/^["']|["']$/g, '');
    }
    // Check for deletion flag
    const deletionFlagMatch = yaml.match(/^marked_for_deletion:\s*(true|yes)$/mi);
    if (deletionFlagMatch) {
      markedForDeletion = true;
    }
    // Also extract scout/owner from frontmatter if present
    const scoutFM = yaml.match(/^(?:scout|owner):\s*@?([\w-]+)/m);
    if (scoutFM && !enhancedContributors.scout) {
      enhancedContributors.scout = scoutFM[1];
    }
  }

  // If no name found in frontmatter, fall back to the first H1 heading
  // but skip enhanced template section headings like '# 1. Spark Narrative'
  if (name === 'Untitled Spark') {
    const lines = content.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('#') && !/^#\s*\d+\./.test(line)) {
        // Extract the title part after #
        const rawTitle = line.replace(/^#\s*/, '').trim();
        if (!rawTitle) continue;

        // Strip optional emoji and brand prefixes (Spark, Template)
        // This regex handles: 🧩 Spark: My Name, Spark: My Name, # My Name, etc.
        const cleanTitle = rawTitle.replace(/^(?:[^\w\s\u{1F300}-\u{1F9FF}]|\s)*(?:Spark|Template|The)\s*[:\s]\s*/iu, '').trim();

        name = cleanTitle || rawTitle;
        break;
      }
    }
  }

  console.log('📝 Spark name:', name);

  // Parse Phase 1: Spark
  const spark = extractPhase(content, '## 🧠 Phase 1: The Spark');
  console.log('🧠 Spark phase:', spark);

  // Parse Phase 2: Design
  const design = extractPhase(content, '## 🎨 Phase 2: The Design');
  console.log('🎨 Design phase:', design);

  // Parse Phase 3: Logic
  const logic = extractPhase(content, '## 🛠️ Phase 3: The Logic');
  console.log('🛠️ Logic phase:', logic);

  const stability = calculateStability({ spark, design, logic });
  console.log('📊 Stability:', stability);

  // For enhanced sparks, already extracted from frontmatter or try to extract from *Scout: @handle* lines
  if ((content || '').includes('spark_type:')) {
    const scoutMatch = content.match(/\*(?:Scout|Owner):\s*@?([\w-]+)\*/i);
    if (scoutMatch) enhancedContributors.scout = scoutMatch[1];
  }

  const result = {
    name,
    markedForDeletion,
    frontmatter: {},
    isEnhanced: (content || '').includes('spark_type:'),
    sections: extractGranularSections(content || ''),
    phases: {
      spark: {
        status: spark.status,
        observation: spark.content.observation || '',
        gap: spark.content.gap || '',
        why: spark.content.why || '',
        notes: extractPhaseNotes(spark.raw),
      },
      design: {
        status: design.status,
        novel_core: design.content.novel_core || '',
        blueprint: design.content.blueprint || '',
        interface: design.content.interface || '',
        prior_art: design.content.prior_art || '',
        notes: extractPhaseNotes(design.raw),
      },
      logic: {
        status: logic.status,
        technical_impl: logic.content.technical_impl || '',
        clutch_test: logic.content.clutch_test || '',
        dependencies: logic.content.dependencies || '',
        notes: extractPhaseNotes(logic.raw),
      },
    },
    contributors: {
      scout: enhancedContributors.scout || spark.contributor || '',
    },
    stability,
    proposals: parseProposals(content),
  };
  console.log('✅ Parsed result:', result);
  return result;
}

const ENHANCED_SECTION_HEADERS = [
  '# 1. Spark Narrative',
  '# 2. Hypothesis Formalization',
  '# 3. Simulation / Modeling Plan',
  '# 4. Evaluation Strategy',
  '# 5. Feedback & Critique',
  '# 6. Results (When Available)',
  '# 7. Revision Notes',
  '# 8. Next Actions'
];

function extractGranularSections(content) {
  const sections = {};
  ENHANCED_SECTION_HEADERS.forEach((header, index) => {
    const nextHeader = ENHANCED_SECTION_HEADERS[index + 1];
    const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedNextHeader = nextHeader ? nextHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '$';
    const regex = new RegExp(`${escapedHeader}\\s*\\n?([\\s\\S]*?)(?=\\n---?\\n|\\n${escapedNextHeader}|${escapedNextHeader}|$)`, 'i');
    const match = content.match(regex);
    if (match) {
      sections[index + 1] = match[1].trim();
    }
  });
  return sections;
}

function extractPhaseNotes(rawPhase) {
  if (!rawPhase) return '';
  let notes = rawPhase
    .replace(/^##[^\n]*\n/, '')
    .replace(/^\*Status:[^\n]*\n?/m, '')
    .replace(/^\*Scout:[^\n]*\n?/m, '')
    .replace(/^\*Designer:[^\n]*\n?/m, '')
    .replace(/^\*Builder:[^\n]*\n?/m, '')
    .replace(/\n?---\s*$/m, '')
    .trim();
  return notes;
}

function parseProposals(content) {
  const proposals = { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '' };
  const sectionMatch = content.match(/# 9\. Community Proposals\s*\n([\s\S]*?)(?=\n---\n# Maturity Guide|$)/);
  if (!sectionMatch) return proposals;

  const section = sectionMatch[1];
  const sectionRegex = {
    1: /## Proposed Changes to Section 1 \(Spark Narrative\)\s*\n([\s\S]*?)(?=\n---\n## Proposed Changes to Section 2|$)/,
    2: /## Proposed Changes to Section 2 \(Hypothesis Formalization\)\s*\n([\s\S]*?)(?=\n---\n## Proposed Changes to Section 3|$)/,
    3: /## Proposed Changes to Section 3 \(Simulation \/ Modeling Plan\)\s*\n([\s\S]*?)(?=\n---\n## Proposed Changes to Section 4|$)/,
    4: /## Proposed Changes to Section 4 \(Evaluation Strategy\)\s*\n([\s\S]*?)(?=\n---\n## Proposed Changes to Section 5|$)/,
    5: /## Proposed Changes to Section 5 \(Feedback & Critique\)\s*\n([\s\S]*?)(?=\n---\n## Proposed Changes to Section 6|$)/,
    6: /## Proposed Changes to Section 6 \(Results\)\s*\n([\s\S]*?)(?=\n---\n## Proposed Changes to Section 7|$)/,
    7: /## Proposed Changes to Section 7 \(Revision Notes\)\s*\n([\s\S]*?)(?=\n---\n## Proposed Changes to Section 8|$)/,
    8: /## Proposed Changes to Section 8 \(Next Actions\)\s*\n([\s\S]*?)(?=\n---\n> \*\*Proposal Tracking\*\*:|$)/,
  };

  Object.entries(sectionRegex).forEach(([key, regex]) => {
    const match = section.match(regex);
    if (match) {
      proposals[key] = match[1].trim();
    }
  });

  return proposals;
}

export function buildMissionSummary(parsedSpark) {
  // Support both enhanced (section-based) and legacy (phase-based) sparks
  // Detect enhanced by:
  // 1. Explicit isEnhanced flag
  // 2. Has sections object with content
  // 3. Has rawContent with section headers
  const hasEnhancedSections = parsedSpark?.sections && Object.values(parsedSpark.sections).some(s => s && s.length > 0);
  const hasEnhancedRawContent = parsedSpark?.rawContent && (
    parsedSpark.rawContent.includes('# 1. Spark Narrative') ||
    parsedSpark.rawContent.includes('spark_type:')
  );
  const isEnhanced = (parsedSpark?.isEnhanced === true) || hasEnhancedSections || hasEnhancedRawContent;

  console.log('🔍 buildMissionSummary debug:', {
    isEnhanced,
    hasIsEnhancedFlag: parsedSpark?.isEnhanced,
    hasEnhancedSections,
    hasEnhancedRawContent,
    sectionCount: parsedSpark?.sections ? Object.keys(parsedSpark.sections).length : 0,
  });

  if (isEnhanced) {
    // Enhanced spark validation (8 sections)
    const sections = parsedSpark?.sections || {};

    // Helper to check if section has meaningful content (not just comments or placeholders)
    const hasMeaningfulContent = (content) => {
      if (!content) return false;
      const cleaned = content
        .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
        .replace(/^#+\s+.*$/gm, '') // Remove headers
        .replace(/^-\s+.*$/gm, '') // Remove list items
        .trim();
      return cleaned && cleaned.length > 20;
    };

    const checks = {
      section_1_complete: hasMeaningfulContent(sections[1]), // Spark Narrative
      section_2_complete: hasMeaningfulContent(sections[2]), // Hypothesis Formalization
      section_3_or_4_complete:
        hasMeaningfulContent(sections[3]) ||
        hasMeaningfulContent(sections[4]) // Simulation or Evaluation
    };

    const stableCount = Object.values(checks).filter(Boolean).length;
    let status = 'RED';
    if (stableCount === 3) {
      status = 'GREEN';
    } else if (stableCount >= 2) {
      status = 'YELLOW';
    }

    const criticalFlaws = [];
    if (!checks.section_1_complete) {
      criticalFlaws.push('Section 1 (Spark Narrative) is missing or needs more detail');
    }
    if (!checks.section_2_complete) {
      criticalFlaws.push('Section 2 (Hypothesis Formalization) is missing or needs more detail');
    }
    if (!checks.section_3_or_4_complete) {
      criticalFlaws.push('Section 3 (Simulation) or Section 4 (Evaluation) needed');
    }

    const recommendation = status === 'GREEN'
      ? 'Final Lock'
      : status === 'YELLOW'
        ? 'Request Refinement'
        : 'Reject';

    const scribeReport = status === 'GREEN'
      ? `✅ Fully stable across core sections.`
      : status === 'YELLOW'
        ? `⚠️ Core sections need refinement before merge.`
        : `❌ Unstable. Critical sections are missing or incomplete.`;

    const meritPlan = [];
    if (parsedSpark?.contributors?.scout) {
      meritPlan.push({
        handle: `@${parsedSpark.contributors.scout}`,
        role: 'Owner',
        reward: '+5 CS',
      });
    }

    return {
      status,
      critical_flaws: criticalFlaws,
      recommendation,
      scribe_report: scribeReport,
      merit_plan: meritPlan,
    };
  } else {
    // Legacy phase-based validation
    const spark = parsedSpark?.phases?.spark || {};
    const design = parsedSpark?.phases?.design || {};
    const logic = parsedSpark?.phases?.logic || {};

    const checks = {
      spark_complete: true,
      design_complete: Boolean(design.blueprint && design.interface),
      logic_complete: Boolean(logic.technical_impl && logic.clutch_test),
      interface_snappable: Boolean(design.interface),
      logic_testable: Boolean(logic.clutch_test),
    };

    const stablePhases = [
      checks.spark_complete,
      checks.design_complete,
      checks.logic_complete,
    ].filter(Boolean).length;

    let status = 'RED';
    if (stablePhases === 3) {
      status = 'GREEN';
    } else if (stablePhases >= 1) {
      status = 'YELLOW';
    }

    const criticalFlaws = [];
    if (!spark.gap) {
      criticalFlaws.push('Missing gap definition in Spark');
    }
    if (!design.interface) {
      criticalFlaws.push('Missing interface specification');
    }
    if (!logic.clutch_test) {
      criticalFlaws.push('Missing Clutch Power Test');
    }
    if (!logic.dependencies) {
      criticalFlaws.push('Missing dependency list');
    }

    const recommendation = status === 'GREEN'
      ? 'Final Lock'
      : status === 'YELLOW'
        ? 'Request Refinement'
        : 'Reject';

    const scribeReport = status === 'GREEN'
      ? `✅ Fully stable across all three phases.`
      : status === 'YELLOW'
        ? `⚠️ Needs refinement before merge.`
        : `❌ Unstable. Critical phases are missing or empty.`;

    const meritPlan = [];
    if (parsedSpark?.contributors?.scout) {
      meritPlan.push({
        handle: `@${parsedSpark.contributors.scout}`,
        role: 'Owner',
        reward: '+5 CS',
      });
    }

    return {
      status,
      critical_flaws: criticalFlaws,
      recommendation,
      scribe_report: scribeReport,
      merit_plan: meritPlan,
    };
  }
}


export function validateSparkData(sparkData) {
  const errors = [];
  const name = (sparkData?.name || '').trim();

  // --- Common checks ---
  if (!name || name === 'New Spark') {
    errors.push('Please give your spark a descriptive name');
  }

  // --- Enhanced spark checks (sections-based) ---
  if (sparkData?.isEnhanced) {
    const sections = sparkData.sections || {};
    const narrativeContent = (sections[1] || '').trim();

    if (!narrativeContent || narrativeContent.length < 50) {
      errors.push('Section 1 (Spark Narrative) must have meaningful content — minimum 50 characters');
    }

    const activeSections = sparkData.activeSections || [1];
    for (const sectionNum of activeSections) {
      const content = (sections[sectionNum] || '').trim();
      if (!content || content.length < 10) {
        errors.push(`Section ${sectionNum} is active but has no content — fill it in or remove it`);
      }
    }
  } else {
    // --- Standard 3-phase spark checks ---
    const phases = sparkData?.phases || {};
    const spark = phases.spark || {};
    const sparkContent = spark.notes || spark.observation || '';
    if (!sparkContent || sparkContent.length < 20) {
      errors.push('Spark phase (Scout observation) must have some content');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extract phase content from markdown
 */
function extractPhase(content, headerPattern) {
  const regex = new RegExp(`${headerPattern}[^#]*(?:###[^#]*)*`, 's');
  const match = content.match(regex);

  if (!match) return { status: 'empty', content: {}, raw: '' };

  const phaseContent = match[0];

  // Extract status (supports both *Status: [Active]* and *Status: Claimed*)
  let statusMatch = phaseContent.match(/\*Status: \[([^\]]+)\]\*/);
  let status = statusMatch ? statusMatch[1].split('/')[0].trim() : null;

  // Fallback to format without brackets
  if (!status) {
    statusMatch = phaseContent.match(/\*Status:\s*([^*]+)\*/);
    status = statusMatch ? statusMatch[1].trim() : 'empty';
  }

  // Extract contributor
  const contributorMatch = phaseContent.match(/@([\w-]+)/);
  const contributor = contributorMatch ? contributorMatch[1] : null;

  return {
    status,
    contributor,
    content: extractBlockContent(phaseContent),
    raw: phaseContent,
  };
}

/**
 * Extract individual block content
 */
function extractBlockContent(phaseText) {
  const content = {};

  const blockTerminator = '\\n\\s*(?:\\*+\\s*)?(?:\\*\\*|###|##|---|$)';

  // Common patterns
  const patterns = {
    observation: new RegExp(`(?:###\\s*The Observation|\\*\\*The Observation:?\\*\\*)\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    gap: new RegExp(`(?:\\*+\\s*)?\\*\\*The Gap:\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    why: new RegExp(`(?:\\*+\\s*)?\\*\\*The "Why":\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    novel_core: new RegExp(`(?:###\\s*The Novel Core[^\\n]*|\\*\\*The Novel Core:?\\*\\*)\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    blueprint: new RegExp(`(?:\\*+\\s*)?\\*\\*The Blueprint:\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    interface: new RegExp(`(?:\\*+\\s*)?\\*\\*The Interface:\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    prior_art: new RegExp(`(?:\\*+\\s*)?\\*\\*Prior Art:\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    technical_impl: new RegExp(`(?:###\\s*Technical Implementation|\\*\\*Technical Specs[^:]*:\\*\\*|\\*\\*The Logic:\\*\\*)\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    clutch_test: new RegExp(`(?:\\*+\\s*)?\\*\\*Clutch Power Test:\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    dependencies: new RegExp(`(?:\\*+\\s*)?\\*\\*Dependencies:\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
  };

  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = phaseText.match(pattern);
    if (match) {
      content[key] = match[1]?.trim() || match[0].trim();
    }
  });

  return content;
}

/**
 * Calculate spark stability (0-3)
 */
function calculateStability(phases) {
  let stability = 0;

  if (phases.spark.status !== 'empty' && Object.keys(phases.spark.content).length > 0) {
    stability++;
  }
  if (phases.design.status !== 'empty' && Object.keys(phases.design.content).length > 0) {
    stability++;
  }
  if (phases.logic.status !== 'empty' && Object.keys(phases.logic.content).length > 0) {
    stability++;
  }

  return stability;
}

/**
 * Generate markdown from spark data
 */
export function generateSparkMarkdown(sparkData) {
  const { name, phases, contributors = {}, markedForDeletion = false } = sparkData;
  const sanitizeField = (value, label) => {
    if (!value) return value;
    const normalized = value.replace(/\r\n/g, '\n').trim();
    const labelPattern = new RegExp(`^\\s*[>*-]?\\s*\\*{0,2}${label}\\*{0,2}\\s*:?\\s*`, 'gmi');
    let cleaned = normalized.replace(labelPattern, '');
    cleaned = cleaned.replace(/^\s*>\s+/gm, '');

    const lines = cleaned
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const deduped = lines.filter((line, index) => index === 0 || line !== lines[index - 1]);

    return deduped.join(' ').trim();
  };

  let markdown = '';

  // If this is the new enhanced template and we have raw content,
  // we can reconstruct it by replacing the title and injecting the phases where appropriate.
  // For a simpler approach, we'll try to just output the standard format but with
  // the phase notes injected, since the new template handles its own formatting inside the Notes.
  // Actually, wait, when a user edits the phase, it just updates phases[key].notes.
  // If we just use the original generator, it will wrap it in "## 🧠 Phase 1: The Spark" etc.
  // Let's modify the generator to cleanly output just the notes if it's the new format,
  // or rather, we can just replace the title in rawContent if it's the completely new template.

  // Let's check if the rawContent exists and seems to be the enhanced template
  if (sparkData.rawContent && sparkData.rawContent.includes('spark_type:')) {
    markdown = sparkData.rawContent.replace(/^title:\s*".*?"/m, `title: "${name}"`);
    // If we want to support full editing of the enhanced template fields, we'd need a more
    // complex parser, but for now, we just let them copy/download the raw text if they haven't 
    // edited via the Phase fields. 
    // If they HAVE edited via the Phase fields (phases.*.notes is dirty), we must drop the rawContent
    // and let the standard generator take over, or inject their notes into the raw content.

    // Quick check: if the user actually typed into the Phase boxes, those notes will differ from the template.
    // For simplicity, we just output the standard format if they used the Phase boxes.
    const isEdited = phases.spark?.notes || phases.design?.notes || phases.logic?.notes;

    if (!isEdited) {
      // Just return the updated raw template
      return markdown;
    }
  }

  markdown = `# ${name}\n\n`;

  // For enhanced sparks, we generate based on granular sections
  if (sparkData.isEnhanced) {
    const contactInfo = contributors.scout ? `*Owner: @${contributors.scout}*\n\n` : '';
    markdown += contactInfo;

    const sections = sparkData.sections || {};
    ENHANCED_SECTION_HEADERS.forEach((header, index) => {
      const sectionNum = index + 1;
      if (sections[sectionNum]) {
        markdown += `${header}\n${sections[sectionNum]}\n\n---\n\n`;
      }
    });

    markdown += `> *Instructions: This is an enhanced spark template. Use the sections above to document the evolution from idea to implementation.*\n`;
    return markdown;
  }

  // Add YAML frontmatter with deletion flag
  if (markedForDeletion) {
    markdown += `---\nstatus: deletion_pending\nmarked_for_deletion: true\n---\n\n`;
    markdown += `> ⚠️ **This spark is marked for deletion.** A pull request to remove this spark has been submitted. To cancel the deletion, close the associated pull request without merging.\n\n`;
  }

  markdown += `---\n\n`;

  // Phase 1: Spark
  markdown += `## 🧠 Phase 1: The Spark (!HUNCH)\n`;
  markdown += `*Status: [${phases.spark.status || 'Active'}]* `;
  markdown += `*Owner: @${contributors.scout || 'YourGitHubHandle'}*\n\n`;

  if (phases.spark.notes) {
    markdown += `${phases.spark.notes.trim()}\n\n`;
  } else if (phases.spark.observation || phases.spark.gap || phases.spark.why) {
    markdown += `### The Observation\n`;
    markdown += `> ${sanitizeField(phases.spark.observation, 'The Observation') || 'Use your intuition here. What is missing?'}\n`;
    markdown += `* **The Gap:** ${sanitizeField(phases.spark.gap, 'The Gap') || '(Describe the gap)'}\n`;
    markdown += `* **The "Why":** ${sanitizeField(phases.spark.why, 'The "Why"') || '(Explain why this matters)'}\n\n`;
  }

  markdown += `---\n\n`;

  // Phase 2: Design
  markdown += `## 🎨 Phase 2: The Design (!SHAPE)\n`;
  markdown += `*Status: [${phases.design.status || 'Pending'}]*\n\n`;

  if (phases.design.notes) {
    markdown += `${phases.design.notes.trim()}\n\n`;
  } else if (phases.design.novel_core || phases.design.blueprint || phases.design.interface) {
    markdown += `### The Novel Core (The 10% Delta)\n`;
    markdown += `* **The Novel Core:** ${sanitizeField(phases.design.novel_core, 'The Novel Core') || '(Describe the 10% delta)'}\n`;
    markdown += `* **The Blueprint:** ${sanitizeField(phases.design.blueprint, 'The Blueprint') || '(Describe the unique design)'}\n`;
    markdown += `* **The Interface:** ${sanitizeField(phases.design.interface, 'The Interface') || '(How does this snap into the ecosystem?)'}\n`;
    markdown += `* **Prior Art:** ${sanitizeField(phases.design.prior_art, 'Prior Art') || '(Why existing solutions don\'t work)'}\n\n`;
  }

  markdown += `---\n\n`;

  // Phase 3: Logic
  markdown += `## 🛠️ Phase 3: The Logic (!BUILD)\n`;
  markdown += `*Status: [${phases.logic.status || 'In-Progress'}]*\n\n`;

  if (phases.logic.notes) {
    markdown += `${phases.logic.notes.trim()}\n\n`;
  } else if (phases.logic.technical_impl || phases.logic.clutch_test || phases.logic.dependencies) {
    markdown += `### Technical Implementation\n`;
    markdown += `* **The Logic:** ${sanitizeField(phases.logic.technical_impl, 'The Logic') || '(Technical documentation or code)'}\n`;
    markdown += `* **Clutch Power Test:** ${sanitizeField(phases.logic.clutch_test, 'Clutch Power Test') || '(Explain verification)'}\n`;
    markdown += `* **Dependencies:** ${sanitizeField(phases.logic.dependencies, 'Dependencies') || '(List dependencies)'}\n\n`;
  }

  markdown += `---\n\n`;

  // Contribution Log
  markdown += `## 📊 Contribution Log (CS Tracker)\n`;
  markdown += `| Phase | Contributor | Action | Reward |\n`;
  markdown += `| :--- | :--- | :--- | :--- |\n`;
  markdown += `| **Spark** | @${contributors.scout || 'user1'} | Merged Build | +5 CS |\n\n`;

  markdown += `---\n\n`;

  // Community Proposals (Section-level contributions from non-owners)
  const proposals = sparkData.proposals || {};
  const sectionNames = {
    1: 'Spark Narrative',
    2: 'Hypothesis Formalization',
    3: 'Simulation / Modeling Plan',
    4: 'Evaluation Strategy',
    5: 'Feedback & Critique',
    6: 'Results',
    7: 'Revision Notes',
    8: 'Next Actions'
  };

  const hasProposals = Object.keys(proposals).some(k => proposals[k]);
  if (hasProposals) {
    markdown += `# 9. Community Proposals\n\n`;
    for (let i = 1; i <= 8; i++) {
      if (proposals[i]) {
        markdown += `## Proposed Changes to Section ${i} (${sectionNames[i]})\n`;
        markdown += `${proposals[i].trim()}\n\n`;
        markdown += `---\n\n`;
      }
    }
    markdown += `> **Proposal Tracking**: Each proposal is tracked with contributor attribution for Echo Bonus (+5 CS) and Validation Bonus (+10 CS) rewards per the Manifesto.\n\n`;
    markdown += `---\n\n`;
  }

  // Instructions
  markdown += `> *Instructions: Start by filling out Phase 1. As the community interacts, update the file via Pull Requests to complete Phase 2 and 3.*\n`;

  return markdown;
}
