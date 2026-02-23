#!/usr/bin/env python3
"""
Spark Assembly Lab Python backend.
Replaces the Node/Express server with Flask.
"""

import json
import os
import time
import urllib.parse
import urllib.request
import base64
from pathlib import Path
from typing import Dict, Any, List, Optional

from flask import Flask, jsonify, request, send_from_directory

try:
    from scribe.missions import evaluate_spark_mission
except ImportError:
    import sys
    sys.path.append(str(Path(__file__).resolve().parents[1]))
    from scribe.missions import evaluate_spark_mission

# Import AI SDKs
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


APP_ROOT = Path(__file__).resolve().parents[1]
DIST_PATH = APP_ROOT / "dist"

app = Flask(__name__, static_folder=str(DIST_PATH), static_url_path="")
app.url_map.strict_slashes = False

@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())

@app.after_request
def after_request(response):
    app.logger.debug('Response Status: %s', response.status)
    return response

cache: Dict[str, Any] = {
    "timestamp": 0,
    "data": None,
}

pr_cache: Dict[str, Any] = {
    "timestamp": 0,
    "data": {},
}


def get_env(key: str, fallback: str) -> str:
    return os.environ.get(key, fallback)


def build_github_headers() -> Dict[str, str]:
    headers = {
        "User-Agent": "spark-assembly-lab",
        "Accept": "application/vnd.github+json",
    }
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def build_github_headers_with_token(token: Optional[str]) -> Dict[str, str]:
    headers = build_github_headers()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def parse_repo_url(input_value: str) -> Dict[str, str]:
    clean_input = input_value.strip()
    clean_input = clean_input.replace("https://", "").replace("http://", "")
    clean_input = clean_input.replace("github.com/", "")
    parts = [part for part in clean_input.split("/") if part]
    if len(parts) >= 2:
        return {
            "owner": parts[0],
            "repo": parts[1].replace(".git", ""),
        }
    raise ValueError("Invalid repository format. Use: owner/repo or https://github.com/owner/repo")


def fetch_json(url: str, headers: Dict[str, str]) -> Dict[str, Any]:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        data = response.read().decode("utf-8")
        return json.loads(data)


def fetch_text(url: str, headers: Dict[str, str]) -> str:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        return response.read().decode("utf-8")


def fetch_json_with_token(url: str, token: str, method: str = "GET", payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "spark-assembly-lab")
    if payload is not None:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode("utf-8"))


