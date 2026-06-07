from flask import Blueprint, request, jsonify
from .incident_manager import is_incident_active, get_current_incident_type, IncidentType

github_bp = Blueprint('github', __name__)

@github_bp.route('/repos/<owner>/<repo>/contents/<path>', methods=['GET'])
def get_file(owner, repo, path):
    print(f"[GitHub Mock] Fetching file path: {path} from {owner}/{repo}")
    
    incident_active = is_incident_active()
    current_incident_type = get_current_incident_type()
    
    if "architecture" in path.lower():
        if incident_active and current_incident_type == IncidentType.REDIS_POOL_EXHAUSTION:
            content = (
                "# System Architecture Spec\n"
                "## Services\n"
                "1. **Checkout Service**: Handles cart transactions.\n"
                "## Dependencies\n"
                "- **Redis cluster**: Used by Checkout Service for session tokens. "
                "Max pool size configurations rely on properties files configuration. "
                "Current pool size: 30 connections. Last modified: 2026-06-07."
            )
        elif incident_active and current_incident_type == IncidentType.DATABASE_TIMEOUT:
            content = (
                "# System Architecture Spec\n"
                "## Services\n"
                "1. **Order Service**: Manages order processing and persistence.\n"
                "## Dependencies\n"
                "- **PostgreSQL**: Main transactional database. "
                "Connection pool size: 20 connections. Connection timeout: 30s. "
                "Last schema update: 2026-06-07."
            )
        elif incident_active and current_incident_type == IncidentType.MEMORY_LEAK:
            content = (
                "# System Architecture Spec\n"
                "## Services\n"
                "1. **API Gateway**: Request routing and load balancing.\n"
                "## Dependencies\n"
                "- **JVM Service Mesh**: API Gateway runs on JVM with 2GB heap allocated. "
                "Garbage collection tuning: G1GC. Last GC tuning: 2026-06-05."
            )
        else:
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
        if incident_active and current_incident_type == IncidentType.REDIS_POOL_EXHAUSTION:
            content = "openapi: 3.0.0\ninfo:\n  title: Checkout API\npaths:\n  /api/v1/checkout:\n    post:\n      responses:\n        '500':\n          description: Internal Server Error due to Redis pool exhaustion."
        elif incident_active and current_incident_type == IncidentType.DATABASE_TIMEOUT:
            content = "openapi: 3.0.0\ninfo:\n  title: Order API\npaths:\n  /api/v1/orders:\n    post:\n      responses:\n        '504':\n          description: Gateway Timeout due to database connection exhaustion."
        elif incident_active and current_incident_type == IncidentType.MEMORY_LEAK:
            content = "openapi: 3.0.0\ninfo:\n  title: Gateway API\npaths:\n  /api/v1/routes:\n    get:\n      responses:\n        '500':\n          description: Internal Server Error due to OutOfMemory condition."
        else:
            content = "openapi: 3.0.0\ninfo:\n  title: Checkout API\npaths:\n  /api/v1/checkout:\n    post:\n      responses:\n        '200':\n          description: Success."
        return jsonify({"name": "openapi.yaml", "path": path, "content": content})
        
    return jsonify({"error": "File not found"}), 404


@github_bp.route('/repos/<owner>/<repo>/pulls', methods=['GET'])
def get_prs(owner, repo):
    print(f"[GitHub Mock] Fetching recent pull requests for {owner}/{repo}")
    
    incident_active = is_incident_active()
    current_incident_type = get_current_incident_type()
    
    if not incident_active:
        # No incident - return routine maintenance PRs
        print("[GitHub Mock] No incident active. Returning routine PRs.")
        return jsonify([
            {
                "number": 450,
                "title": "docs: Update README with latest deployment info",
                "state": "closed",
                "merged_at": "2026-06-06T10:20:00Z",
                "html_url": f"https://github.com/{owner}/{repo}/pull/450",
                "diff_summary": "Documentation update. No code changes."
            }
        ])
    
    # Incident is active - return incident-relevant PRs
    if current_incident_type == IncidentType.REDIS_POOL_EXHAUSTION:
        print("[GitHub Mock] Returning Redis pool exhaustion relevant PRs.")
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
    
    elif current_incident_type == IncidentType.DATABASE_TIMEOUT:
        print("[GitHub Mock] Returning database timeout relevant PRs.")
        return jsonify([
            {
                "number": 405,
                "title": "feat(db): Increase connection pool size for order service",
                "state": "closed",
                "merged_at": "2026-06-07T08:15:00Z",
                "html_url": f"https://github.com/{owner}/{repo}/pull/405",
                "diff_summary": "Modified hikari.properties. Increased connection pool from 15 to 20. Kept timeout at 30s."
            }
        ])
    
    elif current_incident_type == IncidentType.MEMORY_LEAK:
        print("[GitHub Mock] Returning memory leak relevant PRs.")
        return jsonify([
            {
                "number": 408,
                "title": "refactor(gateway): Move to G1GC and tune heap settings",
                "state": "closed",
                "merged_at": "2026-06-06T16:00:00Z",
                "html_url": f"https://github.com/{owner}/{repo}/pull/408",
                "diff_summary": "Modified JVM startup parameters. Switched to G1GC collector. Set Xmx=2G, Xms=1G."
            }
        ])
    
    return jsonify([])