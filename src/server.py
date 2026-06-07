import os
import logging
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, request
import requests

from src.pipeline import DEFAULT_OUTPUT_JSON, run_once, write_output, load_environment

load_environment()

app = Flask(__name__)

FRONTEND_BACKEND_URL = os.getenv("FRONTEND_BACKEND_URL", "").strip()
FRONTEND_BACKEND_AUTH = os.getenv("FRONTEND_BACKEND_AUTH", "").strip()


def build_incident_payload(rca_payload: dict[str, Any]) -> dict[str, Any]:
    """Normalize agent output into the backend incident creation payload."""
    return {
        "heading": rca_payload.get("heading", "No incident detected"),
        "summary": rca_payload.get(
            "summary",
            "The agent completed a health check and did not find an active incident."
        ),
        "sources": rca_payload.get("sources", []),
    }


def send_rca_to_frontend(rca_payload: dict[str, Any], incident_context: str, output_path: str) -> Any:
    if not FRONTEND_BACKEND_URL:
        logging.info("[Server] FRONTEND_BACKEND_URL is not configured; skipping frontend callback.")
        return None

    if not rca_payload.get("is_incident", False):
        logging.info("[Server] is_incident=false; skipping backend incident creation callback.")
        return None

    headers = {"Content-Type": "application/json"}
    if FRONTEND_BACKEND_AUTH:
        headers["Authorization"] = f"Bearer {FRONTEND_BACKEND_AUTH}"

    body = build_incident_payload(rca_payload)

    response = requests.post(FRONTEND_BACKEND_URL, json=body, headers=headers, timeout=15)
    response.raise_for_status()
    try:
        return response.json()
    except ValueError:
        return response.text


@app.route("/health", methods=["GET"])
def health() -> tuple[dict[str, str], int]:
    return {"status": "ok"}, 200


@app.route("/trigger", methods=["POST"])
def trigger() -> tuple[dict[str, Any], int]:
    request_data = request.get_json(silent=True) or {}
    incident_context = request_data.get(
        "incident_context",
        os.getenv("INCIDENT_CONTEXT", "High error rate alert detected in checkout-service."),
    )
    output_json = request_data.get(
        "output_json",
        os.getenv("RCA_OUTPUT_PATH", str(DEFAULT_OUTPUT_JSON)),
    )

    try:
        rca_payload = run_once(incident_context)
        write_output(rca_payload, output_json)
        callback_response = send_rca_to_frontend(rca_payload, incident_context, output_json)

        return {
            "status": "success",
            "output_path": output_json,
            "frontend_callback": callback_response,
            "rca_payload": rca_payload,
        }, 200
    except requests.exceptions.RequestException as exc:
        logging.exception("[Server] Frontend callback failed.")
        return {"status": "error", "message": str(exc)}, 502
    except Exception as exc:
        logging.exception("[Server] Pipeline execution failed.")
        return {"status": "error", "message": str(exc)}, 500


if __name__ == "__main__":
    port = int(os.getenv("API_PORT", "8000"))
    app.run(host="0.0.0.0", port=port)