def create_github_issue(owner: str, repo: str, token: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new GitHub Issue in the specified repository."""
    url = f"https://api.github.com/repos/{owner}/{repo}/issues"
    return fetch_json_with_token(url, token, method="POST", payload=payload)


def get_open_pr_count(owner: str, repo: str, spark_path: str, token: Optional[str]) -> Dict[str, Any]:
    headers = build_github_headers_with_token(token)
    pulls_url = f"https://api.github.com/repos/{owner}/{repo}/pulls?state=open&per_page=100"
    pulls = fetch_json(pulls_url, headers)

    count = 0
    urls: List[str] = []

    for pr in pulls:
        number = pr.get("number")
        if not number:
            continue
        files_url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{number}/files?per_page=100"
        files = fetch_json(files_url, headers)
        for item in files:
            if item.get("filename") == spark_path:
                count += 1
                urls.append(pr.get("html_url"))
                break

    return {"count": count, "urls": urls}


def search_for_spark_files(owner: str, repo: str) -> List[Dict[str, Any]]:
    headers = build_github_headers()
    query = f"filename:.spark.md repo:{owner}/{repo}"
    search_url = f"https://api.github.com/search/code?q={urllib.parse.quote(query)}"
    search_data = fetch_json(search_url, headers)
    return search_data.get("items", [])


def fetch_sparks_from_github(owner: str, repo: str, branch: str = "main", search_path: str = "sparks") -> Dict[str, Any]:
    headers = build_github_headers()
    spark_items: List[Dict[str, Any]] = []

    try:
        spark_items = search_for_spark_files(owner, repo)
    except Exception as err:
        print(f"Search failed, falling back to directory listing: {err}")

    if not spark_items:
        index_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{search_path}?ref={branch}"
        try:
            items = fetch_json(index_url, headers)
        except urllib.error.HTTPError as err:
            if err.code == 404:
                raise RuntimeError(
                    f"Repository '{owner}/{repo}' not found or the '{search_path}' directory doesn't exist"
                )
            if err.code == 403:
                raise RuntimeError("GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN")
            raise RuntimeError(f"GitHub index fetch failed: {err.code}")

        spark_items = [
            item for item in items
            if item.get("type") == "file" and item.get("name", "").endswith(".spark.md")
        ]

    files = []
    for item in spark_items:
        try:
            path = item.get("path") or item.get("name")
            if not path:
                continue
            content_url = item.get("download_url")
            if not content_url:
                content_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
            content = fetch_text(content_url, headers)
            files.append({
                "name": item.get("name") or path.split("/")[-1],
                "path": path,
                "content": content,
            })
        except Exception as err:
            print(f"Failed to fetch {item.get('name') or item.get('path')}: {err}")
            continue

    return {
        "source": "github",
        "owner": owner,
        "repo": repo,
        "branch": branch,
        "files": files,
    }


def get_cache_ttl_ms() -> int:
    return int(get_env("SPARK_CACHE_TTL_SECONDS", "60")) * 1000


@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok"})


@app.get("/api/sparks")
def get_sparks():
    now = int(time.time() * 1000)
    repo_input = request.args.get("repo") or get_env("SPARK_REPO", "rvishravars/thecommons")
    branch = request.args.get("branch") or "main"
    search_path = request.args.get("path") or "sparks"

    try:
        parsed = parse_repo_url(repo_input)
    except ValueError as err:
        return jsonify({"error": str(err), "files": []}), 400

    owner = parsed["owner"]
    repo = parsed["repo"]
    cache_key = f"{owner}/{repo}:{branch}"

    if cache["data"] and cache["data"].get("cacheKey") == cache_key:
        if now - cache["timestamp"] < get_cache_ttl_ms():
            cached_data = dict(cache["data"])
            cached_data["cached"] = True
            cached_data["updatedAt"] = cache["timestamp"]
            return jsonify(cached_data)

    try:
        data = fetch_sparks_from_github(owner, repo, branch, search_path)
        cache["timestamp"] = now
        cache["data"] = {**data, "cacheKey": cache_key}
        response = {**data, "cached": False, "updatedAt": now}
        return jsonify(response)
    except RuntimeError as err:
        if cache["data"] and cache["data"].get("cacheKey") == cache_key:
            stale_data = dict(cache["data"])
            stale_data.update({
                "cached": True,
                "stale": True,
                "error": str(err),
                "updatedAt": cache["timestamp"],
            })
            return jsonify(stale_data)
        return jsonify({"error": str(err), "files": []}), 502


@app.post("/api/mission")
def run_mission():
    payload = request.get_json(silent=True) or {}
    content = payload.get("content")
    if not content:
        return jsonify({"error": "content is required"}), 400

    result = evaluate_spark_mission(content)
    return jsonify(result)


@app.post("/api/mission/file")
def run_mission_file():
    payload = request.get_json(silent=True) or {}
    repo_input = payload.get("repo")
    spark_path = payload.get("path")
    branch = payload.get("branch") or "main"

    if not repo_input or not spark_path:
        return jsonify({"error": "repo and path are required"}), 400

    try:
        parsed = parse_repo_url(repo_input)
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    owner = parsed["owner"]
    repo = parsed["repo"]
    headers = build_github_headers()
    content_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{spark_path}"

    try:
        content = fetch_text(content_url, headers)
    except Exception as err:
        return jsonify({"error": f"Failed to fetch spark content: {err}"}), 502

    result = evaluate_spark_mission(content)
    return jsonify(result)


def generate_quiz_prompt(spark_content: str, spark_data: Dict[str, Any], focus: str = "spark") -> str:
        """Generate a prompt for AI to create quiz questions based on spark content."""
        prompt = f"""You are an expert quiz generator for TheCommons Spark Assembly Lab.

This quiz is a reflection exercise to strengthen the spark. There are no right answers.
Focus the questions on: {focus.upper()}.

Generate 5 multiple-choice quiz questions based on the following Spark document. Questions should test understanding of:
1. The problem/gap identified in the SPARK phase
2. The Novel Core (10% Delta) in the DESIGN phase
3. The technical implementation in the LOGIC phase
4. TheCommons framework concepts (roles, rewards, assembly line)
5. The overall spark's value proposition

Spark Name: {spark_data.get('name', 'Unknown')}

Spark Content:
{spark_content[:3000]}

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
    {{
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "phase": "spark"
    }}
]

