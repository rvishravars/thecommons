import { useState, useEffect, useCallback } from 'react';
import { Plus, FileText, Zap, RefreshCw } from 'lucide-react';
import { parseSparkFile } from '../utils/sparkParser';
import RepoInput from './RepoInput';

export default function SparkSelector({ selectedSpark, onSparkSelect, onNewSpark, repoUrl, onRepoChange }) {
  console.log('🚀 SparkSelector component mounted!');
  const [sparks, setSparks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'repo-not-found', 'no-sparks', 'network-error'
  const [repoInfo, setRepoInfo] = useState(null);

  const buildSparkEntry = useCallback((filename, content) => {
    const parsed = parseSparkFile(content);
    return {
      id: filename.replace('.spark.md', ''),
      name: parsed.name,
      file: filename,
      stability: parsed.stability,
      data: parsed,
    };
  }, []);

  const loadSparks = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      console.log('🔍 Loading sparks...');

      try {
        // Build API URL with repo parameter if provided
        const apiUrl = repoUrl 
          ? `/api/sparks?repo=${encodeURIComponent(repoUrl)}`
          : '/api/sparks';
        
        const apiResponse = await fetch(apiUrl);
        
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          
          // Store repo info for display
          if (apiData.owner && apiData.repo) {
            setRepoInfo(`${apiData.owner}/${apiData.repo}`);
          }
          
          if (Array.isArray(apiData.files) && apiData.files.length > 0) {
            const apiContentFiles = apiData.files.filter((file) => file?.content);
            if (apiContentFiles.length > 0) {
              const parsedSparks = apiContentFiles.map((file) =>
                buildSparkEntry(file.name || file.path || 'spark', file.content)
              );
              setSparks(parsedSparks);
              setLoading(false);
              return;
            }
          } else {
            // No spark files found in the repository
            setErrorType('no-sparks');
            setError('No .spark.md files found in this repository');
            setSparks([]);
            setLoading(false);
            return;
          }
        } else {
          const errorData = await apiResponse.json().catch(() => ({ error: 'Unknown error' }));
          const errorMessage = errorData.error || `Failed to fetch sparks: ${apiResponse.status}`;
          
          // Determine error type based on status code and message
          if (apiResponse.status === 404 || errorMessage.includes('GitHub index fetch failed: 404')) {
            setErrorType('repo-not-found');
            setError('Repository not found. Please check the URL and try again.');
          } else if (apiResponse.status === 403) {
            setErrorType('rate-limit');
            setError('GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN.');
          } else if (errorMessage.includes('Invalid repository format')) {
            setErrorType('invalid-format');
            setError('Invalid repository format. Use: owner/repo or https://github.com/owner/repo');
          } else {
            setErrorType('network-error');
            setError(errorMessage);
          }
          setSparks([]);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch sparks from backend', err);
        setErrorType('network-error');
        setError(err.message || 'Failed to connect to the server');
        setSparks([]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('❌ Error in loadSparks:', err);
      setErrorType('network-error');
      setError(err.message);
      setSparks([]);
    } finally {
      setLoading(false);
    }
  }, [buildSparkEntry, repoUrl]);

  useEffect(() => {
    loadSparks();
  }, [loadSparks]);

  const getStabilityColor = (stability) => {
    if (stability === 0) return 'bg-red-600';
    if (stability === 1) return 'bg-intuition-600';
    if (stability === 2) return 'bg-imagination-600';
    return 'bg-logic-600';
  };

  const getStabilityLabel = (stability) => {
    return `${stability}/3 Stable`;
  };

  return (
    <div className="flex flex-col h-full">
      <RepoInput onRepoChange={onRepoChange} currentRepo={repoUrl} />
      
      <div className="p-4 border-b theme-border">
        <button
          onClick={onNewSpark}
          className="w-full flex items-center justify-center space-x-2 rounded-lg bg-imagination-600 px-4 py-3 text-sm font-semibold hover:bg-imagination-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Spark</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider theme-muted">
              Existing Sparks
            </h3>
            {repoInfo && (
              <p className="text-xs theme-subtle mt-1">
                from {repoInfo}
              </p>
            )}
          </div>
          <button
            onClick={loadSparks}
            disabled={loading}
            className="theme-muted-hover transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-3 mb-3">
            <div className="flex items-start space-x-2">
              {errorType === 'repo-not-found' && (
                <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {errorType === 'no-sparks' && (
                <svg className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {(errorType === 'network-error' || errorType === 'rate-limit' || errorType === 'invalid-format') && (
                <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-400 mb-1">
                  {errorType === 'repo-not-found' && 'Repository Not Found'}
                  {errorType === 'no-sparks' && 'No Spark Files'}
                  {errorType === 'rate-limit' && 'Rate Limit Exceeded'}
                  {errorType === 'invalid-format' && 'Invalid Format'}
                  {errorType === 'network-error' && 'Connection Error'}
                  {!errorType && 'Error'}
                </p>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {loading && sparks.length === 0 ? (
            <div className="text-center py-8 theme-subtle">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Loading sparks...</p>
            </div>
          ) : sparks.length === 0 ? (
            <div className="text-center py-8 theme-subtle">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {error ? 'Unable to load sparks' : 'No sparks found'}
              </p>
              <p className="text-xs mt-1">
                {error ? 'Please check the error message above' : 'This repository has no .spark.md files'}
              </p>
            </div>
          ) : (
            sparks.map((spark) => (
              <button
                key={spark.id}
                onClick={() => onSparkSelect(spark.data)}
                className={`w-full rounded-lg border-2 p-3 text-left transition-all hover:border-imagination-500 ${selectedSpark?.name === spark.name
                  ? 'border-imagination-500 theme-card'
                  : 'theme-border theme-card-soft'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 mt-0.5 text-imagination-500" />
                    <div>
                      <h4 className="font-semibold text-sm">{spark.name}</h4>
                      <p className="text-xs theme-muted mt-1">{spark.file}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStabilityColor(
                      spark.stability
                    )}`}
                  >
                    {getStabilityLabel(spark.stability)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="border-t theme-border p-4 theme-sidebar-footer">
        <div className="text-xs theme-subtle">
          <p className="font-semibold mb-2">Stability Levels:</p>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-intuition-600"></div>
              <span>1/3 - Intuition only</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-imagination-600"></div>
              <span>2/3 - Imagination added</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-logic-600"></div>
              <span>3/3 - Fully built</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
