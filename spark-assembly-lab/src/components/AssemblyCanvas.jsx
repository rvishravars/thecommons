import { useState } from 'react';
import { Download, Copy, Eye, Brain } from 'lucide-react';
import PhaseLane from './PhaseLane';
import MarkdownPreview from './MarkdownPreview';
import QuizModal from './QuizModal';
import { PhaseTypes } from '../types/spark';
import { generateSparkMarkdown } from '../utils/sparkParser';
import { useToast } from '../utils/ToastContext';

export default function AssemblyCanvas({ sparkData, onSparkUpdate }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const toast = useToast();

  const handleBlockUpdate = (phase, blockType, value) => {
    const updatedData = {
      ...sparkData,
      phases: {
        ...sparkData.phases,
        [phase]: {
          ...sparkData.phases[phase],
          [blockType]: value,
        },
      },
    };
    onSparkUpdate(updatedData);
  };

  const handleDownload = () => {
    const md = generateSparkMarkdown(sparkData);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sparkData.name.toLowerCase().replace(/\s+/g, '-')}.spark.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Spark downloaded successfully!');
  };

  const handleCopyToClipboard = () => {
    const md = generateSparkMarkdown(sparkData);
    navigator.clipboard.writeText(md).then(
      () => toast.success('Markdown copied to clipboard!'),
      () => toast.error('Failed to copy to clipboard')
    );
  };

  const calculateStability = () => {
    let count = 0;
    if (sparkData.phases.intuition.observation || sparkData.phases.intuition.gap) count++;
    if (sparkData.phases.imagination.blueprint || sparkData.phases.imagination.novel_core) count++;
    if (sparkData.phases.logic.technical_impl) count++;
    return count;
  };

  const stability = calculateStability();

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b theme-border theme-surface px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={sparkData.name}
              onChange={(e) => onSparkUpdate({ ...sparkData, name: e.target.value })}
              className="text-xl sm:text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-imagination-500 rounded px-2 -ml-2 w-full"
              placeholder="Spark Name"
            />
            <div className="mt-1 flex items-center space-x-2">
              <span
                className={`inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold ${
                  stability === 0
                    ? 'bg-red-600'
                    : stability === 1
                    ? 'bg-intuition-600'
                    : stability === 2
                    ? 'bg-imagination-600'
                    : 'bg-logic-600'
                }`}
              >
                {stability}/3 Stable
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowQuiz(true)}
              className="flex items-center space-x-1 sm:space-x-2 rounded-lg bg-imagination-500 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-imagination-600 transition-colors"
            >
              <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Quiz Me</span>
              <span className="sm:hidden">Quiz</span>
            </button>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-1 sm:space-x-2 rounded-lg theme-button px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{showPreview ? 'Edit' : 'Preview'}</span>
            </button>
            
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center space-x-1 sm:space-x-2 rounded-lg theme-button px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Copy MD</span>
              <span className="sm:hidden">Copy</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 sm:space-x-2 rounded-lg bg-imagination-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-imagination-700 transition-colors"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assembly Area */}
      {showPreview ? (
        <MarkdownPreview markdown={generateSparkMarkdown(sparkData)} />
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="h-full flex flex-col lg:flex-row p-4 sm:p-6 gap-4 sm:gap-6 min-w-full">
            {/* Intuition Lane */}
            <PhaseLane
              phase={PhaseTypes.INTUITION}
              title="🧠 Intuition (Scout)"
              description="Identify the gap"
              color="intuition"
              data={sparkData.phases.intuition}
              contributor={sparkData.contributors.scout}
              onUpdate={(blockType, value) => handleBlockUpdate('intuition', blockType, value)}
              onContributorUpdate={(value) =>
                onSparkUpdate({
                  ...sparkData,
                  contributors: { ...sparkData.contributors, scout: value },
                })
              }
            />

            {/* Imagination Lane */}
            <PhaseLane
              phase={PhaseTypes.IMAGINATION}
              title="🎨 Imagination (Designer)"
              description="Design the solution"
              color="imagination"
              data={sparkData.phases.imagination}
              contributor={sparkData.contributors.designer}
              onUpdate={(blockType, value) => handleBlockUpdate('imagination', blockType, value)}
              onContributorUpdate={(value) =>
                onSparkUpdate({
                  ...sparkData,
                  contributors: { ...sparkData.contributors, designer: value },
                })
              }
            />

            {/* Logic Lane */}
            <PhaseLane
              phase={PhaseTypes.LOGIC}
              title="🛠️ Logic (Builder)"
              description="Build and test"
              color="logic"
              data={sparkData.phases.logic}
              contributor={sparkData.contributors.builder}
              onUpdate={(blockType, value) => handleBlockUpdate('logic', blockType, value)}
              onContributorUpdate={(value) =>
                onSparkUpdate({
                  ...sparkData,
                  contributors: { ...sparkData.contributors, builder: value },
                })
              }
            />
          </div>
        </div>
      )}
      
      {/* Quiz Modal */}
      {showQuiz && <QuizModal sparkData={sparkData} onClose={() => setShowQuiz(false)} />}
    </div>
  );
}
