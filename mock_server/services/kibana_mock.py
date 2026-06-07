from flask import Blueprint, request, jsonify

kibana_bp = Blueprint('kibana', __name__)

@kibana_bp.route('/elasticsearch/_search', methods=['POST'])
def logs_search():
    body = request.get_json() or {}
    query = body.get("query", "")
    print(f"[Kibana Mock] Searching logs for query: {query}")
    
    if any(k in str(query).lower() for k in ["error", "checkout", "exception"]):
        return jsonify({
            "hits": {
                "total": {"value": 2, "relation": "eq"},
                "hits": [
                    {
                        "_source": {
                            "@timestamp": "2026-06-07T08:45:12Z",
                            "log.level": "ERROR",
                            "service.name": "checkout-service",
                            "message": "Failed to process checkout transaction",
                            "error.stack_trace": "redis.clients.jedis.exceptions.JedisConnectionException: Could not get a resource from the pool\n at redis.clients.jedis.util.Pool.getResource"
                        }
                    },
                    {
                        "_source": {
                            "@timestamp": "2026-06-07T08:45:15Z",
                            "log.level": "ERROR",
                            "service.name": "checkout-service",
                            "message": "Pool exhaustion detected. Active connections: 50, Idle connections: 0",
                            "error.stack_trace": "redis.clients.jedis.exceptions.JedisConnectionException: Timeout waiting for idle object in pool"
                        }
                    }
                ]
            }
        })
    return jsonify({"hits": {"total": {"value": 0, "relation": "eq"}, "hits": []}})