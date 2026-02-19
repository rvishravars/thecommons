import { useState, useEffect, useCallback } from 'react';
import { Plus, FileText, Zap, RefreshCw } from 'lucide-react';
import { parseSparkFile } from '../utils/sparkParser';

export default function SparkSelector({ selectedSpark, onSparkSelect, onNewSpark }) {
  console.log('🚀 SparkSelector component mounted!');
  const [sparks, setSparks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    try {
      console.log('🔍 Loading sparks...');
      let sparkFiles = [];

      try {
        const apiResponse = await fetch('/api/sparks');
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
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
            sparkFiles = apiData.files
              .map((file) => file?.name || file?.path)
              .filter(Boolean);
          }
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch sparks from backend', err);
      }

      try {
        // First try to fetch the generated sparks.json index
        const indexResponse = await fetch('/sparks.json');
        if (indexResponse.ok) {
          sparkFiles = await indexResponse.json();
          console.log('✅ Loaded sparks from sparks.json');
        } else {
          // Fallback: Attempt to fetch the sparks directory listing (dev mode)
          const dirResponse = await fetch('/sparks/');
          if (dirResponse.ok) {
            const html = await dirResponse.text();
            const matches = html.match(/[\w-]+\.spark\.md/g);
            if (matches) {
              sparkFiles = [...new Set(matches)];
              console.log('✅ Loaded sparks from directory listing');
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch spark index or directory listing', err);
      }

      // Secondary fallback if all else fails
      if (sparkFiles.length === 0) {
        sparkFiles = ['reputation-shield.spark.md'];
      }

      console.log('📂 Spark files to load:', sparkFiles);

      const loadedSparks = await Promise.all(
        sparkFiles.map(async (filename) => {
          try {
            console.log(`📥 Fetching ${filename}...`);
            const response = await fetch(`/sparks/${filename}`);
            console.log(`📡 Response status for ${filename}:`, response.status);

            if (!response.ok) throw new Error(`Failed to load ${filename}: ${response.statusText}`);

            const content = await response.text();
            console.log(`✅ Loaded ${filename}, length:`, content.length);

            const sparkEntry = buildSparkEntry(filename, content);
            console.log(`🔧 Parsed ${filename}:`, sparkEntry);

            return sparkEntry;
          } catch (err) {
            console.error(`❌ Error loading ${filename}:`, err);
            return null;
          }
        })
      );

      const validSparks = loadedSparks.filter(Boolean);
      console.log('✨ Valid sparks loaded:', validSparks);
      setSparks(validSparks);
    } catch (err) {
      console.error('❌ Error in loadSparks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [buildSparkEntry]);

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
          <h3 className="text-xs font-semibold uppercase tracking-wider theme-muted">
            Existing Sparks
          </h3>
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
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-3 mb-3 text-sm text-red-400">
            {error}
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
              <p className="text-sm">No sparks found</p>
              <p className="text-xs mt-1">Add .spark.md files to /sparks/</p>
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
