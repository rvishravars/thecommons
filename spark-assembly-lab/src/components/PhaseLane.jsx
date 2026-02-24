import { User } from 'lucide-react';
import BuildingBlock from './BuildingBlock';
import { BlockTypes, BlockMetadata, PhaseTypes } from '../types/spark';

export default function PhaseLane({ phase, title, description, color, data, contributor, onUpdate, onEditDone }) {
  // Define which blocks belong to this phase
  const getBlocksForPhase = () => {
    switch (phase) {
      case PhaseTypes.SPARK:
        return [BlockTypes.OBSERVATION, BlockTypes.GAP, BlockTypes.WHY];
      case PhaseTypes.DESIGN:
        return [BlockTypes.NOVEL_CORE, BlockTypes.BLUEPRINT, BlockTypes.INTERFACE, BlockTypes.PRIOR_ART];
      case PhaseTypes.LOGIC:
        return [BlockTypes.TECHNICAL_IMPL, BlockTypes.CLUTCH_TEST, BlockTypes.DEPENDENCIES];
      default:
        return [];
    }
  };

  const blocks = getBlocksForPhase();

  return (
    <div className={`flex-1 min-w-[280px] lg:min-w-[320px] flex flex-col rounded-xl border-2 border-${color}-600 theme-panel-soft`}>
      {/* Lane Header */}
      <div className={`bg-${color}-600 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl`}>
        <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
        <p className="text-xs sm:text-sm mt-1 opacity-90">{description}</p>
        
        <div className="mt-3 flex items-center space-x-2">
          <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <input
            type="text"
            value={contributor || ''}
            readOnly
            placeholder="@github-handle"
            className="flex-1 phase-input rounded px-2 py-1 text-xs sm:text-sm bg-black/20 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Building Blocks */}
      <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto">
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
              onDone={onEditDone}
            />
          );
        })}
      </div>

      {/* CS Reward Display */}
      <div className={`bg-${color}-700/30 px-4 sm:px-6 py-2 sm:py-3 rounded-b-xl border-t border-${color}-600/50`}>
        <div className="text-xs sm:text-sm font-semibold">
          <span className="theme-muted">Reward: </span>
          <span className={`text-${color}-400`}>
            {phase === PhaseTypes.SPARK && '+5 CS'}
            {phase === PhaseTypes.DESIGN && '+15 CS (+5 Echo)'}
            {phase === PhaseTypes.LOGIC && '+25 CS (+10 Prototype)'}
          </span>
        </div>
      </div>
    </div>
  );
}
