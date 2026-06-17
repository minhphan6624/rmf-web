from typing import Any

from fastapi import HTTPException
from reactivex import operators as rxops

from api_server.fast_io import FastIORouter, SubscriptionRequest
from api_server.rmf_io import get_mission_events

router = FastIORouter(tags=["Missions"])


def _current_or_404(value: dict | None):
    if value is None:
        raise HTTPException(status_code=404, detail="mission data is not available")
    return value


@router.get("/current/state", response_model=dict[str, Any])
async def get_current_mission_state():
    """
    Current compact mission dashboard state.
    """

    return _current_or_404(get_mission_events().mission_state.value)


@router.sub("/current/state")
def sub_current_mission_state(_req: SubscriptionRequest):
    """
    Available in socket.io.
    """

    return get_mission_events().mission_state.pipe(
        rxops.filter(lambda x: x is not None)
    )


@router.get("/current/debug_state", response_model=dict[str, Any])
async def get_current_mission_debug_state():
    """
    Current verbose mission debug state.
    """

    return _current_or_404(get_mission_events().mission_debug_state.value)


@router.sub("/current/debug_state")
def sub_current_mission_debug_state(_req: SubscriptionRequest):
    """
    Available in socket.io.
    """

    return get_mission_events().mission_debug_state.pipe(
        rxops.filter(lambda x: x is not None)
    )


@router.sub("/current/events")
def sub_current_mission_events(_req: SubscriptionRequest):
    """
    Available in socket.io.
    """

    return get_mission_events().mission_events
