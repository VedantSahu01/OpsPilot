from flask import Blueprint, request, jsonify
import time

prometheus_bp = Blueprint('prometheus', __name__)

@prometheus_bp.route('/api/v1/query_range', methods=['GET'])
def query_range():
    query = request.args.get('query', '')
    print(f"[Prometheus Mock] Received query: {query}")
    
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
    return jsonify({"status": "success", "data": {"resultType": "matrix", "result": []}})