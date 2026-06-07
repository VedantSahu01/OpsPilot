import os
from enum import Enum
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

# Import our custom state definition and the tool suite
from src.state import AgentState
from src.tools import ALL_OPS_TOOLS

# ==========================================
# 1. DEFINE STRUCTURED FRONTEND RCA SCHEMAS
# ==========================================

class SourceTypeEnum(str, Enum):
    PROMETHEUS = "PROMETHEUS"
    KIBANA = "KIBANA"
    GITHUB = "GITHUB"
    ARGO = "ARGO"

class RCASource(BaseModel):
    name: SourceTypeEnum = Field(
        description="The source system identifier. Dictates how the frontend renders this data."
    )
    description: Optional[str] = Field(
        None, 
        description="Contextual explanation explaining why this source item matters or what it proves."
    )
    data: Dict[str, Any] = Field(
        description="Dynamic JSON payload tailored for this source type (e.g. queries, chart metrics, code diffs, logs)."
    )

class RCAPayload(BaseModel):
    is_incident: bool = Field(
        description="Boolean flag indicating whether this response is for an active incident (True) or normal/healthy state (False)."
    )
    heading: str = Field(
        description="A concise, high-impact title identifying the root incident, or a confirmation message if no incident is detected."
    )
    summary: str = Field(
        description="A comprehensive engineering summary of the incident timeline, blast radius, and absolute root cause. If no incident, should confirm healthy system state."
    )
    sources: List[RCASource] = Field(
        description="A collection of structured sources containing exact operational telemetry used during triage. Empty list if no incident."
    )


# ==========================================
# 2. CORE SYSTEM PERSONALITY (THE SRE PROMPT)
# ==========================================

SRE_SYSTEM_PROMPT = """You are OpsPilot, an elite Autonomous Site Reliability Engineer (SRE). 
Your objective is to investigate incoming system alerts, diagnose the precise structural root cause, and compile an engineering Root Cause Analysis (RCA).

CRITICAL: You must first determine if an active incident exists:
- Query Prometheus for error rates, latency spikes, or anomalous metrics
- Query Kibana for error logs or exceptions
- If all systems are healthy (no errors, normal metrics, no exception logs), conclude there is NO INCIDENT and report the system as operational

If an incident exists, execute an iterative, step-by-step diagnostic strategy:
1. Locate the Blast Radius: Look at the incident trigger and extract metrics via Prometheus to isolate the exact microservice, HTTP error codes, and timeframe.
2. Inspect the Telemetry: Use discovered metrics context to look into Kibana application logs. Extract exact exceptions, stack traces, or systemic alerts.
3. Trace the Code/Architecture: Correlate exceptions with recent changes by scanning recent GitHub Pull Requests and codebase architecture documentation.

If NO INCIDENT is detected:
- Report all systems as healthy
- Provide an empty sources list
- Return is_incident=false in your final response

CRITICAL RULES:
- Never assume or guess. If you lack data, invoke your tools to fetch it.
- Continue looping through tools until you can either: (a) confirm healthy state OR (b) cleanly map a metric spike -> to an explicit log exception -> to a specific code configuration change.
- When you have compiled sufficient evidence, stop calling tools and provide your analysis."""


# ==========================================
# 3. GRAPH NODE DEFINITIONS
# ==========================================

# Initialize our core reasoning engine (Gemini 1.5 Pro handles tool tracing flawlessly)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    temperature=0.0,  # Keeping it deterministic for precise debugging
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# Bind our execution tools directly into Gemini's functional architecture
model_with_tools = llm.bind_tools(ALL_OPS_TOOLS)


def call_agent_brain(state: AgentState) -> Dict[str, Any]:
    """
    Evaluates the current state, appends context if it's the start, 
    and lets Gemini decide whether to execute a tool or finish.
    """
    current_messages = list(state["messages"])
    
    # Inject the system persona and initial alert context if the conversation just started
    if not current_messages:
        current_messages = [
            SystemMessage(content=SRE_SYSTEM_PROMPT),
            HumanMessage(content=f"ALERT INCOMING TRIGGER CONTEXT:\n{state['incident_context']}")
        ]
        response = model_with_tools.invoke(current_messages)
        # Persist the starting prompt messages in state so later turns keep full history.
        return {"messages": [*current_messages, response]}

    if not any(isinstance(m, SystemMessage) for m in current_messages):
        current_messages.insert(0, SystemMessage(content=SRE_SYSTEM_PROMPT))

    response = model_with_tools.invoke(current_messages)
    return {"messages": [response]}


def finalize_and_structure_rca(state: AgentState) -> Dict[str, Any]:
    """
    Executes a structured synthesis pass over the entire investigation history,
    forcing Gemini to map the text to our schema-validated RCAPayload model.
    """
    print("[Agent Node] Synthesizing final structured RCA for the frontend...")
    
    # Initialize a structured instance of the LLM using our Pydantic model
    structured_llm = llm.with_structured_output(RCAPayload)
    
    synthesis_prompt = (
        "Review the complete SRE investigation transcript provided below. "
        "Determine if an active incident exists or if the system is healthy. "
        "CRITICAL: Set is_incident=true ONLY if you found error logs, metric spikes, or exceptions. "
        "Set is_incident=false if all systems are healthy with no anomalies detected. "
        "\nIf incident exists: Extract all actionable metrics data, log stack traces, and relevant GitHub PR details. "
        "If NO incident: Set sources to empty list and provide a confirmation message in heading and summary. "
        "Ensure the 'data' fields within the sources are populated with rich structural objects "
        "(e.g. query strings, timestamps, matrix blocks) that a UI can chart or visualize.\n\n"
        f"INVESTIGATION HISTORY:\n{state['messages']}"
    )
    
    rca_result: RCAPayload = structured_llm.invoke(synthesis_prompt)
    
    # Save the native Pydantic/Dict format directly into our global state
    return {"rca_payload": rca_result.model_dump(mode="json")}


# ==========================================
# 4. CONDITIONAL ROUTING LOGIC
# ==========================================

def should_continue(state: AgentState) -> Literal["tools", "finalize"]:
    """
    Inspects the last message to determine whether the graph needs to loop
    back into infrastructure tools or pass over to the finalizer.
    """
    last_message = state["messages"][-1]
    
    # If the model injected functional tool calls, branch directly to the tool executor node
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        print(f"[Router] Agent requested tool calls: {[tc['name'] for tc in last_message.tool_calls]}")
        return "tools"
    
    # If no tool calls exist, the agent believes it has enough data to wrap up
    print("[Router] No tool calls requested. Moving to finalization node.")
    return "finalize"


# ==========================================
# 5. ASSEMBLE THE CYCLIC STATE GRAPH
# ==========================================

workflow = StateGraph(AgentState)

# Add our distinct execution steps as Graph Nodes
workflow.add_node("agent_brain", call_agent_brain)
workflow.add_node("tools_executor", ToolNode(ALL_OPS_TOOLS))
workflow.add_node("finalizer", finalize_and_structure_rca)

# Set the operational entrance checkpoint
workflow.set_entry_point("agent_brain")

# Configure the conditional cyclic loop
workflow.add_conditional_edges(
    "agent_brain",
    should_continue,
    {
        "tools": "tools_executor",
        "finalize": "finalizer"
    }
)

# Connect the tools execution block straight back to the reasoning brain
workflow.add_edge("tools_executor", "agent_brain")

# Close the graph execution when finalization completes
workflow.add_edge("finalizer", END)

# Compile everything into an executable application pipeline
ops_pilot_agent = workflow.compile()