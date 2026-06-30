import math
from typing import Annotated, Any, Literal

from fastapi import Depends, HTTPException
from pydantic import BaseModel
from reactivex import operators as rxops

from api_server.fast_io import FastIORouter, SubscriptionRequest
from api_server.gateway import RmfGateway, get_rmf_gateway
from api_server.rmf_io import get_mission_events

router = FastIORouter(tags=["Missions"])


class MissionCommandRequest(BaseModel):
    mission_id: str
    command: Literal[
        "start",
        "pause",
        "resume",
        "abort",
        "pause_robot",
        "resume_robot",
        "set_speed_scale",
    ]
    robot_id: str | None = None
    scale: Any = None


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


@router.post("/current/command")
def post_current_mission_command(
    command: MissionCommandRequest,
    rmf_gateway: Annotated[RmfGateway, Depends(get_rmf_gateway)],
):
    if (
        command.command in ("pause_robot", "resume_robot", "set_speed_scale")
        and command.robot_id is None
    ):
        raise HTTPException(status_code=422, detail="robot_id is required")
    if command.command == "set_speed_scale":
        if (
            isinstance(command.scale, bool)
            or not isinstance(command.scale, (int, float))
            or not math.isfinite(command.scale)
            or not 0.3 <= command.scale <= 1.0
        ):
            raise HTTPException(
                status_code=422,
                detail="scale must be a number from 0.3 to 1.0",
            )

        state = get_mission_events().mission_state.value or {}
        robot_ids = {
            robot.get("id")
            for robot in state.get("robots", [])
            if isinstance(robot, dict)
        }
        if command.robot_id not in robot_ids:
            raise HTTPException(status_code=422, detail="invalid robot_id")
    rmf_gateway.publish_mission_command(
        command.mission_id,
        command.command,
        command.robot_id,
        command.scale,
    )
    return {"accepted": True}