Phase values must be one of: "spark", "design", "logic", or "general".
Do NOT include correct answers.
Make questions engaging and educational."""
        return prompt


def generate_quiz_with_openai(spark_content: str, spark_data: Dict[str, Any], api_key: str, model: str = "gpt-4o-mini", prompt_override: Optional[str] = None, focus: str = "spark") -> List[Dict[str, Any]]:
    """Generate quiz questions using OpenAI GPT-4."""
    if not OPENAI_AVAILABLE:
        raise RuntimeError("OpenAI SDK not installed")
    
    try:
        # Initialize client with only the api_key parameter
        client = openai.OpenAI(api_key=api_key)
    except TypeError as e:
        # Handle version compatibility issues
        raise RuntimeError(f"OpenAI client initialization failed. Please ensure openai>=1.30.0 is installed. Error: {e}")
    
    prompt = prompt_override or generate_quiz_prompt(spark_content, spark_data, focus)
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a quiz generator that returns only valid JSON arrays."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content
        # Clean up potential markdown code blocks
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        questions = json.loads(content)
        return questions
    except json.JSONDecodeError as err:
        raise RuntimeError(f"OpenAI returned invalid JSON: {err}")
    except Exception as err:
        raise RuntimeError(f"OpenAI API error: {err}")


def generate_quiz_with_anthropic(spark_content: str, spark_data: Dict[str, Any], api_key: str) -> List[Dict[str, Any]]:
    """Generate quiz questions using Anthropic Claude."""
    if not ANTHROPIC_AVAILABLE:
        raise RuntimeError("Anthropic SDK not installed")
    
    try:
        # Initialize client with only the api_key parameter
        client = anthropic.Anthropic(api_key=api_key)
    except TypeError as e:
        # Handle version compatibility issues
        raise RuntimeError(f"Anthropic client initialization failed. Please ensure anthropic>=0.25.0 is installed. Error: {e}")
    
    prompt = generate_quiz_prompt(spark_content, spark_data)
    
    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            temperature=0.7,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        content = message.content[0].text
        # Clean up potential markdown code blocks
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        questions = json.loads(content)
        return questions
    except json.JSONDecodeError as err:
        raise RuntimeError(f"Anthropic returned invalid JSON: {err}")
    except Exception as err:
        raise RuntimeError(f"Anthropic API error: {err}")


@app.post("/api/quiz/generate")
def generate_quiz():
    """Generate AI-powered quiz questions for a spark."""
    payload = request.get_json(silent=True) or {}
    provider = payload.get("provider")  # 'openai' or 'anthropic'
    api_key = payload.get("apiKey")
    spark_content = payload.get("sparkContent")
    spark_data = payload.get("sparkData")
    prompt_override = payload.get("prompt")
    model_override = payload.get("model")
    focus = payload.get("focus") or "spark"
    
    if not provider:
        return jsonify({"error": "provider is required"}), 400
    if not prompt_override and (not spark_content or not spark_data):
        return jsonify({"error": "sparkContent and sparkData are required when prompt is not provided"}), 400
    
    if provider not in ["openai", "anthropic"]:
        return jsonify({"error": "provider must be 'openai' or 'anthropic'"}), 400
    
    # Try to get API key from request or environment (fallback)
    if not api_key:
        if provider == "openai":
            api_key = os.environ.get("OPENAI_API_KEY")
        elif provider == "anthropic":
            api_key = os.environ.get("ANTHROPIC_API_KEY")
        
        if not api_key:
            provider_name = "OpenAI" if provider == "openai" else "Anthropic"
            return jsonify({
                "error": f"{provider_name} API key required. Please enter your API key in the quiz interface."
            }), 400
    
    try:
        if provider == "openai":
            questions = generate_quiz_with_openai(
                spark_content,
                spark_data,
                api_key,
                model=model_override or "gpt-4o-mini",
                prompt_override=prompt_override,
                focus=focus,
            )
        else:  # anthropic
            questions = generate_quiz_with_anthropic(spark_content, spark_data, api_key)
        
        return jsonify({"questions": questions})
    except RuntimeError as err:
        return jsonify({"error": str(err)}), 502
    except Exception as err:
        return jsonify({"error": f"Quiz generation failed: {err}"}), 500


@app.post("/api/quiz/summary")
def generate_quiz_summary():
    """Generate a summary report for quiz responses."""
    payload = request.get_json(silent=True) or {}
    provider = payload.get("provider")  # 'openai'
    api_key = payload.get("apiKey")
    prompt_override = payload.get("prompt")
    model_override = payload.get("model") or "gpt-4o-mini"

    if not provider:
        return jsonify({"error": "provider is required"}), 400
    if provider != "openai":
        return jsonify({"error": "provider must be 'openai'"}), 400
    if not prompt_override:
        return jsonify({"error": "prompt is required"}), 400

    if not api_key:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            return jsonify({"error": "OpenAI API key required. Please enter your API key in the quiz interface."}), 400

    try:
        if not OPENAI_AVAILABLE:
            raise RuntimeError("OpenAI SDK not installed")

        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model_override,
            messages=[
                {"role": "system", "content": "You are a Spark mentor that returns concise, structured feedback."},
                {"role": "user", "content": prompt_override},
            ],
            temperature=0.4,
            max_tokens=1200,
        )

        content = response.choices[0].message.content or ""
        return jsonify({"summary": content.strip()})
    except RuntimeError as err:
        return jsonify({"error": str(err)}), 502
    except Exception as err:
        return jsonify({"error": f"Summary generation failed: {err}"}), 500


@app.get("/api/prs")
def get_prs_for_spark():
    repo_input = request.args.get("repo")
    spark_path = request.args.get("path")
    if not repo_input or not spark_path:
        return jsonify({"error": "repo and path are required"}), 400

    try:
        parsed = parse_repo_url(repo_input)
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    owner = parsed["owner"]
    repo = parsed["repo"]
    cache_key = f"{owner}/{repo}:{spark_path}"

    now = int(time.time() * 1000)
    ttl_ms = get_cache_ttl_ms()
    cached = pr_cache["data"].get(cache_key)
    if cached and now - pr_cache["timestamp"] < ttl_ms:
        return jsonify({**cached, "cached": True})

    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "").strip()

    try:
        result = get_open_pr_count(owner, repo, spark_path, token)
        response = {"count": result["count"], "urls": result["urls"], "cached": False}
        pr_cache["data"][cache_key] = response
        pr_cache["timestamp"] = now
        return jsonify(response)
    except Exception as err:
        return jsonify({"error": str(err)}), 502


@app.post("/api/submit")
def submit_spark():
    payload = request.get_json(silent=True) or {}
    token = payload.get("token")
    repo_input = payload.get("repo")
    path = payload.get("path")
    content = payload.get("content")
    title = payload.get("title") or "Spark submission"
    body = payload.get("body") or "Submitted from Spark Assembly Lab."

    if not token or not repo_input or not path or not content:
        return jsonify({"error": "token, repo, path, and content are required"}), 400

    try:
        parsed = parse_repo_url(repo_input)
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    owner = parsed["owner"]
    repo = parsed["repo"]

    try:
        # 1. Get Repo Info
        repo_info = fetch_json_with_token(f"https://api.github.com/repos/{owner}/{repo}", token)
        base_branch = repo_info.get("default_branch", "main")
        
        # 2. Try to test write access by creating a branch
        try:
            ref = fetch_json_with_token(f"https://api.github.com/repos/{owner}/{repo}/git/ref/heads/{base_branch}", token)
            base_sha = ref.get("object", {}).get("sha")
            
            # Create branch to confirm write access
            branch_name = f"spark/{int(time.time())}"
            fetch_json_with_token(
                f"https://api.github.com/repos/{owner}/{repo}/git/refs",
                token,
                method="POST",
                payload={"ref": f"refs/heads/{branch_name}", "sha": base_sha}
            )
        except urllib.error.HTTPError as err:
            if err.code == 403 or err.code == 404:
                # No write access -> Create a PROPOSAL (Issue) instead
                print(f"Write access denied to {owner}/{repo}. Creating Proposal (Issue)...")
                
                proposal_body = f"""### Spark Proposal: {sparkData.get('name', 'New Spark')}

