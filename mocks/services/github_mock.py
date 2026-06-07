from flask import Blueprint, request, jsonify

github_bp = Blueprint('github', __name__)

@github_bp.route('/repos/<owner>/<repo>/contents/<path>', methods=['GET'])
def get_file(owner, repo, path):
    print(f"[GitHub Mock] Fetching file path: {path} from {owner}/{repo}")
    
    if "architecture" in path.lower():
        content = (
            "# System Architecture Spec\n"
            "## Services\n"
            "1. **Checkout Service**: Handles cart transactions.\n"
            "## Dependencies\n"
            "- **Redis cluster**: Used by Checkout Service for session tokens. "
            "Max pool size configurations rely on properties files configuration."
        )
        return jsonify({"name": "architecture.md", "path": path, "content": content})
        
    elif "openapi" in path.lower() or "swagger" in path.lower():
        content = "openapi: 3.0.0\ninfo:\n  title: Checkout API\npaths:\n  /api/v1/checkout:\n    post:\n      responses:\n        '500':\n          description: Internal Server Error due to pool exhaustion."
        return jsonify({"name": "openapi.yaml", "path": path, "content": content})
        
    return jsonify({"error": "File not found"}), 404


@github_bp.route('/repos/<owner>/<repo>/pulls', methods=['GET'])
def get_prs(owner, repo):
    print(f"[GitHub Mock] Fetching recent pull requests for {owner}/{repo}")
    return jsonify([
        {
            "number": 402,
            "title": "perf(redis): Optimize session validation lookup by adjusting pool timeouts",
            "state": "closed",
            "merged_at": "2026-06-07T08:20:00Z",
            "html_url": f"https://github.com/{owner}/{repo}/pull/402",
            "diff_summary": "Modified application.properties. Decreased spring.redis.jedis.pool.max-wait down to 50ms and lowered max-idle slots."
        }
    ])