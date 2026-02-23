import { useState, useEffect } from 'react';
import { GitPullRequest, ChevronDown, ChevronUp, Code2, Plus, Minus, AlertCircle } from 'lucide-react';
import { fetchOpenPullRequests, fetchPRFiles, fetchPRDiff, parseRepoUrl } from '../utils/github';

export default function PRTracker({ repoUrl, sparkFile, user }) {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPR, setSelectedPR] = useState(null);
  const [prFiles, setPrFiles] = useState({});
  const [expandedDiffs, setExpandedDiffs] = useState({});

  useEffect(() => {
    if (!repoUrl || !sparkFile) return;
    loadPRs();
  }, [repoUrl, sparkFile]);

  const loadPRs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { owner, repo } = parseRepoUrl(repoUrl);
      const allPRs = await fetchOpenPullRequests(owner, repo);
      
      // Filter PRs that might affect this spark
      const sparkName = sparkFile.replace('.spark.md', '');
      const relevantPRs = allPRs.filter(pr => 
        pr.title.toLowerCase().includes(sparkName.toLowerCase()) ||
        (pr.body && pr.body.toLowerCase().includes(sparkName.toLowerCase()))
      );
      
      setPrs(relevantPRs);
      
      if (relevantPRs.length === 0) {
        setError('No open pull requests found for this spark');
      }
    } catch (err) {
      setError(err.message || 'Failed to load pull requests');
      console.error('Error loading PRs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPRDetails = async (pr) => {
    if (prFiles[pr.number]) {
      setSelectedPR(selectedPR?.number === pr.number ? null : pr);
      return;
    }

    try {
      const { owner, repo } = parseRepoUrl(repoUrl);
      const files = await fetchPRFiles(owner, repo, pr.number);
      
      // Filter for spark files
      const sparkFiles = files.filter(f => f.filename.endsWith('.spark.md'));
      
      setPrFiles(prev => ({
        ...prev,
        [pr.number]: sparkFiles,
      }));
      
      setSelectedPR(selectedPR?.number === pr.number ? null : pr);
    } catch (err) {
      console.error(`Error loading PR #${pr.number} details:`, err);
    }
  };

  const toggleDiffExpand = async (prNumber, fileIndex) => {
    const key = `${prNumber}-${fileIndex}`;
    
    if (expandedDiffs[key]) {
      setExpandedDiffs(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    } else {
      setExpandedDiffs(prev => ({
        ...prev,
        [key]: true,
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatsBadgeColor = (stat) => {
    if (stat.status === 'added') return 'bg-logic-100 border-logic-600 text-logic-900';
    if (stat.status === 'removed') return 'bg-red-100 border-red-600 text-red-900';
    if (stat.status === 'modified') return 'bg-design-100 border-design-600 text-design-900';
    return 'bg-gray-100 border-gray-600 text-gray-900';
  };

  if (!user) {
    return (
      <div className="theme-panel rounded-lg p-6 border-2 border-spark-600 text-center">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm opacity-75">Login with GitHub to view pull requests</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="theme-panel rounded-lg p-6 border-2 border-spark-600 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-spark-600 border-t-transparent"></div>
        <p className="text-sm mt-3 opacity-75">Loading pull requests...</p>
      </div>
    );
  }

  return (
    <div className="theme-panel rounded-lg border-2 border-spark-600 overflow-hidden">
      {/* Header */}
      <div className="bg-spark-600 px-4 py-3 flex items-center gap-2">
        <GitPullRequest className="h-5 w-5" />
        <h3 className="font-semibold">Spark Evolution</h3>
        <span className="ml-auto inline-block bg-white/20 px-2 py-0.5 rounded text-xs font-semibold">
          {prs.length} Open
        </span>
      </div>

      {/* Content */}
      <div className="divide-y divide-border-200/30">
        {error && !prs.length && (
          <div className="p-4 text-center">
            <p className="text-sm opacity-70">{error}</p>
            <button
              onClick={loadPRs}
              className="mt-3 text-xs px-3 py-1 bg-spark-600 hover:bg-spark-700 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {prs.length === 0 && !error && (
          <div className="p-4 text-center opacity-60">
            <p className="text-sm">No pull requests found</p>
          </div>
        )}

        {prs.map((pr) => (
          <div key={pr.number} className="hover:bg-white/5 transition-colors">
            {/* PR Summary */}
            <button
              onClick={() => loadPRDetails(pr)}
              className="w-full p-4 text-left hover:bg-white/5 transition-colors flex items-start gap-3 group"
            >
              <GitPullRequest className="h-5 w-5 text-spark-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate group-hover:text-spark-400 transition-colors">
                  <span className="text-xs opacity-60 mr-2">#{pr.number}</span>
                  {pr.title}
                </h4>
                <div className="flex flex-wrap gap-2 mt-2 text-xs opacity-70">
                  <span>{pr.user.login}</span>
                  <span>•</span>
                  <span>{formatDate(pr.created_at)}</span>
                  <span>•</span>
                  <span>{pr.additions} additions</span>
                  <span className="text-red-500">{pr.deletions} deletions</span>
                </div>
              </div>

              <div className="flex-shrink-0">
                {selectedPR?.number === pr.number ? (
                  <ChevronUp className="h-5 w-5 opacity-60" />
                ) : (
                  <ChevronDown className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                )}
              </div>
            </button>

            {/* PR Details */}
            {selectedPR?.number === pr.number && (
              <div className="bg-white/5 border-t border-white/10 p-4 space-y-3">
                {/* PR Description */}
                {pr.body && (
                  <div className="text-xs space-y-2">
                    <p className="font-semibold opacity-80">Description</p>
                    <p className="opacity-60 whitespace-pre-wrap line-clamp-3">{pr.body}</p>
                  </div>
                )}

                {/* Affected Files */}
                {prFiles[pr.number] && prFiles[pr.number].length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold opacity-80">
                      Spark Files Changed: {prFiles[pr.number].length}
                    </p>
                    {prFiles[pr.number].map((file, idx) => (
                      <div key={idx} className="bg-white/5 rounded border border-white/10 overflow-hidden">
                        {/* File Header */}
                        <button
                          onClick={() => toggleDiffExpand(pr.number, idx)}
                          className="w-full p-3 flex items-center gap-2 hover:bg-white/10 transition-colors text-xs"
                        >
                          <Code2 className="h-4 w-4 opacity-60" />
                          <span className="flex-1 font-mono truncate">{file.filename}</span>
                          
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Plus className="h-3 w-3 text-logic-600" />
                              <span className="text-logic-600 font-semibold">{file.additions}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Minus className="h-3 w-3 text-red-600" />
                              <span className="text-red-600 font-semibold">{file.deletions}</span>
                            </span>
                          </div>

                          {expandedDiffs[`${pr.number}-${idx}`] ? (
                            <ChevronUp className="h-4 w-4 opacity-60" />
                          ) : (
                            <ChevronDown className="h-4 w-4 opacity-60" />
                          )}
                        </button>

                        {/* Diff Patch (Simplified) */}
                        {expandedDiffs[`${pr.number}-${idx}`] && (
                          <div className="border-t border-white/10 p-3 bg-black/20 font-mono text-xs max-h-64 overflow-y-auto">
                            {file.patch ? (
                              <pre className="whitespace-pre-wrap break-words text-xs">
                                {file.patch
                                  .split('\n')
                                  .slice(0, 20) // Show first 20 lines
                                  .map((line, i) => {
                                    let color = '';
                                    if (line.startsWith('+++') || line.startsWith('---')) color = 'text-spark-400';
                                    if (line.startsWith('+')) color = 'text-logic-400';
                                    if (line.startsWith('-')) color = 'text-red-400';
                                    if (line.startsWith('@@')) color = 'text-design-400';
                                    return (
                                      <div key={i} className={color}>
                                        {line}
                                      </div>
                                    );
                                  })}
                                {file.patch.split('\n').length > 20 && (
                                  <div className="text-opacity-50 text-xs">[... {file.patch.split('\n').length - 20} more lines ...]</div>
                                )}
                              </pre>
                            ) : (
                              <p className="opacity-60">No patch details available</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* View on GitHub Link */}
                <div className="pt-2 border-t border-white/10">
                  <a
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-spark-400 hover:text-spark-300 transition-colors"
                  >
                    View on GitHub →
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
