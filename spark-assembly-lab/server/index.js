import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// Middleware
app.use(express.json());

const cache = {
  timestamp: 0,
  data: null,
};

const getEnv = (key, fallback) => process.env[key] || fallback;

const cacheTtlMs = Number.parseInt(getEnv('SPARK_CACHE_TTL_SECONDS', '60'), 10) * 1000;
const defaultRepo = 'rvishravars/thecommons';
const githubToken = process.env.GITHUB_TOKEN;

const parseRepoUrl = (input) => {
  // Handle various formats: 
  // - https://github.com/owner/repo
  // - github.com/owner/repo
  // - owner/repo
  const cleanInput = input.trim().replace(/^https?:\/\//, '').replace(/^github\.com\//, '');
  const parts = cleanInput.split('/').filter(Boolean);
  
  if (parts.length >= 2) {
    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/, ''),
    };
  }
  
  throw new Error('Invalid repository format. Use: owner/repo or https://github.com/owner/repo');
};

const buildGithubHeaders = () => {
  const headers = {
    'User-Agent': 'spark-assembly-lab',
    Accept: 'application/vnd.github+json',
  };
  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }
  return headers;
};

const searchForSparkFiles = async (owner, repo) => {
  const headers = buildGithubHeaders();
  const searchUrl = `https://api.github.com/search/code?q=filename:.spark.md+repo:${owner}/${repo}`;
  
  const searchResponse = await fetch(searchUrl, { headers });
  if (!searchResponse.ok) {
    throw new Error(`GitHub search failed: ${searchResponse.status}`);
  }
  
  const searchData = await searchResponse.json();
  return searchData.items || [];
};

const fetchSparksFromGithub = async (owner, repo, branch = 'main', searchPath = 'sparks') => {
  const headers = buildGithubHeaders();
  let sparkItems = [];

  // Try searching first (more comprehensive)
  try {
    sparkItems = await searchForSparkFiles(owner, repo);
  } catch (searchErr) {
    console.warn('Search failed, falling back to directory listing:', searchErr.message);
  }

  // Fallback to directory listing if search fails or returns no results
  if (sparkItems.length === 0) {
    const indexUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${searchPath}?ref=${branch}`;
    const indexResponse = await fetch(indexUrl, { headers });
    
    if (!indexResponse.ok) {
      if (indexResponse.status === 404) {
        const errorData = await indexResponse.json().catch(() => ({}));
        if (errorData.message && errorData.message.includes('Not Found')) {
          throw new Error(`Repository '${owner}/${repo}' not found or the '${searchPath}' directory doesn't exist`);
        }
        throw new Error(`GitHub index fetch failed: 404 - Repository or path not found`);
      } else if (indexResponse.status === 403) {
        throw new Error(`GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN`);
      } else {
        throw new Error(`GitHub index fetch failed: ${indexResponse.status}`);
      }
    }

    const items = await indexResponse.json();
    sparkItems = items.filter(
      (item) => item.type === 'file' && item.name.endsWith('.spark.md')
    );
    
    // If no spark files found after checking
    if (sparkItems.length === 0) {
      // Return empty but don't throw - let the API handle this
      console.log(`No .spark.md files found in ${owner}/${repo}/${searchPath}`);
    }
  }

  const files = await Promise.all(
    sparkItems.map(async (item) => {
      try {
        // Get the raw content URL
        const contentUrl = item.download_url || 
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
        
        const contentResponse = await fetch(contentUrl, { headers });
        if (!contentResponse.ok) {
          throw new Error(`GitHub content fetch failed for ${item.name || item.path}`);
        }
        const content = await contentResponse.text();
        return {
          name: item.name || item.path.split('/').pop(),
          path: item.path,
          content,
        };
      } catch (err) {
        console.error(`Failed to fetch ${item.name || item.path}:`, err.message);
        return null;
      }
    })
  );

  return {
    source: 'github',
    owner,
    repo,
    branch,
    files: files.filter(Boolean),
  };
};

app.get('/api/sparks', async (req, res) => {
  const now = Date.now();
  
  // Get repo parameters from query string, use default if not provided
  const repoInput = req.query.repo || defaultRepo;
  
  let owner, repo;
  let branch = req.query.branch || 'main';
  let searchPath = req.query.path || 'sparks';
  
  // Parse repo URL
  try {
    const parsed = parseRepoUrl(repoInput);
    owner = parsed.owner;
    repo = parsed.repo;
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  
  // Create a cache key based on repo parameters
  const cacheKey = `${owner}/${repo}:${branch}`;
  
  if (cache.data && cache.data.cacheKey === cacheKey && now - cache.timestamp < cacheTtlMs) {
    res.json({
      cached: true,
      updatedAt: cache.timestamp,
      ...cache.data,
    });
    return;
  }

  try {
    const data = await fetchSparksFromGithub(owner, repo, branch, searchPath);
    cache.timestamp = now;
    cache.data = { ...data, cacheKey };
    res.json({
      cached: false,
      updatedAt: cache.timestamp,
      ...data,
    });
  } catch (error) {
    if (cache.data && cache.data.cacheKey === cacheKey) {
      res.json({
        cached: true,
        stale: true,
        error: error.message,
        updatedAt: cache.timestamp,
        ...cache.data,
      });
      return;
    }
    res.status(502).json({
      error: error.message,
      files: [],
    });
  }
});

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = Number.parseInt(getEnv('PORT', '8080'), 10);
app.listen(port, () => {
  console.log(`Spark Assembly Lab server running on port ${port}`);
});
