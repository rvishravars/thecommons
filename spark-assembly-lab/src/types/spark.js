// Types for the Spark Assembly Lab

export const PhaseTypes = {
  SPARK: 'spark',
  DESIGN: 'design',
  LOGIC: 'logic',
};

export const BlockStatus = {
  EMPTY: 'empty',
  PARTIAL: 'partial',
  COMPLETE: 'complete',
};

export const SparkStatus = {
  ACTIVE: 'Active',
  CLAIMED: 'Claimed',
  PENDING: 'Pending',
  DESIGNED: 'Designed',
  IN_PROGRESS: 'In-Progress',
  MERGED: 'Merged',
  DELETION_PENDING: 'Deletion Pending',
};

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

// Block type definitions
export const BlockTypes = {
  // Spark blocks
  OBSERVATION: 'observation',
  GAP: 'gap',
  WHY: 'why',
  
  // Design blocks
  NOVEL_CORE: 'novel_core',
  BLUEPRINT: 'blueprint',
  INTERFACE: 'interface',
  PRIOR_ART: 'prior_art',
  
  // Logic blocks
  TECHNICAL_IMPL: 'technical_impl',
  CLUTCH_TEST: 'clutch_test',
  DEPENDENCIES: 'dependencies',
};

export const BlockMetadata = {
  [BlockTypes.OBSERVATION]: {
    title: 'The Observation',
    description: 'What is missing? What feels "off"?',
    phase: PhaseTypes.SPARK,
    color: 'spark',
    icon: '👁️',
  },
  [BlockTypes.GAP]: {
    title: 'The Gap',
    description: 'Identify the specific problem',
    phase: PhaseTypes.SPARK,
    color: 'spark',
    icon: '🔍',
  },
  [BlockTypes.WHY]: {
    title: 'The "Why"',
    description: 'Explain why this matters',
    phase: PhaseTypes.SPARK,
    color: 'spark',
    icon: '❓',
  },
  [BlockTypes.NOVEL_CORE]: {
    title: 'The Novel Core',
    description: 'The 10% Delta - what makes this unique',
    phase: PhaseTypes.DESIGN,
    color: 'design',
    icon: '💡',
  },
  [BlockTypes.BLUEPRINT]: {
    title: 'The Blueprint',
    description: 'Describe the unique design',
    phase: PhaseTypes.DESIGN,
    color: 'design',
    icon: '📐',
  },
  [BlockTypes.INTERFACE]: {
    title: 'The Interface',
    description: 'How does this snap into the ecosystem?',
    phase: PhaseTypes.DESIGN,
    color: 'design',
    icon: '🔗',
  },
  [BlockTypes.PRIOR_ART]: {
    title: 'Prior Art',
    description: 'Why existing solutions don\'t work',
    phase: PhaseTypes.DESIGN,
    color: 'design',
    icon: '📚',
  },
  [BlockTypes.TECHNICAL_IMPL]: {
    title: 'Technical Implementation',
    description: 'The actual code/logic',
    phase: PhaseTypes.LOGIC,
    color: 'logic',
    icon: '⚙️',
  },
  [BlockTypes.CLUTCH_TEST]: {
    title: 'Clutch Power Test',
    description: 'Verify compatibility and stability',
    phase: PhaseTypes.LOGIC,
    color: 'logic',
    icon: '🧪',
  },
  [BlockTypes.DEPENDENCIES]: {
    title: 'Dependencies',
    description: 'Required sparks or libraries',
    phase: PhaseTypes.LOGIC,
    color: 'logic',
    icon: '📦',
  },
};
