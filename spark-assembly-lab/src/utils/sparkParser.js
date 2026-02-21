/**
 * Parse a Spark markdown file
 * Note: Simplified parser for browser compatibility
 */
export function parseSparkFile(content) {
  console.log('🔍 Parsing spark file, content length:', content.length);

  // Extract spark name - support multiple formats
  let name = 'Untitled Spark';

  // Try YAML frontmatter first
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const yaml = frontmatterMatch[1];
    const nameFieldMatch = yaml.match(/^name:\s*(.+)$/m);
    if (nameFieldMatch) {
      name = nameFieldMatch[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  // If no name in frontmatter, try the first H1 heading
  const lines = content.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('#')) {
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

  const result = {
    name,
    frontmatter: {},
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
      scout: spark.contributor || '',
      designer: design.contributor || '',
      builder: logic.contributor || '',
    },
    stability,
  };

  console.log('✅ Parsed result:', result);
  return result;
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

export function buildMissionSummary(parsedSpark) {
  const spark = parsedSpark?.phases?.spark || {};
  const design = parsedSpark?.phases?.design || {};
  const logic = parsedSpark?.phases?.logic || {};

  const checks = {
    spark_complete: Boolean(spark.gap && spark.why),
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
      role: 'Scout',
      reward: '+5 CS',
    });
  }
  if (parsedSpark?.contributors?.designer) {
    meritPlan.push({
      handle: `@${parsedSpark.contributors.designer}`,
      role: 'Designer',
      reward: status === 'GREEN' ? '+15 CS (+5 Echo bonus)' : '+15 CS',
    });
  }
  if (parsedSpark?.contributors?.builder) {
    meritPlan.push({
      handle: `@${parsedSpark.contributors.builder}`,
      role: 'Builder',
      reward: status === 'GREEN' ? '+25 CS (+10 Prototype bonus)' : '+25 CS',
    });
  }

  return {
    status,
    recommendation,
    scribe_report: scribeReport,
    critical_flaws: criticalFlaws,
    checks,
    merit_plan: meritPlan,
  };
}

export function validateSparkData(sparkData) {
  const errors = [];
  const name = (sparkData?.name || '').trim();
  const contributors = sparkData?.contributors || {};
  const phases = sparkData?.phases || {};

  const handlePattern = /^[A-Za-z0-9-]+$/;

  if (!name) {
    errors.push('Spark name is required');
  }

  if (!contributors.scout || !handlePattern.test(contributors.scout)) {
    errors.push('Spark requires a valid scout handle');
  }
  // Designer and builder handles are optional for partial sparks
  if (contributors.designer && !handlePattern.test(contributors.designer)) {
    errors.push('Designer handle must be valid');
  }
  if (contributors.builder && !handlePattern.test(contributors.builder)) {
    errors.push('Builder handle must be valid');
  }

  const spark = phases.spark || {};
  const design = phases.design || {};
  const logic = phases.logic || {};

  // Only require Spark to have at least some content (not completely empty)
  const hasSparkContent = spark.notes || spark.observation || spark.gap || spark.why;
  if (!hasSparkContent) {
    errors.push('Spark must include at least observation, gap, or why');
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

  const blockTerminator = '\\n\\s*(?:\\*\\*|###|##|---|$)';

  // Common patterns
  const patterns = {
    observation: new RegExp(`(?:###\\s*The Observation|\\*\\*The Observation:?\\*\\*)\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    gap: new RegExp(`\\*\\*The Gap:\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    why: new RegExp(`\\*\\*The "Why":\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    novel_core: new RegExp(`(?:###\\s*The Novel Core[^\\n]*|\\*\\*The Novel Core:?\\*\\*)\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    blueprint: new RegExp(`\\*\\*The Blueprint:\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    interface: new RegExp(`\\*\\*The Interface:\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    prior_art: new RegExp(`\\*\\*Prior Art:\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    technical_impl: new RegExp(`(?:###\\s*Technical Implementation|\\*\\*Technical Specs[^:]*:\\*\\*|\\*\\*The Logic:\\*\\*)\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    clutch_test: new RegExp(`\\*\\*Clutch Power Test:\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
    dependencies: new RegExp(`\\*\\*Dependencies:\\*\\*\\s*([\\s\\S]*?)(?=${blockTerminator})`),
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
  const { name, phases, contributors = {} } = sparkData;
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

  let markdown = `# ${name}\n\n---\n\n`;

  // Phase 1: Spark
  markdown += `## 🧠 Phase 1: The Spark (!HUNCH)\n`;
  markdown += `*Status: [${phases.spark.status || 'Active'}]* `;
  markdown += `*Scout: @${contributors.scout || 'YourGitHubHandle'}*\n\n`;

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
  markdown += `*Status: [${phases.design.status || 'Pending'}]* `;
  markdown += `*Designer: @${contributors.designer || 'Handle'}*\n\n`;

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
  markdown += `*Status: [${phases.logic.status || 'In-Progress'}]* `;
  markdown += `*Builder: @${contributors.builder || 'Handle'}*\n\n`;

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
  markdown += `| **Spark** | @${contributors.scout || 'user1'} | Submitted Hunch | +5 CS |\n`;
  markdown += `| **Design** | @${contributors.designer || 'user2'} | Designed Shape | +15 CS (+5 Echo) |\n`;
  markdown += `| **Logic** | @${contributors.builder || 'user3'} | Merged Build | +25 CS (+10 Prototype) |\n\n`;

  markdown += `---\n`;
  markdown += `> *Instructions: Start by filling out Phase 1. As the community interacts, update the file via Pull Requests to complete Phase 2 and 3.*\n`;

  return markdown;
}
