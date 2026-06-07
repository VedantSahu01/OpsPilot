from typing import TypedDict, Annotated, Sequence, Optional, Dict, Any
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """
    Represents the internal state shared across all nodes in the OpsPilot execution graph.
    """
    # Tracks the full chat/execution history between Gemini and the tools
    messages: Annotated[Sequence[BaseMessage], add_messages]
    
    # Stores the initial trigger description (e.g., "High error rate alert on checkout service")
    incident_context: str
    
    # The final highly structured RCA payload that will be transmitted to your backend/UI
    rca_payload: Optional[Dict[str, Any]]