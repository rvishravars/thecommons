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

  // If no name in frontmatter, try title formats
  if (name === 'Untitled Spark') {
    // Try formats: # [emoji] Spark [Template]: [name]
    const titleMatch = content.match(/^# .*?Spark.*?:? +(.+)$/m);
    if (titleMatch) {
      name = titleMatch[1].trim();
    }
  }

  console.log('📝 Spark name:', name);

  // Parse Phase 1: Intuition
  const intuition = extractPhase(content, '## 🧠 Phase 1: The Intuition');
  console.log('🧠 Intuition phase:', intuition);

  // Parse Phase 2: Imagination
  const imagination = extractPhase(content, '## 🎨 Phase 2: The Imagination');
  console.log('🎨 Imagination phase:', imagination);

  // Parse Phase 3: Logic
  const logic = extractPhase(content, '## 🛠️ Phase 3: The Logic');
  console.log('🛠️ Logic phase:', logic);

  const stability = calculateStability({ intuition, imagination, logic });
  console.log('📊 Stability:', stability);

  const result = {
    name,
    frontmatter: {},
    phases: {
      intuition: {
        status: intuition.status,
        observation: intuition.content.observation || '',
        gap: intuition.content.gap || '',
        why: intuition.content.why || '',
      },
      imagination: {
        status: imagination.status,
        novel_core: imagination.content.novel_core || '',
        blueprint: imagination.content.blueprint || '',
        interface: imagination.content.interface || '',
        prior_art: imagination.content.prior_art || '',
      },
      logic: {
        status: logic.status,
        technical_impl: logic.content.technical_impl || '',
        clutch_test: logic.content.clutch_test || '',
        dependencies: logic.content.dependencies || '',
      },
    },
    contributors: {
      scout: intuition.contributor || '',
      designer: imagination.contributor || '',
      builder: logic.contributor || '',
    },
    stability,
  };

  console.log('✅ Parsed result:', result);
  return result;
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

  if (phases.intuition.status !== 'empty' && Object.keys(phases.intuition.content).length > 0) {
    stability++;
  }
  if (phases.imagination.status !== 'empty' && Object.keys(phases.imagination.content).length > 0) {
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

  let markdown = `# 🧩 Spark Template: ${name}\n\n---\n\n`;

  // Phase 1: Intuition
  markdown += `## 🧠 Phase 1: The Intuition (!HUNCH)\n`;
  markdown += `*Status: [${phases.intuition.status || 'Active'}]* `;
  markdown += `*Scout: @${contributors.scout || 'YourGitHubHandle'}*\n\n`;

  if (phases.intuition.observation || phases.intuition.gap || phases.intuition.why) {
    markdown += `### The Observation\n`;
    markdown += `> ${phases.intuition.observation || 'Use your intuition here. What is missing?'}\n`;
    markdown += `* **The Gap:** ${phases.intuition.gap || '(Describe the gap)'}\n`;
    markdown += `* **The "Why":** ${phases.intuition.why || '(Explain why this matters)'}\n\n`;
  }

  markdown += `---\n\n`;

  // Phase 2: Imagination
  markdown += `## 🎨 Phase 2: The Imagination (!SHAPE)\n`;
  markdown += `*Status: [${phases.imagination.status || 'Pending'}]* `;
  markdown += `*Designer: @${contributors.designer || 'Handle'}*\n\n`;

  if (phases.imagination.novel_core || phases.imagination.blueprint || phases.imagination.interface) {
    markdown += `### The Novel Core (The 10% Delta)\n`;
    markdown += `* **The Blueprint:** ${phases.imagination.blueprint || '(Describe the unique design)'}\n`;
    markdown += `* **The Interface:** ${phases.imagination.interface || '(How does this snap into the ecosystem?)'}\n`;
    markdown += `* **Prior Art:** ${phases.imagination.prior_art || '(Why existing solutions don\'t work)'}\n\n`;
  }

  markdown += `---\n\n`;

  // Phase 3: Logic
  markdown += `## 🛠️ Phase 3: The Logic (!BUILD)\n`;
  markdown += `*Status: [${phases.logic.status || 'In-Progress'}]* `;
  markdown += `*Builder: @${contributors.builder || 'Handle'}*\n\n`;

  if (phases.logic.technical_impl || phases.logic.clutch_test || phases.logic.dependencies) {
    markdown += `### Technical Implementation\n`;
    markdown += `* **The Logic:** ${phases.logic.technical_impl || '(Technical documentation or code)'}\n`;
    markdown += `* **Clutch Power Test:** ${phases.logic.clutch_test || '(Explain verification)'}\n`;
    markdown += `* **Dependencies:** ${phases.logic.dependencies || '(List dependencies)'}\n\n`;
  }

  markdown += `---\n\n`;

  // Contribution Log
  markdown += `## 📊 Contribution Log (CS Tracker)\n`;
  markdown += `| Phase | Contributor | Action | Reward |\n`;
  markdown += `| :--- | :--- | :--- | :--- |\n`;
  markdown += `| **Intuition** | @${contributors.scout || 'user1'} | Submitted Hunch | +5 CS |\n`;
  markdown += `| **Imagination** | @${contributors.designer || 'user2'} | Designed Shape | +15 CS (+5 Echo) |\n`;
  markdown += `| **Logic** | @${contributors.builder || 'user3'} | Merged Build | +25 CS (+10 Prototype) |\n\n`;

  markdown += `---\n`;
  markdown += `> *Instructions: Start by filling out Phase 1. As the community interacts, update the file via Pull Requests to complete Phase 2 and 3.*\n`;

  return markdown;
}
