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
  const url = 'https://github.com/settings/tokens/new?scopes=read:user&description=Spark%20Assembly%20Lab';
  window.open(url, '_blank');
};



