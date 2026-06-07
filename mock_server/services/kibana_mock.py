from flask import Blueprint, request, jsonify
from .incident_manager import is_incident_active, get_current_incident_type, IncidentType

kibana_bp = Blueprint('kibana', __name__)

@kibana_bp.route('/elasticsearch/_search', methods=['POST'])
def logs_search():
    body = request.get_json() or {}
    query = body.get("query", "")
    print(f"[Kibana Mock] Searching logs for query: {query}")
    
    # Check if incident is active
    incident_active = is_incident_active()
    current_incident_type = get_current_incident_type()
    
    if not incident_active:
        # No incident - return no error logs
        print("[Kibana Mock] No incident active. Returning no error logs.")
        return jsonify({"hits": {"total": {"value": 0, "relation": "eq"}, "hits": []}})
    
    # Incident is active - return incident-specific logs
    if any(k in str(query).lower() for k in ["error", "checkout", "exception"]):
        
        if current_incident_type == IncidentType.REDIS_POOL_EXHAUSTION:
            print("[Kibana Mock] Returning Redis pool exhaustion logs.")
            return jsonify({
                "hits": {
                    "total": {"value": 2, "relation": "eq"},
                    "hits": [
                        {
                            "_source": {
                                "@timestamp": "2026-06-07T13:45:12Z",
                                "log.level": "ERROR",
                                "service.name": "checkout-service",
                                "message": "Failed to process checkout transaction",
                                "error.stack_trace": "redis.clients.jedis.exceptions.JedisConnectionException: Could not get a resource from the pool\n at redis.clients.jedis.util.Pool.getResource"
                            }
                        },
                        {
                            "_source": {
                                "@timestamp": "2026-06-07T13:45:15Z",
                                "log.level": "ERROR",
                                "service.name": "checkout-service",
                                "message": "Pool exhaustion detected. Active connections: 50, Idle connections: 0",
                                "error.stack_trace": "redis.clients.jedis.exceptions.JedisConnectionException: Timeout waiting for idle object in pool"
                            }
                        }
                    ]
                }
            })
        
        elif current_incident_type == IncidentType.DATABASE_TIMEOUT:
            print("[Kibana Mock] Returning database timeout logs.")
            return jsonify({
                "hits": {
                    "total": {"value": 2, "relation": "eq"},
                    "hits": [
                        {
                            "_source": {
                                "@timestamp": "2026-06-07T13:45:12Z",
                                "log.level": "ERROR",
                                "service.name": "order-service",
                                "message": "Database connection timeout on INSERT",
                                "error.stack_trace": "org.postgresql.util.PSQLException: ERROR: connection timeout\n at org.postgresql.core.v3.QueryExecutorImpl.execute"
                            }
                        },
                        {
                            "_source": {
                                "@timestamp": "2026-06-07T13:45:15Z",
                                "log.level": "ERROR",
                                "service.name": "order-service",
                                "message": "Max connection pool exhausted",
                                "error.stack_trace": "com.zaxxer.hikari.pool.HikariPool: HikariPool-1 - Connection is not available, request timed out after 30000ms."
                            }
                        }
                    ]
                }
            })
        
        elif current_incident_type == IncidentType.MEMORY_LEAK:
            print("[Kibana Mock] Returning memory leak logs.")
            return jsonify({
                "hits": {
                    "total": {"value": 2, "relation": "eq"},
                    "hits": [
                        {
                            "_source": {
                                "@timestamp": "2026-06-07T13:45:12Z",
                                "log.level": "WARN",
                                "service.name": "api-gateway",
                                "message": "High memory usage detected. Heap at 95%",
                                "error.stack_trace": "java.lang.OutOfMemoryError: Java heap space\n at java.util.Arrays.copyOf"
                            }
                        },
                        {
                            "_source": {
                                "@timestamp": "2026-06-07T13:45:15Z",
                                "log.level": "ERROR",
                                "service.name": "api-gateway",
                                "message": "Container killed due to OOM",
                                "error.stack_trace": "docker: Error response from daemon: OOMKilled"
                            }
                        }
                    ]
                }
            })
    
    return jsonify({"hits": {"total": {"value": 0, "relation": "eq"}, "hits": []}})