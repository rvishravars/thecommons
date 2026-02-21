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
        repo_info = fetch_json_with_token(f"https://api.github.com/repos/{owner}/{repo}", token)
        base_branch = repo_info.get("default_branch", "main")
        ref = fetch_json_with_token(f"https://api.github.com/repos/{owner}/{repo}/git/ref/heads/{base_branch}", token)
        base_sha = ref.get("object", {}).get("sha")
        if not base_sha:
            return jsonify({"error": "Failed to resolve base branch"}), 502

        branch_name = f"spark/{int(time.time())}"
        fetch_json_with_token(
            f"https://api.github.com/repos/{owner}/{repo}/git/refs",
            token,
            method="POST",
            payload={"ref": f"refs/heads/{branch_name}", "sha": base_sha}
        )

        encoded = base64.b64encode(content.encode("utf-8")).decode("utf-8")

        # Check for existing file
        file_sha = None
        try:
            existing = fetch_json_with_token(
                f"https://api.github.com/repos/{owner}/{repo}/contents/{urllib.parse.quote(path)}?ref={base_branch}",
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

        pr = fetch_json_with_token(
            f"https://api.github.com/repos/{owner}/{repo}/pulls",
            token,
            method="POST",
            payload={"title": title, "body": body, "head": branch_name, "base": base_branch}
        )

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
