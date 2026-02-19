# Loading Sparks from External GitHub Repositories

The Spark Assembly Lab loads sparks from any public GitHub repository dynamically. **A repository URL is required** - the application does not load any sparks by default.

## How It Works

The application uses the GitHub API to:
1. Search for all `.spark.md` files in the specified repository
2. Fetch the content of each spark file
3. Parse and display them in the spark selector

## Usage

### From the UI

1. **Locate the Repository Input**: At the top of the left sidebar, you'll see a "Git Repository" section
2. **Enter a Repository**: You can use any of these formats:
   ```
   https://github.com/username/repository
   github.com/username/repository
   username/repository
   ```
3. **Load Sparks**: Click the search icon or press Enter
4. **View Results**: All `.spark.md` files from that repository will be displayed in the spark selector

### Examples

#### Load from a different organization:
```
apache/spark
```

#### Load from a personal repository:
```
yourname/my-sparks
```

#### Load using full URL:
```
https://github.com/microsoft/vscode
```

## API Usage

### Via Query Parameters

You can also specify the repository via URL parameters:

```
http://localhost:5173/?repo=username/repository
```

### Direct API Call

The backend API endpoint accepts repository parameters:

```bash
# Fetch sparks from a specific repository
curl "http://localhost:8080/api/sparks?repo=username/repository"

# Specify branch (optional, defaults to 'main')
curl "http://localhost:8080/api/sparks?repo=username/repository&branch=develop"

# Specify path within repo (optional, defaults to 'sparks')
curl "http://localhost:8080/api/sparks?repo=username/repository&path=docs/sparks"
```

### API Response Format

```json
{
  "cached": false,
  "updatedAt": 1708444800000,
  "source": "github",
  "owner": "username",
  "repo": "repository",
  "branch": "main",
  "files": [
    {
      "name": "example.spark.md",
      "path": "sparks/example.spark.md",
      "content": "# Example Spark\n\n..."
    }
  ]
}
```

## GitHub API Rate Limits

### Unauthenticated Requests
- **Rate Limit**: 60 requests per hour per IP
- **Search API**: 10 requests per minute

### Authenticated Requests (with GITHUB_TOKEN)
- **Rate Limit**: 5,000 requests per hour
- **Search API**: 30 requests per minute

### Setting Up Authentication

To increase rate limits, set a GitHub personal access token:

```bash
# In your environment or .env file
GITHUB_TOKEN=ghp_your_token_here
```

To create a token:
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Select scopes: `public_repo` (for public repositories)
4. Copy the token and set it as an environment variable

## Caching

The server caches spark files to reduce API calls:
- **Default TTL**: 60 seconds
- **Configurable**: Set `SPARK_CACHE_TTL_SECONDS` environment variable
- **Per Repository**: Each repository has its own cache entry

```bash
# Set cache to 5 minutes
SPARK_CACHE_TTL_SECONDS=300
```

## Private Repositories

To access private repositories:
1. Set up a GitHub token with appropriate permissions
2. Add the token to your environment: `GITHUB_TOKEN=your_token`
3. Ensure the token has access to the private repository

## Troubleshooting

### "GitHub index fetch failed: 404"
- The repository doesn't exist or is private without proper authentication
- Check the repository URL/name is correct

### "GitHub search failed: 403"
- Rate limit exceeded
- Solution: Add a GITHUB_TOKEN or wait for rate limit reset

### No sparks found
- The repository doesn't contain any `.spark.md` files
- Check the branch name (defaults to 'main', some repos use 'master')
- Try specifying a different path: `?repo=owner/repo&path=docs`

### Slow loading
- Large repositories may take longer to search
- Consider adding GITHUB_TOKEN for better performance
- Results are cached after first load

## Feature Highlights

✅ **Search Across Entire Repository**: Finds `.spark.md` files anywhere in the repo
✅ **Smart Fallback**: Falls back to directory listing if search fails
✅ **Caching**: Reduces API calls and improves performance
✅ **Persistent Selection**: Your repository choice is saved locally
✅ **Error Handling**: Clear error messages for common issues

## Architecture

```
User Input (UI)
    ↓
RepoInput Component
    ↓
App.jsx (State Management)
    ↓
SparkSelector Component
    ↓
API Call: /api/sparks?repo=...
    ↓
Express Server (server/index.js)
    ↓
GitHub API
    ├─ Code Search (/search/code)
    ├─ Contents API (/repos/.../contents)
    └─ Raw Content (raw.githubusercontent.com)
    ↓
Parse & Cache
    ↓
Return to UI
    ↓
Display Sparks
```

## Future Enhancements

- [ ] Support for GitLab and other Git platforms
- [ ] Bulk spark export from external repos
- [ ] Fork and edit external sparks
- [ ] Compare sparks across different repositories
- [ ] Repository bookmarks/favorites
