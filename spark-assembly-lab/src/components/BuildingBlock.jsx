import { useState } from 'react';
import { Maximize2, Edit3, X } from 'lucide-react';

export default function BuildingBlock({ title, description, icon, color, value, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasContent = value && value.length > 0;

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  return (
    <>
      <div
        className={`block-component border-${color}-500 theme-card ${
          hasContent ? `bg-${color}-900/20` : ''
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
          
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={handleExpand}
              className={`p-1.5 rounded hover:bg-${color}-600/20 transition-colors`}
              title="Expand to full screen"
            >
              <Maximize2 className={`h-4 w-4 ${hasContent ? `text-${color}-400` : 'theme-muted'}`} />
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        {hasContent && (
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs text-${color}-400 flex items-center space-x-1`}>
              <span>✓ Content added</span>
            </span>
            <button
              onClick={handleExpand}
              className={`text-xs text-${color}-400 hover:text-${color}-300 flex items-center space-x-1`}
              title="Edit content"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 theme-overlay backdrop-blur-sm flex items-center justify-center p-4">
          <div className="theme-panel rounded-xl border-2 border-${color}-600 w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className={`bg-${color}-600 px-6 py-4 rounded-t-xl flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <h2 className="text-xl font-bold">{title}</h2>
                  <p className="text-sm opacity-90">{description}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <textarea
                value={value}
                onChange={(e) => onUpdate(e.target.value)}
                placeholder={`Enter ${title.toLowerCase()}...\n\nTip: Use markdown formatting for better structure.`}
                className="w-full h-full theme-input rounded border p-4 text-base focus:outline-none focus:ring-2 focus:ring-${color}-500 font-mono resize-none min-h-[500px]"
                autoFocus
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t theme-border flex justify-between items-center">
              <div className="text-sm theme-muted">
                {value.length} characters
              </div>
              <button
                onClick={handleClose}
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
