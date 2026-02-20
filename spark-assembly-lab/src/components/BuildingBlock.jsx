import { useEffect, useState } from 'react';
import { Edit3, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BuildingBlock({ title, description, icon, color, value, onUpdate, onDone, isReadOnly }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draftValue, setDraftValue] = useState(value || '');

  const hasContent = value && value.length > 0;

  const handleExpand = () => {
    setDraftValue(value || '');
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  const handleDone = () => {
    if (onUpdate && draftValue !== value) {
      onUpdate(draftValue);
    }
    if (onDone) {
      onDone();
    }
    setIsExpanded(false);
  };

  useEffect(() => {
    if (!isExpanded) {
      setDraftValue(value || '');
    }
  }, [value, isExpanded]);

  return (
    <>
      <div
        className={`block-component border-${color}-500 theme-card ${hasContent ? `bg-${color}-900/20` : ''
          }`}
      >
        {/* Block Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex-1 flex items-center space-x-2">
            <span className="text-xl">{icon}</span>
            <div>
              <h4 className="font-semibold text-sm">{title}</h4>
              <p className="text-xs theme-muted mt-0.5">{description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 ml-2" />
        </div>

        {/* Content Preview (Rendered Markdown) */}
        {hasContent && (
          <div className="mt-3 px-1 py-1 overflow-hidden">
            <div className="prose prose-invert prose-xs max-w-none theme-text line-clamp-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="mt-2 flex items-center justify-between">
          {!hasContent && (
            <span className={`text-xs text-${color}-300`}>Add your spark here. Make it snap.</span>
          )}
          <button
            onClick={isReadOnly ? undefined : handleExpand}
            className={`text-xs text-${color}-400 hover:text-${color}-300 flex items-center space-x-1 ${!hasContent ? '' : 'ml-auto'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isReadOnly ? 'Login to edit' : 'Edit content'}
            disabled={isReadOnly}
          >
            <Edit3 className="h-3 w-3" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Full Screen Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 theme-overlay backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className={`theme-panel rounded-xl border-2 border-${color}-600 w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl`}>
            {/* Modal Header */}
            <div className={`bg-${color}-600 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl flex items-center justify-between`}>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <span className="text-xl sm:text-2xl flex-shrink-0">{icon}</span>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl font-bold truncate">{title}</h2>
                  <p className="text-xs sm:text-sm opacity-90 truncate">{description}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                title="Close"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              <textarea
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                placeholder={`Enter ${title.toLowerCase()}...\n\nTip: Use markdown formatting for better structure.`}
                className={`w-full h-full theme-input rounded border p-3 sm:p-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-${color}-500 font-mono resize-none min-h-[400px] sm:min-h-[500px]`}
                autoFocus
              />
            </div>

            {/* Modal Footer */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t theme-border flex justify-between items-center">
              <div className="text-xs sm:text-sm theme-muted">
                {draftValue.length} characters
              </div>
              <button
                onClick={handleDone}
                className={`px-4 py-2 bg-${color}-600 hover:bg-${color}-700 rounded-lg font-semibold transition-colors`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
