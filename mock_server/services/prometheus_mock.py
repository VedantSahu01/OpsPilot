from flask import Blueprint, request, jsonify
import time
from .incident_manager import is_incident_active, get_current_incident_type, IncidentType

prometheus_bp = Blueprint('prometheus', __name__)

@prometheus_bp.route('/api/v1/query_range', methods=['GET'])
def query_range():
    query = request.args.get('query', '')
    print(f"[Prometheus Mock] Received query: {query}")
    
    # Check if incident is active
    incident_active = is_incident_active()
    current_incident_type = get_current_incident_type()
    
    if not incident_active:
        # No incident - return healthy metrics
        print("[Prometheus Mock] No incident active. Returning healthy metrics.")
        if "http_requests_total" in query or "error" in query.lower():
            return jsonify({
                "status": "success",
                "data": {
                    "resultType": "matrix",
                    "result": [{
                        "metric": {
                            "__name__": "http_requests_total",
                            "job": "checkout-service",
                            "status": "200",
                            "method": "POST",
                            "handler": "/api/v1/checkout"
                        },
                        "values": [
                            [int(time.time()) - 360, "120"],
                            [int(time.time()) - 240, "125"],
                            [int(time.time()) - 120, "128"],
                            [int(time.time()), "124"]
                        ]
                    }]
                }
            })
        return jsonify({"status": "success", "data": {"resultType": "matrix", "result": []}})
    
    # Incident is active - return incident-specific metrics
    if current_incident_type == IncidentType.REDIS_POOL_EXHAUSTION:
        print("[Prometheus Mock] Returning Redis pool exhaustion metrics.")
        if "http_requests_total" in query or "error" in query.lower():
            return jsonify({
                "status": "success",
                "data": {
                    "resultType": "matrix",
                    "result": [{
                        "metric": {
                            "__name__": "http_requests_total",
                            "job": "checkout-service",
                            "status": "500",
                            "method": "POST",
                            "handler": "/api/v1/checkout"
                        },
                        "values": [
                            [int(time.time()) - 360, "82"],
                            [int(time.time()) - 240, "245"],
                            [int(time.time()) - 120, "510"],
                            [int(time.time()), "498"]
                        ]
                    }]
                }
            })
    
    elif current_incident_type == IncidentType.DATABASE_TIMEOUT:
        print("[Prometheus Mock] Returning database timeout metrics.")
        if "latency" in query.lower() or "duration" in query.lower():
            return jsonify({
                "status": "success",
                "data": {
                    "resultType": "matrix",
                    "result": [{
                        "metric": {
                            "__name__": "db_query_duration_ms",
                            "job": "order-service",
                            "operation": "INSERT"
                        },
                        "values": [
                            [int(time.time()) - 360, "250"],
                            [int(time.time()) - 240, "2500"],
                            [int(time.time()) - 120, "5800"],
                            [int(time.time()), "6200"]
                        ]
                    }]
                }
            })
    
    elif current_incident_type == IncidentType.MEMORY_LEAK:
        print("[Prometheus Mock] Returning memory leak metrics.")
        if "memory" in query.lower() or "heap" in query.lower():
            return jsonify({
                "status": "success",
                "data": {
                    "resultType": "matrix",
                    "result": [{
                        "metric": {
                            "__name__": "jvm_memory_usage_bytes",
                            "job": "api-gateway",
                            "type": "heap"
                        },
                        "values": [
                            [int(time.time()) - 360, "1800000000"],
                            [int(time.time()) - 240, "2100000000"],
                            [int(time.time()) - 120, "2400000000"],
                            [int(time.time()), "2700000000"]
                        ]
                    }]
                }
            })
    
    return jsonify({"status": "success", "data": {"resultType": "matrix", "result": []}})