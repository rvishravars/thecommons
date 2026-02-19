import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const cache = {
  timestamp: 0,
  data: null,
};

const getEnv = (key, fallback) => process.env[key] || fallback;

const cacheTtlMs = Number.parseInt(getEnv('SPARK_CACHE_TTL_SECONDS', '60'), 10) * 1000;
const githubOwner = getEnv('GITHUB_OWNER', 'rvishravars');
const githubRepo = getEnv('GITHUB_REPO', 'thecommons');
const githubBranch = getEnv('GITHUB_BRANCH', 'main');
const githubPath = getEnv('GITHUB_SPARKS_PATH', 'sparks');
const githubToken = process.env.GITHUB_TOKEN;

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

const fetchSparksFromGithub = async () => {
  const headers = buildGithubHeaders();
  const indexUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${githubPath}?ref=${githubBranch}`;
  const indexResponse = await fetch(indexUrl, { headers });
  if (!indexResponse.ok) {
    throw new Error(`GitHub index fetch failed: ${indexResponse.status}`);
  }

  const items = await indexResponse.json();
  const sparkFiles = items.filter(
    (item) => item.type === 'file' && item.name.endsWith('.spark.md')
  );

  const files = await Promise.all(
    sparkFiles.map(async (item) => {
      const contentResponse = await fetch(item.download_url, { headers });
      if (!contentResponse.ok) {
        throw new Error(`GitHub content fetch failed for ${item.name}`);
      }
      const content = await contentResponse.text();
      return {
        name: item.name,
        path: item.path,
        content,
      };
    })
  );

  return {
    source: 'github',
    files,
  };
};

app.get('/api/sparks', async (req, res) => {
  const now = Date.now();
  if (cache.data && now - cache.timestamp < cacheTtlMs) {
    res.json({
      cached: true,
      updatedAt: cache.timestamp,
      ...cache.data,
    });
    return;
  }

  try {
    const data = await fetchSparksFromGithub();
    cache.timestamp = now;
    cache.data = data;
    res.json({
      cached: false,
      updatedAt: cache.timestamp,
      ...data,
    });
  } catch (error) {
    if (cache.data) {
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
