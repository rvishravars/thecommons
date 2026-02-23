/**
 * GitHub Personal Access Token Authentication
 * Users paste their GitHub token directly
 */

const GITHUB_AUTH_TOKEN_KEY = 'gh_user_token';
const GITHUB_USER_KEY = 'gh_user_info';

/**
 * Get stored GitHub token
 */
export const getStoredToken = () => {
  return localStorage.getItem(GITHUB_AUTH_TOKEN_KEY);
};

/**
 * Get stored user info
 */
export const getStoredUserInfo = () => {
  const stored = localStorage.getItem(GITHUB_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

/**
 * Fetch user info from GitHub using access token
 */
export const fetchUserInfo = async (token) => {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      login: data.login,
      name: data.name,
      avatar_url: data.avatar_url,
      id: data.id,
    };
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    return null;
  }
};

/**
 * Login with personal access token
 */
export const loginWithToken = async (token) => {
  if (!token || !token.trim()) {
    return {
      success: false,
      error: 'Token is required',
    };
  }

  try {
    const userInfo = await fetchUserInfo(token);
    
    if (!userInfo) {
      return {
        success: false,
        error: 'Invalid token or unable to fetch user info. Make sure your token has at least "read:user" scope.',
      };
    }

    storeUserAuth(token, userInfo);
    return {
      success: true,
      user: userInfo,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to authenticate',
    };
  }
};

/**
 * Store user token and info
 */
export const storeUserAuth = (token, userInfo) => {
  localStorage.setItem(GITHUB_AUTH_TOKEN_KEY, token);
  localStorage.setItem(GITHUB_USER_KEY, JSON.stringify(userInfo));
};

/**
 * Clear stored authentication
 */
export const clearUserAuth = () => {
  localStorage.removeItem(GITHUB_AUTH_TOKEN_KEY);
  localStorage.removeItem(GITHUB_USER_KEY);
};

/**
 * Open GitHub token creation page
 */
export const openTokenCreationPage = () => {
  const url = 'https://github.com/settings/tokens/new?scopes=read:user,repo&description=Spark%20Assembly%20Lab';
  window.open(url, '_blank');
};

/**
 * Parse repository URL into owner and repo
 */
export const parseRepoUrl = (input) => {
  const cleanInput = input.trim()
    .replace(/https?:\/\//, '')
    .replace(/github\.com\//, '');
  
  const parts = cleanInput.split('/').filter(part => part);
  
  if (parts.length >= 2) {
    return {
      owner: parts[0],
      repo: parts[1].replace('.git', ''),
    };
  }
  
  throw new Error('Invalid repository format. Use: owner/repo or https://github.com/owner/repo');
};

/**
 * Build GitHub API headers with optional authentication
 */
const buildGitHubHeaders = () => {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'spark-assembly-lab',
  };
  
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Search for .spark.md files in a repository
 */
const searchSparkFiles = async (owner, repo) => {
  const query = `filename:.spark.md repo:${owner}/${repo}`;
  const url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url, {
    headers: buildGitHubHeaders(),
  });
  
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please add a GitHub token or try again later.');
    }
    throw new Error(`GitHub search failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data.items || [];
};

/**
 * List files in a directory
 */
const listDirectory = async (owner, repo, path = 'sparks', branch = 'main') => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  
  const response = await fetch(url, {
    headers: buildGitHubHeaders(),
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository '${owner}/${repo}' not found or the '${path}' directory doesn't exist`);
    }
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please add a GitHub token or try again later.');
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  const items = await response.json();
  return items.filter(item => 
    item.type === 'file' && item.name.endsWith('.spark.md')
  );
};

/**
 * Fetch file content from GitHub
 */
const fetchFileContent = async (owner, repo, path, branch = 'main') => {
  // Use raw.githubusercontent.com for direct content access (no rate limiting)
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }
  
  return await response.text();
};

/**
 * Load all sparks from a GitHub repository
 */
export const loadSparksFromGitHub = async (repoInput, branch = 'main', searchPath = 'sparks') => {
  try {
    // Parse repository URL
    const { owner, repo } = parseRepoUrl(repoInput);
    
    let sparkItems = [];
    
    // Try searching first (faster, works across the whole repo)
    try {
      sparkItems = await searchSparkFiles(owner, repo);
    } catch (searchErr) {
      console.warn('Search failed, falling back to directory listing:', searchErr);
    }
    
    // If search didn't work or returned nothing, try directory listing
    if (sparkItems.length === 0) {
      sparkItems = await listDirectory(owner, repo, searchPath, branch);
    }
    
    if (sparkItems.length === 0) {
      return {
        success: true,
        owner,
        repo,
        branch,
        files: [],
        message: 'No .spark.md files found in this repository',
      };
    }
    
    // Fetch content for each spark file
    const files = [];
    for (const item of sparkItems) {
      try {
        const path = item.path || item.name;
        const content = await fetchFileContent(owner, repo, path, branch);
        files.push({
          name: item.name || path.split('/').pop(),
          path: path,
          content: content,
        });
      } catch (err) {
        console.warn(`Failed to fetch ${item.name || item.path}:`, err);
        // Continue with other files
      }
    }
    
    return {
      success: true,
      owner,
      repo,
      branch,
      files,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to load sparks from GitHub',
    };
  }
};

/**
 * Fetch all open pull requests in a repository
 */
export const fetchOpenPullRequests = async (owner, repo) => {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`;
    
    const response = await fetch(url, {
      headers: buildGitHubHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PRs: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch pull requests:', error);
    return [];
  }
};

/**
 * Fetch files changed in a specific pull request
 */
export const fetchPRFiles = async (owner, repo, prNumber) => {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`;
    
    const response = await fetch(url, {
      headers: buildGitHubHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PR files: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch files for PR #${prNumber}:`, error);
    return [];
  }
};

/**
 * Get file diff content from a PR
 */
export const fetchPRDiff = async (owner, repo, prNumber, filename) => {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`;
    
    const response = await fetch(url, {
      headers: buildGitHubHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PR diff: ${response.status}`);
    }

    const files = await response.json();
    return files.find(f => f.filename === filename);
  } catch (error) {
    console.error(`Failed to fetch diff for ${filename}:`, error);
    return null;
  }
};

/**
 * Filter PRs that affect a specific file
 */
export const filterPRsByFile = (prs, filename) => {
  return prs.filter(pr => {
    // Check if the filename or similar spark file is in the PR's title or body
    return (
      pr.title.includes(filename.replace('.spark.md', '')) ||
      (pr.body && pr.body.includes(filename))
    );
  });
};



