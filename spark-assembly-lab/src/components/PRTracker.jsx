import { useState, useEffect } from 'react';
import { GitPullRequest, ChevronDown, ChevronUp, Code2, Plus, Minus, AlertCircle, GitCommit } from 'lucide-react';
import { fetchOpenPullRequests, fetchPRFiles, fetchPRDiff, parseRepoUrl, fetchFileCommitHistory, fetchCommitDetails } from '../utils/github';

export default function PRTracker({ repoUrl, sparkFile, user }) {
  const [prs, setPrs] = useState([]);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPR, setSelectedPR] = useState(null);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [commitDiffs, setCommitDiffs] = useState({});
  const [prFiles, setPrFiles] = useState({});
  const [expandedDiffs, setExpandedDiffs] = useState({});
  const [viewMode, setViewMode] = useState('prs'); // 'prs' or 'history'

  useEffect(() => {
    if (!repoUrl || !sparkFile) return;
    loadPRs();
  }, [repoUrl, sparkFile]);

  const loadPRs = async () => {
    setLoading(true);
    setError(null);
    setViewMode('prs');
    
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
      
      // If no PRs found, load commit history instead
      if (relevantPRs.length === 0) {
        await loadHistory(owner, repo);
      }
    } catch (err) {
      setError(err.message || 'Failed to load pull requests');
      console.error('Error loading PRs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (owner, repo) => {
    try {
      setViewMode('history');
      const history = await fetchFileCommitHistory(owner, repo, sparkFile);
      setCommits(history);
      
      if (history.length === 0) {
        setError('No history found for this spark');
      }
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const loadCommitDiff = async (commit) => {
    if (commitDiffs[commit.sha]) {
      setSelectedCommit(selectedCommit?.sha === commit.sha ? null : commit);
      return;
    }

    try {
      const { owner, repo } = parseRepoUrl(repoUrl);
      const details = await fetchCommitDetails(owner, repo, commit.sha);
      
      setCommitDiffs(prev => ({
        ...prev,
        [commit.sha]: details,
      }));
      
      setSelectedCommit(selectedCommit?.sha === commit.sha ? null : commit);
    } catch (err) {
      console.error(`Error loading diff for commit ${commit.sha}:`, err);
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
        {viewMode === 'prs' ? (
          <>
            <GitPullRequest className="h-5 w-5" />
            <h3 className="font-semibold">Spark Evolution</h3>
            <span className="ml-auto inline-block bg-white/20 px-2 py-0.5 rounded text-xs font-semibold">
              {prs.length} Open
            </span>
          </>
        ) : (
          <>
            <GitCommit className="h-5 w-5" />
            <h3 className="font-semibold">Spark History</h3>
            <span className="ml-auto inline-block bg-white/20 px-2 py-0.5 rounded text-xs font-semibold">
              {commits.length} Commits
            </span>
          </>
        )}
      </div>

      {/* Content */}
      <div className="divide-y divide-border-200/30">
        {error && !prs.length && !commits.length && (
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

        {/* Pull Requests View */}
        {viewMode === 'prs' && prs.length === 0 && !error && (
          <div className="p-4 text-center opacity-60">
            <p className="text-sm">No pull requests in progress</p>
          </div>
        )}

        {viewMode === 'prs' && prs.map((pr) => (
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

        {/* Commit History View */}
        {viewMode === 'history' && commits.length === 0 && !error && (
          <div className="p-4 text-center opacity-60">
            <p className="text-sm">No commit history available</p>
          </div>
        )}

        {viewMode === 'history' && commits.map((commit) => (
          <div key={commit.sha} className="hover:bg-white/5 transition-colors">
            {/* Commit Summary */}
            <button
              onClick={() => loadCommitDiff(commit)}
              className="w-full p-4 text-left hover:bg-white/5 transition-colors flex items-start gap-3 group"
            >
              <GitCommit className="h-5 w-5 text-design-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-mono text-xs truncate group-hover:text-design-400 transition-colors">
                  {commit.sha.substring(0, 12)}
                </h4>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(commit.commit.author.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })} · {commit.commit.author.name}
                </p>
              </div>

              <div className="flex-shrink-0">
                {selectedCommit?.sha === commit.sha ? (
                  <ChevronUp className="h-5 w-5 opacity-60" />
                ) : (
                  <ChevronDown className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                )}
              </div>
            </button>

            {/* Commit Diff */}
            {selectedCommit?.sha === commit.sha && commitDiffs[commit.sha] && (
              <div className="bg-white/5 border-t border-white/10 p-4">
                {commitDiffs[commit.sha].files && commitDiffs[commit.sha].files.length > 0 ? (
                  <>
                    {commitDiffs[commit.sha].files.map((file, idx) => (
                      file.filename.endsWith('.spark.md') && (
                        <div key={idx} className="space-y-2">
                          {file.patch && (
                            <div className="bg-black/20 rounded border border-white/10 p-3 font-mono text-xs max-h-96 overflow-y-auto">
                              <pre className="whitespace-pre-wrap break-words text-xs">
                                {file.patch
                                  .split('\n')
                                  .slice(0, 50) // Show first 50 lines
                                  .map((line, i) => {
                                    let color = '';
                                    if (line.startsWith('+++') || line.startsWith('---')) color = 'text-spark-400';
                                    if (line.startsWith('+') && !line.startsWith('+++')) color = 'text-logic-400';
                                    if (line.startsWith('-') && !line.startsWith('---')) color = 'text-red-400';
                                    if (line.startsWith('@@')) color = 'text-design-400';
                                    return (
                                      <div key={i} className={color}>
                                        {line}
                                      </div>
                                    );
                                  })}
                                {file.patch.split('\n').length > 50 && (
                                  <div className="text-opacity-50 text-xs">[... {file.patch.split('\n').length - 50} more lines ...]</div>
                                )}
                              </pre>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                    <div className="pt-3 border-t border-white/10 mt-3">
                      <a
                        href={`${repoUrl.replace('https://', '').replace('github.com/', 'https://github.com/')}/commit/${commit.sha}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-design-400 hover:text-design-300 transition-colors"
                      >
                        View on GitHub →
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-xs opacity-60 text-center py-4">No spark file changes in this commit</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
