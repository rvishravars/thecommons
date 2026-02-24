import { useState, useEffect } from 'react';
import { Github, Search, GitBranch } from 'lucide-react';
import { fetchBranches } from '../utils/github';

export default function RepoInput({ onRepoChange, currentRepo, currentBranch, onBranchChange }) {
  const [repoUrl, setRepoUrl] = useState(currentRepo || '');
  const [isEditing, setIsEditing] = useState(false);
  const [branches, setBranches] = useState(['main']);
  const [selectedBranch, setSelectedBranch] = useState(currentBranch || 'main');
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Load branches when repo changes
  useEffect(() => {
    if (currentRepo) {
      loadBranchesForRepo(currentRepo);
    }
  }, [currentRepo]);

  const loadBranchesForRepo = async (repo) => {
    setLoadingBranches(true);
    const result = await fetchBranches(repo);
    if (result.success) {
      setBranches(result.branches);
      if (!currentBranch && result.defaultBranch) {
        setSelectedBranch(result.defaultBranch);
        onBranchChange?.(result.defaultBranch);
      }
    } else {
      setBranches(['main']);
      setSelectedBranch('main');
    }
    setLoadingBranches(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onRepoChange(repoUrl.trim());
      setIsEditing(false);
      loadBranchesForRepo(repoUrl.trim());
    }
  };

  const handleBranchChange = (e) => {
    const newBranch = e.target.value;
    setSelectedBranch(newBranch);
    onBranchChange?.(newBranch);
  };

  return (
    <div className="p-4 border-b theme-border theme-surface-elevated">
      <div className="mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider theme-muted block mb-2">
          Git Repository
        </label>
      </div>

      {!isEditing && currentRepo ? (
        <div className="space-y-3">
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
          
          {/* Branch Selector */}
          <div className="flex items-center space-x-2">
            <GitBranch className="h-3.5 w-3.5 theme-muted flex-shrink-0" />
            <select
              value={selectedBranch}
              onChange={handleBranchChange}
              disabled={loadingBranches}
              className="flex-1 px-2 py-1 text-xs rounded theme-input focus:outline-none focus:ring-1 focus:ring-design-500 truncate max-w-[180px]"
              title={`Branch: ${selectedBranch}`}
            >
              {branches.map(branch => (
                <option key={branch} value={branch} title={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo or owner/repo"
              className="flex-1 px-3 py-2 text-sm rounded-lg theme-input focus:outline-none focus:ring-2 focus:ring-design-500"
              autoFocus
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-design-600 hover:bg-design-700 transition-colors"
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
