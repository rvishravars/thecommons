import { useState } from 'react';
import { Github, Search } from 'lucide-react';

export default function RepoInput({ onRepoChange, currentRepo }) {
  const [repoUrl, setRepoUrl] = useState(currentRepo || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onRepoChange(repoUrl.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="p-4 border-b theme-border theme-surface-elevated">
      <div className="mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider theme-muted block mb-2">
          Git Repository
        </label>
      </div>

      {!isEditing && currentRepo ? (
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Github className="h-4 w-4 theme-muted flex-shrink-0" />
            <span className="text-sm theme-text truncate">{currentRepo}</span>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs px-2 py-1 rounded theme-muted-hover transition-colors"
          >
            Change
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo or owner/repo"
              className="flex-1 px-3 py-2 text-sm rounded-lg theme-input focus:outline-none focus:ring-2 focus:ring-imagination-500"
              autoFocus
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-imagination-600 hover:bg-imagination-700 transition-colors"
              title="Load Sparks"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs theme-subtle">
            Enter a GitHub repository URL or owner/repo format
          </p>
        </form>
      )}
    </div>
  );
}
