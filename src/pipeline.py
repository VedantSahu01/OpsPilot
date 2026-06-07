import os
import sys
import time
import argparse
import logging
from pathlib import Path
from dotenv import load_dotenv

project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from src.agent import ops_pilot_agent
from src.state import AgentState


def load_environment() -> None:
    project_root = Path(__file__).resolve().parent.parent
    dotenv_path = project_root / ".env"
    load_dotenv(dotenv_path=dotenv_path)


def build_agent_state(incident_context: str) -> AgentState:
    return {
        "messages": [],
        "incident_context": incident_context,
        "rca_payload": None,
    }


def execute_ops_pilot(state: AgentState) -> dict:
    result = ops_pilot_agent.invoke(state)
    if isinstance(result, dict) and result.get("rca_payload") is not None:
        return result["rca_payload"]
    if state.get("rca_payload") is not None:
        return state["rca_payload"]
    return result if isinstance(result, dict) else {}


def run_once(incident_context: str) -> dict:
    logging.info("[Pipeline] Starting OpsPilot investigation run")
    state = build_agent_state(incident_context)
    rca_payload = execute_ops_pilot(state)
    logging.info("[Pipeline] OpsPilot run completed")
    return rca_payload


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="OpsPilot pipeline entrypoint. Triggers the agent and collects the structured RCA."
    )

    parser.add_argument(
        "--incident-context",
        type=str,
        default=os.getenv("INCIDENT_CONTEXT", "High error rate alert detected in checkout-service."),
        help="Incident trigger description passed to OpsPilot.",
    )
    parser.add_argument(
        "--interval-minutes",
        type=int,
        default=int(os.getenv("TRIGGER_INTERVAL_MINUTES", "0")),
        help="If greater than 0, run OpsPilot repeatedly every N minutes.",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run a single investigation loop and exit.",
    )
    parser.add_argument(
        "--output-json",
        type=str,
        default=os.getenv("RCA_OUTPUT_PATH", ""),
        help="Optional path to write the final RCA payload as JSON.",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug logging.",
    )
    return parser.parse_args()


def write_output(payload: dict, path: str) -> None:
    if not path:
        return
    try:
        import json

        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        logging.info(f"[Pipeline] RCA payload written to {path}")
    except Exception as exc:
        logging.warning(f"[Pipeline] Failed to write RCA payload to {path}: {exc}")


def main() -> None:
    load_environment()
    args = parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.debug else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )

    if args.once or args.interval_minutes <= 0:
        payload = run_once(args.incident_context)
        write_output(payload, args.output_json)
        print(payload)
        return

    interval_seconds = args.interval_minutes * 60
    logging.info(f"[Pipeline] Running OpsPilot every {args.interval_minutes} minute(s)")

    while True:
        payload = run_once(args.incident_context)
        write_output(payload, args.output_json)
        print(payload)
        logging.info(f"[Pipeline] Sleeping for {args.interval_minutes} minute(s)")
        time.sleep(interval_seconds)


if __name__ == "__main__":
    main()
