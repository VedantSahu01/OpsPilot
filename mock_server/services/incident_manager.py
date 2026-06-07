"""
Incident Manager for Mock Server

Determines what incident response should be returned based on:
1. Current time (1-2 PM = incident, otherwise no incident)
2. Day of week (determines incident type)
"""

from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any

class IncidentType(str, Enum):
    REDIS_POOL_EXHAUSTION = "redis_pool_exhaustion"
    DATABASE_TIMEOUT = "database_timeout"
    MEMORY_LEAK = "memory_leak"
    NONE = "none"


def get_current_incident_type() -> IncidentType:
    """
    Determines the incident type based on the current day of the week.
    
    Monday: Redis pool exhaustion
    Tuesday: Database timeout
    Wednesday: Memory leak
    Thursday-Sunday: No incident (returns NONE)
    """
    now = datetime.now()
    day_of_week = now.weekday()  # 0=Monday, 6=Sunday
    # return IncidentType.DATABASE_TIMEOUT
    if day_of_week == 0:  # Monday
        return IncidentType.REDIS_POOL_EXHAUSTION
    elif day_of_week == 1:  # Tuesday
        return IncidentType.DATABASE_TIMEOUT
    elif day_of_week == 2:  # Wednesday
        return IncidentType.MEMORY_LEAK
    else:  # Thursday-Sunday
        return IncidentType.NONE


def should_return_incident() -> bool:
    """
    Determines if an incident should be returned based on current time.
    
    Returns True during 1-2 PM (13:00-14:00), False otherwise.
    """
    now = datetime.now()
    current_hour = now.hour
    # return true
    return current_hour == 13  # 1 PM (13:00-13:59)


def is_incident_active() -> bool:
    """
    Main decision function: returns True if an incident should be active.
    
    True if:
    - Current time is 1-2 PM (13:00-14:00)
    - AND day is Monday, Tuesday, or Wednesday
    """
    return should_return_incident() and get_current_incident_type() != IncidentType.NONE
