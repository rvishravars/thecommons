import { useState, useEffect } from 'react';
import { LogOut, LogIn, Loader, Copy, Check, X, HelpCircle } from 'lucide-react';
import { 
  getStoredUserInfo, 
  clearUserAuth,
  loginWithToken,
  openTokenCreationPage
} from '../utils/github';

export default function GitHubAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = getStoredUserInfo();
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await loginWithToken(tokenInput);
    
    if (result.success && result.user) {
      setUser(result.user);
      setTokenInput('');
      setShowTokenInput(false);
    } else {
      setError(result.error || 'Failed to authenticate');
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    clearUserAuth();
    setUser(null);
    setTokenInput('');
    setShowTokenInput(false);
    setError(null);
  };

  const copyTokenCommand = () => {
    navigator.clipboard.writeText('gh auth token');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 p-2 rounded-lg theme-muted">
        <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
        <span className="text-xs md:inline hidden">Checking...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="hidden sm:flex items-center space-x-2">
          {user.avatar_url && (
            <img 
              src={user.avatar_url} 
              alt={user.login}
              className="h-6 w-6 rounded-full"
            />
          )}
          <span className="text-xs md:text-sm font-semibold theme-subtle truncate max-w-[120px]">
            {user.login}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg theme-button p-2 transition-colors hover:theme-button-hover"
          title="Logout from GitHub"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {showTokenInput ? (
        <form onSubmit={handleTokenSubmit} className="flex items-center space-x-2 gap-1 relative">
          <div className="relative">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                setError(null);
              }}
              placeholder="Paste GitHub token"
              className="rounded-lg border px-2 py-1.5 text-xs font-semibold theme-input w-32 sm:w-40"
              aria-label="GitHub token"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 transition-colors p-0.5"
              title="How to get a GitHub token"
              aria-label="Help"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            {showHelp && (
              <div className="absolute top-full mt-2 left-0 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 w-48 text-xs text-blue-900 dark:text-blue-100 space-y-2 z-50 shadow-lg backdrop-blur-sm">
                <p className="font-semibold">How to get a token:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Run: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">gh auth token</code></li>
                  <li>Or visit <button onClick={openTokenCreationPage} className="text-blue-600 hover:underline">GitHub Settings</button></li>
                </ol>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !tokenInput.trim()}
            className="rounded-lg theme-button px-2 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowTokenInput(false);
              setTokenInput('');
              setError(null);
              setShowHelp(false);
            }}
            disabled={isLoading}
            className="rounded-lg theme-button p-2 transition-colors hover:theme-button-hover disabled:opacity-50"
            title="Cancel"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTokenInput(true)}
            className="rounded-lg theme-button p-2 transition-colors hover:theme-button-hover flex items-center space-x-1"
            title="Login with GitHub token"
            aria-label="Login with GitHub"
          >
            <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs hidden md:inline font-semibold">Login</span>
          </button>
          <div className="text-xs theme-subtle hidden sm:block">
            Offline
          </div>
        </div>
      )}
      {error && (
        <div className="absolute top-full mt-1 text-xs text-red-500 space-y-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg backdrop-blur-sm">
          <div>{error}</div>
          <div className="space-y-1">
            <button
              onClick={copyTokenCommand}
              className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 underline"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy token command</span>
                </>
              )}
            </button>
            <button
              onClick={openTokenCreationPage}
              className="block text-blue-500 hover:text-blue-600 underline"
            >
              Create new token
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
