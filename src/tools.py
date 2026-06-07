import os
import requests
import json
from langchain_core.tools import tool
from dotenv import load_dotenv

# Load environment variables to read the local mock server URL
load_dotenv()
MOCK_SERVER_URL = os.getenv("MOCK_SERVER_URL", "http://127.0.0.1:5001")

@tool
def fetch_prometheus_metrics(query: str) -> str:
    """
    Queries the Prometheus HTTP API for time-series infrastructure metrics.
    Use this tool when you need to track error rates, throughput spikes, 
    or check status codes (like 500 spikes) for a given microservice.
    """
    url = f"{MOCK_SERVER_URL}/api/v1/query_range"
    params = {"query": query}
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return json.dumps(response.json())
        return f"Prometheus returned error code: {response.status_code}"
    except Exception as e:
        return f"Failed to connect to Prometheus: {str(e)}"


@tool
def search_kibana_logs(search_string: str) -> str:
    """
    Queries Elasticsearch/Kibana logs to find application log entries.
    Use this tool once you identify a problematic service or time window 
    to scan stack traces, exceptions, and error level logs.
    """
    url = f"{MOCK_SERVER_URL}/elasticsearch/_search"
    payload = {"query": search_string}
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            return json.dumps(response.json())
        return f"Kibana returned error code: {response.status_code}"
    except Exception as e:
        return f"Failed to connect to Kibana: {str(e)}"


@tool
def get_github_file(path: str) -> str:
    """
    Retrieves static architecture or configuration files from the code repository.
    Use this tool to parse system blueprints, setup parameters, or runbooks 
    (e.g., searching for 'architecture.md' or 'openapi.yaml').
    """
    url = f"{MOCK_SERVER_URL}/repos/internal-ops/checkout-service/contents/{path}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return json.dumps(response.json())
        return f"GitHub file read failed with code: {response.status_code}"
    except Exception as e:
        return f"Failed to connect to GitHub Content API: {str(e)}"


@tool
def get_github_recent_prs() -> str:
    """
    Retrieves a list of recent closed or merged Pull Requests from the repository.
    Use this tool to investigate recent code changes deployment windows 
    that might correlate with an ongoing operational incident or infrastructure failure.
    """
    url = f"{MOCK_SERVER_URL}/repos/internal-ops/checkout-service/pulls"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return json.dumps(response.json())
        return f"GitHub PR fetch failed with code: {response.status_code}"
    except Exception as e:
        return f"Failed to connect to GitHub PR API: {str(e)}"

# A simple list grouping our tools so we can bind them to the LLM easily later
ALL_OPS_TOOLS = [
    fetch_prometheus_metrics,
    search_kibana_logs,
    get_github_file,
    get_github_recent_prs
]