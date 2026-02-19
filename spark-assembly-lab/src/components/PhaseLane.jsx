import { User } from 'lucide-react';
import BuildingBlock from './BuildingBlock';
import { BlockTypes, BlockMetadata, PhaseTypes } from '../types/spark';

export default function PhaseLane({ phase, title, description, color, data, contributor, onUpdate, onContributorUpdate }) {
  // Define which blocks belong to this phase
  const getBlocksForPhase = () => {
    switch (phase) {
      case PhaseTypes.INTUITION:
        return [BlockTypes.OBSERVATION, BlockTypes.GAP, BlockTypes.WHY];
      case PhaseTypes.IMAGINATION:
        return [BlockTypes.NOVEL_CORE, BlockTypes.BLUEPRINT, BlockTypes.INTERFACE, BlockTypes.PRIOR_ART];
      case PhaseTypes.LOGIC:
        return [BlockTypes.TECHNICAL_IMPL, BlockTypes.CLUTCH_TEST, BlockTypes.DEPENDENCIES];
      default:
        return [];
    }
  };

  const blocks = getBlocksForPhase();

  return (
    <div className={`flex-1 min-w-[320px] flex flex-col rounded-xl border-2 border-${color}-600 theme-panel-soft`}>
      {/* Lane Header */}
      <div className={`bg-${color}-600 px-6 py-4 rounded-t-xl`}>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm mt-1 opacity-90">{description}</p>
        
        <div className="mt-3 flex items-center space-x-2">
          <User className="h-4 w-4" />
          <input
            type="text"
            value={contributor || ''}
            onChange={(e) => onContributorUpdate(e.target.value)}
            placeholder="@github-handle"
            className="flex-1 phase-input rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Building Blocks */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {blocks.map((blockType) => {
          const metadata = BlockMetadata[blockType];
          return (
            <BuildingBlock
              key={blockType}
              type={blockType}
              title={metadata.title}
              description={metadata.description}
              icon={metadata.icon}
              color={color}
              value={data[blockType] || ''}
              onUpdate={(value) => onUpdate(blockType, value)}
            />
          );
        })}
      </div>

      {/* CS Reward Display */}
      <div className={`bg-${color}-700/30 px-6 py-3 rounded-b-xl border-t border-${color}-600/50`}>
        <div className="text-sm font-semibold">
          <span className="theme-muted">Reward: </span>
          <span className={`text-${color}-400`}>
            {phase === PhaseTypes.INTUITION && '+5 CS'}
            {phase === PhaseTypes.IMAGINATION && '+15 CS (+5 Echo)'}
            {phase === PhaseTypes.LOGIC && '+25 CS (+10 Prototype)'}
          </span>
        </div>
      </div>
    </div>
  );
}