A new spark contribution has been submitted from the Spark Assembly Lab.

**Target File:** `{path}`
**Submitted By:** User linked to this issue

#### Proposed Content:
```markdown
{content}
```

---
*This proposal was automatically generated by the Spark Assembly Lab. You can merge this by copy-pasting the content into the spark file or by using the owner's write access.*"""
                
                issue = create_github_issue(owner, repo, token, {
                    "title": f"[PROPOSAL] {sparkData.get('name', 'New Spark')}",
                    "body": proposal_body,
                    "labels": ["spark-contribution", "proposal"]
                })
                
                return jsonify({
                    "issue_url": issue.get("html_url"),
                    "is_proposal": True
                })
            else:
                raise err

        if not base_sha:
            return jsonify({"error": "Failed to resolve base branch"}), 502

        # 3. Commit/Update file (We already created the branch in Step 2)
        encoded = base64.b64encode(content.encode("utf-8")).decode("utf-8")
        file_sha = None
        try:
            existing = fetch_json_with_token(
                f"https://api.github.com/repos/{owner}/{repo}/contents/{urllib.parse.quote(path)}?ref={branch_name}",
                token
            )
            file_sha = existing.get("sha")
        except Exception:
            file_sha = None

        commit_payload = {
            "message": title,
            "content": encoded,
            "branch": branch_name,
        }
        if file_sha:
            commit_payload["sha"] = file_sha

        fetch_json_with_token(
            f"https://api.github.com/repos/{owner}/{repo}/contents/{urllib.parse.quote(path)}",
            token,
            method="PUT",
            payload=commit_payload
        )

        # 4. Create PR
        pr = fetch_json_with_token(
            f"https://api.github.com/repos/{owner}/{repo}/pulls",
            token,
            method="POST",
            payload={
                "title": title, 
                "body": body, 
                "head": branch_name, 
                "base": base_branch
            }
        )

        # Invalidate PR cache
        cache_key = f"{owner}/{repo}:{path}"
        if cache_key in pr_cache["data"]:
            del pr_cache["data"][cache_key]

        return jsonify({
            "pr_url": pr.get("html_url"), 
            "branch": branch_name,
            "is_proposal": False
        })
    except Exception as err:
        print(f"Submission error: {err}")
        return jsonify({"error": str(err)}), 502
    except Exception as err:
        print(f"Submission error: {err}")
        return jsonify({"error": str(err)}), 502


