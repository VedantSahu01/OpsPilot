# OpsPilot

Monitoring and Incident Response

## Project Overview

**OpsPilot** is an incident response automation prototype built for hackathon submission. It combines AI-powered diagnosis, observability query tooling, and an incident management UI into one full-stack demo.

The repository contains three coordinated layers:
- Python AI pipeline and trigger API (`src/`)
- Mock observability services (`mock_server/`)
- Production-style backend and React frontend UI (`backend/` and `frontend/`)

This README summarizes the end-to-end architecture and usage, while the inner service folders contain their own detailed docs.

## Team Introduction

- **Vedant Sahu** — Backend Software Engineer (~4 years). Worked on the Trigger and AI Agent components.
- **Aniket Jas** — Full-stack Software Engineer (~3 years). Worked on the Backend and Frontend.

## What Problem Does OpsPilot Solve?

Current monitoring and incident reporting is largely manual and consumes valuable on-call engineering time. Typical pain points include:
- Manual triage and runbook lookups when alerts fire
- Difficulty correlating metrics, logs, and recent code changes quickly
- High operational scale (many services/regions) increases cognitive load
- Incidents during off-hours slow down response and escalation

OpsPilot automates the initial investigation step: accept an alert description, query telemetry sources, synthesize evidence, and produce an actionable Root Cause Analysis (RCA) payload.

## Solution Overview

To overcome the manual triage burden we created an AI-driven investigation service that identifies incidents and publishes structured RCA reports. Key ideas:
- LLMs can efficiently scan large telemetry and log volumes
- LLMs can correlate signals across logs, metrics, and repo changes to form evidence-backed hypotheses
- The prototype performs read-only analysis only (no destructive actions) to simplify safety

Core components:
- **Trigger** — scheduler, cron, or GitHub Action that invokes the pipeline on-demand or periodically
- **AI Agent** — a LangGraph/LangChain-driven graph agent that iteratively calls tools (Prometheus, Kibana, GitHub) until it gathers enough evidence
- **Callback** — structured POST to the incident backend when an active incident is detected
- **Backend** — Node/Express API with MongoDB for CRUD and archival of incidents (`backend/`)
- **Frontend** — React + Vite dashboard for viewing RCAs and incident archive (`frontend/`)

### Root AI Prototype

The root Python service is the core automation engine:
- `src/agent.py` — defines the OpsPilot SRE persona, tool invocation loop, and structured RCA schema
- `src/pipeline.py` — command-line/entrypoint logic, environment loader, and output writer
- `src/server.py` — Flask API exposing `/trigger` and `/health`, plus callback delivery to a configured backend
- `src/tools.py` — tool wrappers for Prometheus, Kibana, GitHub file fetch, and PR fetch
- `src/state.py` — typed state schema
- `mock_server/` — local mock services that simulate observability APIs used by OpsPilot
- `sample-response.json` — example pipeline output saved after a trigger run

Note: the trigger can be invoked manually, via the included GitHub Action workflow, or scheduled as a cron job. See `.github/workflows/ops-pilot-trigger.yml` for the action.

### Backend and Frontend

The repository also includes a production-style incident management stack:
- `backend/` — Node.js Express incident management API with MongoDB persistence
- `frontend/` — React + Vite UI that queries the backend and shows incident archives

Refer to the internal docs for those services:
- `backend/README.md`
- `frontend/README.md`

### Architecture Diagram

See `HLD.png` for the visual architecture diagram.

## AI Integration Details

OpsPilot uses generative AI through the LangGraph/LangChain workflow in `src/agent.py`.

The AI is responsible for:
- evaluating incoming incident trigger context
- deciding which tools should be queried next
- iterating over telemetry and code evidence
- synthesizing a final structured RCA payload with `pydantic`

The final output is typed as an `RCAPayload` and includes:
- `is_incident` — incident detected or healthy state
- `heading` — concise incident title
- `summary` — root cause analysis and impact summary
- `sources` — evidence items from Prometheus, Kibana, and GitHub

## How the Pipeline Works

1. `src/server.py` receives a `POST /trigger` request.
2. `src/pipeline.py` builds an `AgentState` and runs the `ops_pilot_agent` graph.
3. The model may call tools from `src/tools.py` to query `mock_server/`.
4. When the agent decides it has enough information, it finalizes the RCA.
5. The payload is written to `sample-response.json` and returned via API.
6. If configured, the payload is optionally posted to `FRONTEND_BACKEND_URL`.

## Setup Instructions

### 1. Python AI Prototype

1. Create and activate a Python virtual environment.
2. Install the root Python dependencies:

```powershell
cd c:\Users\vedan\Documents\OpsPilot
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

3. Create a `.env` file at repository root with values like:

```env
GOOGLE_API_KEY=your_google_api_key_here
MOCK_SERVER_URL=http://127.0.0.1:5001
FRONTEND_BACKEND_URL=http://localhost:3000
FRONTEND_BACKEND_AUTH=
API_PORT=8000
```

4. Start the mock observability server:

```powershell
python mock_server/main.py
```

5. Start the OpsPilot trigger API server:

```powershell
python -m src.server
```

### 2. Backend Incident API

Follow the detailed backend setup in `backend/README.md`.

In short:
- install Node dependencies with `npm install`
- configure `.env` for MongoDB
- run `npm run seed` to populate sample incidents
- start with `npm run dev` or `npm start`

### 3. Frontend Dashboard

See `frontend/README.md` for full UI setup.

In summary:
- install dependencies with `npm install`
- set `VITE_API_BASE_URL` to your backend API URL
- start with `npm run dev`

## Running the Full Demo

A complete end-to-end demo includes:
1. Starting `mock_server/main.py`
2. Starting the Python AI trigger API (`python -m src.server`)
3. Starting the Node.js backend service in `backend/`
4. Starting the React frontend in `frontend/`
5. Triggering `/trigger` and observing the UI update via the callback flow

## Example Trigger

```powershell
curl -X POST http://127.0.0.1:8000/trigger \
  -H "Content-Type: application/json" \
  -d "{ \"incident_context\": \"High error rate alert detected in checkout-service\" }"
```

Expected behavior:
- the AI pipeline runs
- a structured RCA payload is produced
- `sample-response.json` is updated
- if callback is configured, the backend receives the incident payload

## Repository Contents

- `src/` — OpsPilot AI toolchain, server, and pipeline entrypoint
- `mock_server/` — simulated Prometheus, Kibana, GitHub services
- `backend/` — production-style incident management API
- `frontend/` — React dashboard for viewing incidents
- `requirements.txt` — Python dependency list
- `HLD.png` — architecture diagram
- `sample-response.json` — persisted RCA payload example

## Notes on Inner Readmes

For more detailed backend and frontend instructions, refer to:
- `backend/README.md`
- `frontend/README.md`

These files include service-specific environment setup, commands, and architecture details.