@app.post("/api/delete")
def delete_spark():
    """
    Request deletion of a spark by creating a PR that deletes the file.
    Only the spark owner (scout) can request deletion.
    """
    payload = request.get_json(silent=True) or {}
    token = payload.get("token")
    repo_input = payload.get("repo")
    path = payload.get("path")
    title = payload.get("title") or "Delete spark"
    body = payload.get("body") or "Requested deletion of spark from Spark Assembly Lab."

    if not token or not repo_input or not path:
        return jsonify({"error": "token, repo, and path are required"}), 400

    try:
        parsed = parse_repo_url(repo_input)
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    owner = parsed["owner"]
    repo = parsed["repo"]

    try:
        repo_info = fetch_json_with_token(f"https://api.github.com/repos/{owner}/{repo}", token)
        base_branch = repo_info.get("default_branch", "main")
        ref = fetch_json_with_token(f"https://api.github.com/repos/{owner}/{repo}/git/ref/heads/{base_branch}", token)
        base_sha = ref.get("object", {}).get("sha")
        if not base_sha:
            return jsonify({"error": "Failed to resolve base branch"}), 502

        # Create deletion branch
        branch_name = f"delete-spark/{int(time.time())}"
        fetch_json_with_token(
            f"https://api.github.com/repos/{owner}/{repo}/git/refs",
            token,
            method="POST",
            payload={"ref": f"refs/heads/{branch_name}", "sha": base_sha}
        )

        # Check for existing file and get its SHA
        file_sha = None
        try:
            existing = fetch_json_with_token(
                f"https://api.github.com/repos/{owner}/{repo}/contents/{urllib.parse.quote(path)}?ref={base_branch}",
                token
            )
            file_sha = existing.get("sha")
        except Exception:
            file_sha = None

        if not file_sha:
            return jsonify({"error": "Spark file not found in repository"}), 404

        # Delete the file on the new branch
        delete_payload = {
            "message": title,
            "sha": file_sha,
            "branch": branch_name,
        }

        fetch_json_with_token(
            f"https://api.github.com/repos/{owner}/{repo}/contents/{urllib.parse.quote(path)}",
            token,
            method="DELETE",
            payload=delete_payload
        )

        # Create deletion PR
        pr = fetch_json_with_token(
            f"https://api.github.com/repos/{owner}/{repo}/pulls",
            token,
            method="POST",
            payload={"title": title, "body": body, "head": branch_name, "base": base_branch}
        )

        # Invalidate PR cache for this spark
        cache_key = f"{owner}/{repo}:{path}"
        if cache_key in pr_cache["data"]:
            del pr_cache["data"][cache_key]

        return jsonify({"pr_url": pr.get("html_url"), "branch": branch_name})
    except Exception as err:
        return jsonify({"error": str(err)}), 502


@app.get("/")
@app.get("/<path:path>")
def serve_ui(path: Optional[str] = None):
    if not DIST_PATH.exists():
        return "UI build not found. Run npm run build.", 404

    if path and (DIST_PATH / path).exists():
        return send_from_directory(DIST_PATH, path)

    return send_from_directory(DIST_PATH, "index.html")


if __name__ == "__main__":
    port = int(get_env("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
